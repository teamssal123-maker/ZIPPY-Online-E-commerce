import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.ts';
import { config } from '../src/config/index.ts';
import { resetDb } from '../src/store/db.ts';
import path from 'node:path';
import os from 'node:os';

const tmpFile = path.join(os.tmpdir(), `richman-test-${Date.now()}.json`);
(config as { dataFile: string }).dataFile = tmpFile;

const app = createApp();

before(() => {
  resetDb();
});

after(() => {
  resetDb();
});

test('health check', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.data.status, 'ok');
});

test('lists catalog products and categories', async () => {
  const products = await request(app).get('/api/products');
  assert.equal(products.status, 200);
  assert.ok(products.body.data.length > 0);

  const categories = await request(app).get('/api/categories');
  assert.equal(categories.status, 200);
  assert.ok(categories.body.data.length >= 7);
});

test('customer checkout flow with coupon and stock decrement', async () => {
  const guest = 'guest-test-1';
  const product = (await request(app).get('/api/products')).body.data[0];
  const size = product.sizes[0];
  const beforeStock = product.stock[size];

  const add = await request(app)
    .post('/api/cart/items')
    .set('x-guest-key', guest)
    .send({ productId: product.id, size, color: product.colors[0], quantity: 1 });
  assert.equal(add.status, 201);

  const coupon = await request(app)
    .post('/api/coupons/validate')
    .send({ code: 'RICHMAN10', subtotal: 20000 });
  assert.equal(coupon.body.data.success, true);

  const checkout = await request(app)
    .post('/api/checkout')
    .set('x-guest-key', guest)
    .send({
      customer: {
        fullName: 'Test Patron',
        email: 'test.patron@example.com',
        phone: '+880 1712000000',
        division: 'Dhaka',
        district: 'Dhaka City',
        address: 'House 1, Road 1, Gulshan'
      },
      paymentMethod: 'COD',
      couponCode: 'RICHMAN10',
      shippingLocation: 'inside_dhaka'
    });
  assert.equal(checkout.status, 201);
  assert.ok(checkout.body.data.orderNumber.startsWith('RM-'));
  assert.equal(checkout.body.data.paymentStatus, 'PENDING');

  const updated = (await request(app).get(`/api/products/${product.id}`)).body.data;
  assert.equal(updated.stock[size], beforeStock - 1);

  const track = await request(app).get(`/api/orders/track?q=${checkout.body.data.orderNumber}`);
  assert.equal(track.status, 200);
  assert.equal(track.body.data.orderNumber, checkout.body.data.orderNumber);
});

