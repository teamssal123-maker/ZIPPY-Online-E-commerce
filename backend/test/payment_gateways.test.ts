import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.ts';
import { config } from '../src/config/index.ts';
import { resetDb } from '../src/store/db.ts';
import path from 'node:path';
import os from 'node:os';

const tmpFile = path.join(os.tmpdir(), `richman-gateway-test-${Date.now()}.json`);
(config as { dataFile: string }).dataFile = tmpFile;

const app = createApp();
let adminToken = '';

before(async () => {
  resetDb();
  const loginRes = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@richmanbd.com',
    password: 'admin123'
  });
  adminToken = loginRes.body.data.token;
});

after(() => {
  resetDb();
});

test('Payment Gateway Management: List, Stats, and Details', async () => {
  // 1. List payment gateways
  const listRes = await request(app).get('/api/v1/payment-gateways');
  assert.equal(listRes.status, 200);
  assert.ok(Array.isArray(listRes.body.data));
  assert.ok(listRes.body.data.length >= 4);

  // Parity alias /api/payment-gateways
  const aliasRes = await request(app).get('/api/payment-gateways');
  assert.equal(aliasRes.status, 200);
  assert.equal(aliasRes.body.data.length, listRes.body.data.length);

  // 2. Gateway stats
  const statsRes = await request(app)
    .get('/api/v1/payment-gateways/stats')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(statsRes.status, 200);
  assert.ok(statsRes.body.data.totalGateways >= 4);
  assert.ok(statsRes.body.data.activeGateways >= 3);
  assert.ok(statsRes.body.data.gateways.length >= 4);

  // 3. Get single gateway
  const getRes = await request(app).get('/api/v1/payment-gateways/pm-bkash');
  assert.equal(getRes.status, 200);
  assert.equal(getRes.body.data.code, 'BKASH');
});

test('Payment Gateway Management: Gateway Credential Connection Tests', async () => {
  // Test bKash
  const bkashTest = await request(app)
    .post('/api/v1/payment-gateways/pm-bkash/test')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(bkashTest.status, 200);
  assert.equal(bkashTest.body.data.success, true);
  assert.equal(bkashTest.body.data.code, 'BKASH');

  // Test SSLCommerz
  const sslTest = await request(app)
    .post('/api/v1/payment-gateways/pm-sslcommerz/test-connection')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(sslTest.status, 200);
  assert.equal(sslTest.body.data.success, true);
  assert.equal(sslTest.body.data.code, 'SSLCOMMERZ');

  // Test COD
  const codTest = await request(app)
    .post('/api/v1/payment-gateways/pm-cod/test')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(codTest.status, 200);
  assert.equal(codTest.body.data.success, true);
});

test('Payment Gateway Management: Lifecycle (Create, Update, Toggle, Delete)', async () => {
  // 1. Create Rocket gateway
  const createRes = await request(app)
    .post('/api/v1/payment-gateways')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      code: 'ROCKET',
      name: 'DBBL Rocket Mobile Banking',
      type: 'mobile_banking',
      description: 'Dutch-Bangla Bank Rocket MFS checkout',
      instructions: 'Dial *322# or pay via Rocket App',
      status: 'active',
      testMode: true,
      accountNumber: '01712-3456789',
      merchantId: 'richman_rocket_merchant'
    });
  assert.equal(createRes.status, 201);
  const rocketId = createRes.body.data.id;
  assert.equal(createRes.body.data.code, 'ROCKET');

  // 2. Update credentials
  const updateRes = await request(app)
    .put(`/api/v1/payment-gateways/${rocketId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      accountNumber: '01899-0000000',
      description: 'Updated Rocket instructions'
    });
  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.data.accountNumber, '01899-0000000');

  // 3. Toggle gateway status
  const toggleRes = await request(app)
    .patch(`/api/v1/payment-gateways/${rocketId}/toggle`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(toggleRes.status, 200);
  assert.equal(toggleRes.body.data.status, 'inactive');

  // 4. Delete gateway
  const deleteRes = await request(app)
    .delete(`/api/v1/payment-gateways/${rocketId}`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(deleteRes.status, 200);
  assert.equal(deleteRes.body.data.deleted, true);
});

test('Payment Gateway Management: Initiate, Verify, Refund, and Webhooks', async () => {
  // 1. Create a checkout order
  const checkout = await request(app)
    .post('/api/v1/checkout')
    .send({
      customer: {
        fullName: 'Zubair Hossain',
        email: 'zubair@example.com',
        phone: '+8801700112233',
        division: 'Dhaka',
        district: 'Dhaka City',
        address: 'Banani Road 11'
      },
      paymentMethod: 'BKASH',
      items: [
        {
          id: 'item-1',
          productId: 'prod-01',
          product: {},
          size: 'M',
          color: { name: 'Midnight Navy', hex: '#0B132B' },
          quantity: 1,
          price: 24500
        }
      ]
    });
  assert.equal(checkout.status, 201);
  const orderId = checkout.body.data.id;

  // 2. Initiate Gateway Payment
  const initiateRes = await request(app)
    .post('/api/v1/payment-gateways/initiate')
    .send({
      orderId,
      gatewayCode: 'BKASH'
    });
  assert.equal(initiateRes.status, 200);
  assert.equal(initiateRes.body.data.success, true);
  assert.equal(initiateRes.body.data.gatewayCode, 'BKASH');
  assert.ok(initiateRes.body.data.redirectUrl.includes('checkout/pay'));
  const txnId = initiateRes.body.data.transactionId;

  // 3. Verify Payment
  const verifyRes = await request(app)
    .post('/api/v1/payment-gateways/verify')
    .send({
      transactionId: txnId,
      gatewayCode: 'BKASH'
    });
  assert.equal(verifyRes.status, 200);
  assert.equal(verifyRes.body.data.verified, true);
  assert.equal(verifyRes.body.data.payment.status, 'paid');
  assert.equal(verifyRes.body.data.order.paymentStatus, 'PAID');

  // 4. Webhook IPN Callback simulation (SSLCommerz)
  const ipnRes = await request(app)
    .post('/api/v1/payment-gateways/sslcommerz/ipn')
    .send({
      tran_id: txnId,
      val_id: 'SSL-VAL-99238',
      status: 'VALID',
      amount: 24500
    });
  assert.equal(ipnRes.status, 200);
  assert.equal(ipnRes.body.data.success, true);

  // 5. Process Gateway Refund
  const refundRes = await request(app)
    .post('/api/v1/payment-gateways/refund')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      transactionId: txnId,
      amount: 24500,
      reason: 'Customer return requested'
    });
  assert.equal(refundRes.status, 200);
  assert.equal(refundRes.body.data.refunded, true);
  assert.equal(refundRes.body.data.payment.status, 'refunded');
});