test('admin product and order management', async () => {
  const login = await request(app).post('/api/auth/login').send({
    email: 'admin@richmanbd.com',
    password: 'admin123'
  });
  assert.equal(login.status, 200);
  const token = login.body.data.token;

  const created = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Midnight Velvet Dinner Jacket',
      sku: 'RM-BLZ-TEST',
      categoryId: 'blazer',
      categoryName: 'Blazer & Suits',
      price: 18000
    });
  assert.equal(created.status, 201);

  const stats = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${token}`);
  assert.equal(stats.status, 200);
  assert.ok(stats.body.data.catalogCount >= 1);

  const orders = await request(app).get('/api/orders').set('Authorization', `Bearer ${token}`);
  assert.equal(orders.status, 200);
  const first = orders.body.data[0];
  const updated = await request(app)
    .patch(`/api/orders/${first.id}/status`)
    .set('Authorization', `Bearer ${token}`)
    .send({ status: 'PROCESSING' });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.data.status, 'PROCESSING');
});

test('rejects invalid login', async () => {
  const res = await request(app).post('/api/auth/login').send({
    email: 'admin@richmanbd.com',
    password: 'wrong'
  });
  assert.equal(res.status, 401);
});

test('v1 auth refresh and password reset', async () => {
  const login = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@richmanbd.com',
    password: 'admin123'
  });
  assert.equal(login.status, 200);
  assert.ok(login.body.data.refreshToken);
  assert.ok(login.body.data.accessToken);

  const refreshed = await request(app).post('/api/v1/auth/refresh').send({
    refreshToken: login.body.data.refreshToken
  });
  assert.equal(refreshed.status, 200);
  assert.ok(refreshed.body.data.token);

  const forgot = await request(app).post('/api/v1/auth/forgot-password').send({
    email: 'tahmid.rahman@example.com'
  });
  assert.equal(forgot.status, 200);
  assert.equal(forgot.body.data.accepted, true);
  assert.ok(forgot.body.data.resetToken);

  const reset = await request(app).post('/api/v1/auth/reset-password').send({
    token: forgot.body.data.resetToken,
    password: 'richman456'
  });
  assert.equal(reset.status, 200);

  const relogin = await request(app).post('/api/v1/auth/login').send({
    email: 'tahmid.rahman@example.com',
    password: 'richman456'
  });
  assert.equal(relogin.status, 200);
});

test('v1 cms catalog inventory banners and reports', async () => {
  const login = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@richmanbd.com',
    password: 'admin123'
  });
  const token = login.body.data.token;
  const auth = { Authorization: `Bearer ${token}` };

  const brands = await request(app).get('/api/v1/brands');
  assert.equal(brands.status, 200);
  assert.ok(brands.body.data.length >= 1);

  const createdBrand = await request(app).post('/api/v1/brands').set(auth).send({
    name: 'House Exclusive',
    website: 'https://richmanbd.com'
  });
  assert.equal(createdBrand.status, 201);

  const inventory = await request(app).get('/api/v1/inventory').set(auth);
  assert.equal(inventory.status, 200);
  assert.ok(inventory.body.data.length >= 1);

  const productId = inventory.body.data[0].productId;
  const stockIn = await request(app).post('/api/v1/inventory/stock-in').set(auth).send({
    productId,
    quantity: 4,
    note: 'Purchase restock'
  });
  assert.equal(stockIn.status, 201);

  const banner = await request(app).post('/api/v1/banners').set(auth).send({
    title: 'Eid Capsule',
    subtitle: 'Limited festive tailoring',
    imageDesktop: 'https://example.com/eid.jpg',
    buttonText: 'Shop Eid',
    buttonUrl: '/shop',
    position: 'hero'
  });
  assert.equal(banner.status, 201);
  const published = await request(app).post(`/api/v1/banners/${banner.body.data.id}/publish`).set(auth);
  assert.equal(published.status, 200);
  assert.equal(published.body.data.status, 'published');

  const page = await request(app).post('/api/v1/pages').set(auth).send({
    title: 'Warranty',
    type: 'warranty',
    content: '<p>Two-year construction warranty.</p>'
  });
  assert.equal(page.status, 201);

  const sales = await request(app).get('/api/v1/reports/sales').set(auth);
  assert.equal(sales.status, 200);
  assert.ok(sales.body.data.totals);

  const dashboard = await request(app).get('/api/v1/dashboard').set(auth);
  assert.equal(dashboard.status, 200);
  assert.ok(dashboard.body.data.total_products >= 1);

  const settings = await request(app).put('/api/v1/settings').set(auth).send({ whatsapp: '+8801711999999' });
  assert.equal(settings.status, 200);
  assert.equal(settings.body.data.whatsapp, '+8801711999999');
});

test('order delete option with stock restoration and route parity', async () => {
  const login = await request(app).post('/api/auth/login').send({
    email: 'admin@richmanbd.com',
    password: 'admin123'
  });
  assert.equal(login.status, 200);
  const auth = { Authorization: `Bearer ${login.body.data.token}` };

  // 1. Create a patron order
  const guest = `guest-delete-test-${Date.now()}`;
  const product = (await request(app).get('/api/products')).body.data[0];
  const size = product.sizes[0];
  const stockBeforeOrder = product.stock[size];

  await request(app)
    .post('/api/cart/items')
    .set('x-guest-key', guest)
    .send({ productId: product.id, size, color: product.colors[0], quantity: 2 });

  const checkout = await request(app)
    .post('/api/checkout')
    .set('x-guest-key', guest)
    .send({
      customer: {
        fullName: 'Delete Test Patron',
        email: 'patron.delete@example.com',
        phone: '+880 1799000000',
        division: 'Dhaka',
        district: 'Dhaka City',
        address: 'House 99, Road 99, Banani'
      },
      paymentMethod: 'COD',
      shippingLocation: 'inside_dhaka'
    });
  assert.equal(checkout.status, 201);
  const orderId = checkout.body.data.id;

  // Verify stock decremented by 2
  const productAfterOrder = (await request(app).get(`/api/products/${product.id}`)).body.data;
  assert.equal(productAfterOrder.stock[size], stockBeforeOrder - 2);

  // 2. Reject non-admin delete attempt
  const forbiddenDelete = await request(app).delete(`/api/v1/orders/${orderId}`);
  assert.equal(forbiddenDelete.status, 401);

  // 3. Admin deletes the order with restoreStock = true (default)
  const deleteRes = await request(app).delete(`/api/v1/orders/${orderId}`).set(auth);
  assert.equal(deleteRes.status, 200);
  assert.equal(deleteRes.body.data.deleted, true);

  // 4. Verify order is removed and cannot be fetched
  const getRes = await request(app).get(`/api/v1/orders/${orderId}`).set(auth);
  assert.equal(getRes.status, 404);

  // 5. Verify product stock was restored
  const productAfterDelete = (await request(app).get(`/api/products/${product.id}`)).body.data;
  assert.equal(productAfterDelete.stock[size], stockBeforeOrder);

  // 6. Test /api/orders/:id DELETE route parity for 404 on deleted order
  const parityNotFound = await request(app).delete(`/api/orders/${orderId}`).set(auth);
  assert.equal(parityNotFound.status, 404);
});
