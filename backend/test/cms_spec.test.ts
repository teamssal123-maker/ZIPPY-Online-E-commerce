import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.ts';
import { config } from '../src/config/index.ts';
import { resetDb } from '../src/store/db.ts';
import path from 'node:path';
import os from 'node:os';

const tmpFile = path.join(os.tmpdir(), `richman-spec-test-${Date.now()}.json`);
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

test('Specification: Roles, Permissions & Admins management', async () => {
  // 1. Get permissions matrix
  const permsRes = await request(app)
    .get('/api/v1/permissions')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(permsRes.status, 200);
  assert.ok(permsRes.body.data.products.includes('publish'));
  assert.ok(permsRes.body.data.inventory.includes('stock_adjustment'));

  // 2. Roles CRUD
  const listRoles = await request(app)
    .get('/api/v1/roles')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(listRoles.status, 200);
  assert.ok(listRoles.body.data.length >= 8);

  const createRole = await request(app)
    .post('/api/v1/roles')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'regional_supervisor',
      label: 'Regional Supervisor',
      permissions: ['products.view', 'inventory.view', 'orders.view']
    });
  assert.equal(createRole.status, 201);
  const newRoleId = createRole.body.data.id;

  const getRole = await request(app)
    .get(`/api/v1/roles/${newRoleId}`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(getRole.status, 200);
  assert.equal(getRole.body.data.label, 'Regional Supervisor');

  // 3. Admin detail
  const adminsRes = await request(app)
    .get('/api/v1/admins')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(adminsRes.status, 200);
  const firstAdminId = adminsRes.body.data[0].id;

  const getAdmin = await request(app)
    .get(`/api/v1/admins/${firstAdminId}`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(getAdmin.status, 200);
  assert.equal(getAdmin.body.data.id, firstAdminId);
});

test('Specification: Products, Images, Variants & Bulk Operations', async () => {
  // 1. Create product with full specification attributes
  const prodRes = await request(app)
    .post('/api/v1/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'Emperor Royal Silk Sherwani',
      sku: 'RM-SHER-001',
      barcode: '8941100234567',
      categoryId: 'panjabi',
      brandId: 'richman-atelier',
      price: 32000,
      salePrice: 28000,
      costPrice: 15000,
      tax: 1500,
      stockQuantity: 25,
      lowStockThreshold: 5,
      featured: true,
      bestSeller: true,
      trending: true,
      description: 'Master hand-stitched zardozi embroidery on pure Banarasi silk.',
      customAttributes: {
        warranty: 'Lifetime tailoring adjustments',
        country_of_origin: 'Bangladesh'
      }
    });
  assert.equal(prodRes.status, 201);
  const prodId = prodRes.body.data.id;

  // 2. Product Search & Filter
  const filterRes = await request(app).get('/api/v1/products?bestSeller=true&sort=price_desc');
  assert.equal(filterRes.status, 200);
  assert.ok(filterRes.body.data.some((p: { id: string }) => p.id === prodId));

  // 3. Bulk Update
  const bulkRes = await request(app)
    .post('/api/v1/products/bulk-update')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      ids: [prodId],
      updates: { trending: false }
    });
  assert.equal(bulkRes.status, 200);
  assert.equal(bulkRes.body.data.updatedCount, 1);

  // 4. Product Multiple Images
  const imgRes = await request(app)
    .post(`/api/v1/products/${prodId}/images`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      images: [
        { url: 'https://images.example.com/sherwani-front.jpg', altText: 'Front View' },
        { url: 'https://images.example.com/sherwani-back.jpg', altText: 'Back View' }
      ]
    });
  assert.equal(imgRes.status, 201);
  assert.equal(imgRes.body.data.length, 2);
  const primaryImgId = imgRes.body.data[1].id;

  // 5. Set Primary Image
  const setPrim = await request(app)
    .put(`/api/v1/products/${prodId}/images/${primaryImgId}/primary`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(setPrim.status, 200);
  assert.equal(setPrim.body.data.isPrimary, true);

  // 6. Variants Management
  const varRes = await request(app)
    .post(`/api/v1/products/${prodId}/variants`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      variantName: 'Deep Crimson / Gold Silk',
      sku: 'RM-SHER-001-CRMS',
      price: 28000,
      stockQuantity: 10,
      status: 'active'
    });
  assert.equal(varRes.status, 201);
  const varId = varRes.body.data.variantId;

  const listVars = await request(app).get(`/api/v1/products/${prodId}/variants`);
  assert.equal(listVars.status, 200);
  assert.ok(listVars.body.data.length >= 1);

  const getVar = await request(app).get(`/api/v1/variants/${varId}`);
  assert.equal(getVar.status, 200);
  assert.equal(getVar.body.data.variantName, 'Deep Crimson / Gold Silk');
});

test('Specification: Categories & Brands detailed endpoints', async () => {
  // Category detail & products
  const catRes = await request(app).get('/api/v1/categories/blazer');
  assert.equal(catRes.status, 200);
  assert.equal(catRes.body.data.id, 'blazer');

  const catProds = await request(app).get('/api/v1/categories/blazer/products');
  assert.equal(catProds.status, 200);
  assert.ok(Array.isArray(catProds.body.data));

  // Category visibility toggle
  const toggleRes = await request(app)
    .patch('/api/v1/categories/blazer/visibility')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ active: true });
  assert.equal(toggleRes.status, 200);
  assert.equal(toggleRes.body.data.status, 'active');

  // Brand products
  const brands = await request(app).get('/api/v1/brands');
  assert.equal(brands.status, 200);
  if (brands.body.data.length > 0) {
    const brandId = brands.body.data[0].id;
    const bDetail = await request(app).get(`/api/v1/brands/${brandId}`);
    assert.equal(bDetail.status, 200);

    const bProds = await request(app).get(`/api/v1/brands/${brandId}/products`);
    assert.equal(bProds.status, 200);
  }
});

test('Specification: Inventory Valuation, Transfer & Warehouses', async () => {
  // 1. Warehouse get & list
  const whRes = await request(app)
    .get('/api/v1/warehouses')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(whRes.status, 200);
  assert.ok(whRes.body.data.length >= 1);
  const wh1 = whRes.body.data[0].id;

  // Create second warehouse for transfer test
  const wh2Res = await request(app)
    .post('/api/v1/warehouses')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'Chittagong Depot',
      code: 'WH-CTG-01',
      address: 'Agrabad C/A, Chittagong',
      manager: 'Kamal Hossain'
    });
  assert.equal(wh2Res.status, 201);
  const wh2 = wh2Res.body.data.id;

  // 2. Stock Purchase / In
  const prods = (await request(app).get('/api/v1/products')).body.data;
  const prodId = prods[0].id;

  const stockIn = await request(app)
    .post('/api/v1/inventory/purchase')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      productId: prodId,
      warehouseId: wh1,
      quantity: 50,
      note: 'PO-2026-09-01 batch arrived',
      reference: 'PO-99128'
    });
  assert.equal(stockIn.status, 201);

  // 3. Stock Transfer between warehouses
  const transfer = await request(app)
    .post('/api/v1/inventory/transfer')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      productId: prodId,
      fromWarehouseId: wh1,
      toWarehouseId: wh2,
      quantity: 10,
      note: 'Stock rebalance to Chittagong'
    });
  assert.equal(transfer.status, 200);
  assert.equal(transfer.body.data.txns.length, 2);

  // 4. Inventory Valuation
  const valRes = await request(app)
    .get('/api/v1/inventory/valuation')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(valRes.status, 200);
  assert.ok(valRes.body.data.totalUnits > 0);
  assert.ok(valRes.body.data.totalValue > 0);

  // 5. Inventory Transactions query
  const txnsRes = await request(app)
    .get('/api/v1/inventory/transactions?type=transfer')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(txnsRes.status, 200);
  assert.ok(txnsRes.body.data.length >= 2);
});

test('Specification: Order Invoice Generation, Export & Payments', async () => {
  // 1. Checkout flow
  const prods = (await request(app).get('/api/v1/products')).body.data;
  const prod = prods[0];

  const checkout = await request(app)
    .post('/api/v1/checkout')
    .send({
      customer: {
        fullName: 'Zubair Al-Mamun',
        email: 'zubair.mamun@example.com',
        phone: '+880 1819001122',
        division: 'Dhaka',
        district: 'Dhaka City',
        address: 'House 45, Road 11, Banani'
      },
      paymentMethod: 'BKASH',
      shippingLocation: 'inside_dhaka',
      items: [
        {
          id: 'test-cart-item-1',
          productId: prod.id,
          product: prod,
          size: prod.sizes[0],
          color: prod.colors[0],
          quantity: 1,
          price: prod.salePrice || prod.price
        }
      ]
    });
  assert.equal(checkout.status, 201);
  const orderId = checkout.body.data.id;

  // 2. Invoice Generation (JSON and HTML)
  const invoiceJson = await request(app)
    .get(`/api/v1/orders/${orderId}/invoice`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(invoiceJson.status, 200);
  assert.ok(invoiceJson.body.data.invoiceNumber.startsWith('INV-'));
  assert.ok(invoiceJson.body.data.html.includes('INVOICE'));

  const invoiceHtml = await request(app)
    .get(`/api/v1/orders/${orderId}/invoice?format=html`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(invoiceHtml.status, 200);
  assert.ok(invoiceHtml.text.includes('<!DOCTYPE html>'));

  // 3. Orders CSV Export
  const exportCsv = await request(app)
    .get('/api/v1/orders/export')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(exportCsv.status, 200);
  assert.ok(exportCsv.text.includes('order_number'));

  // 4. Payments API
  const payRecord = await request(app)
    .post('/api/v1/payments')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      orderId,
      amount: checkout.body.data.total,
      paymentMethod: 'mobile_payment',
      transactionId: 'BKASH-TRX-883921'
    });
  assert.equal(payRecord.status, 201);
  assert.equal(payRecord.body.data.paymentMethod, 'mobile_payment');

  const payGet = await request(app)
    .get(`/api/v1/payments/${payRecord.body.data.id}`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(payGet.status, 200);
  assert.equal(payGet.body.data.status, 'paid');
});

test('Specification: Customer Profile, Addresses, Orders & Wishlist', async () => {
  // 1. Admin creates customer
  const createCust = await request(app)
    .post('/api/v1/customers')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      fullName: 'Sultan Mahmud',
      email: 'sultan.mahmud@example.com',
      phone: '+880 1715998877',
      gender: 'Male',
      dateOfBirth: '1988-05-14'
    });
  assert.equal(createCust.status, 201);
  const custId = createCust.body.data.id;

  // 2. Customer address management
  const addAddr = await request(app)
    .post(`/api/v1/customers/${custId}/addresses`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      label: 'Corporate Office',
      address: 'Level 14, Lotus Kamal Tower, Gulshan 1',
      division: 'Dhaka',
      district: 'Dhaka City',
      phone: '+880 1715998877',
      isDefault: true
    });
  assert.equal(addAddr.status, 201);
  const addrId = addAddr.body.data.id;

  const listAddrs = await request(app)
    .get(`/api/v1/customers/${custId}/addresses`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(listAddrs.status, 200);
  assert.equal(listAddrs.body.data.length, 1);
  assert.equal(listAddrs.body.data[0].id, addrId);

  // 3. Customer orders history endpoint
  const custOrders = await request(app)
    .get(`/api/v1/customers/${custId}/orders`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(custOrders.status, 200);
  assert.ok(Array.isArray(custOrders.body.data));
});

test('Specification: All 10 Reports and CSV Exports', async () => {
  const reports = [
    { path: '/api/v1/reports/sales', csv: true },
    { path: '/api/v1/reports/products', csv: true },
    { path: '/api/v1/reports/inventory', csv: true },
    { path: '/api/v1/reports/stock-movement', csv: true },
    { path: '/api/v1/reports/customers', csv: true },
    { path: '/api/v1/reports/orders', csv: true },
    { path: '/api/v1/reports/profit', csv: false },
    { path: '/api/v1/reports/discounts', csv: false },
    { path: '/api/v1/reports/payments', csv: false },
    { path: '/api/v1/reports/shipping', csv: false }
  ];

  for (const r of reports) {
    const res = await request(app)
      .get(r.path)
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(res.status, 200, `Report ${r.path} failed`);
    assert.ok(res.body.success, `Report ${r.path} returned non-success`);

    if (r.csv) {
      const csvRes = await request(app)
        .get(`${r.path}?export=csv`)
        .set('Authorization', `Bearer ${adminToken}`);
      assert.equal(csvRes.status, 200, `CSV export for ${r.path} failed`);
      assert.equal(csvRes.headers['content-type'], 'text/csv; charset=utf-8');
    }
  }
});

test('Specification: Enhanced Sales Intelligence Report & Filtered CSV Export', async () => {
  // 1. Unfiltered report
  const fullRes = await request(app)
    .get('/api/v1/reports/sales')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(fullRes.status, 200);
  assert.ok(fullRes.body.data.totals);
  assert.ok(Array.isArray(fullRes.body.data.byDay));
  assert.ok(Array.isArray(fullRes.body.data.byPaymentMethod));
  assert.ok(Array.isArray(fullRes.body.data.byStatus));
  assert.ok(Array.isArray(fullRes.body.data.topProducts));
  assert.ok(Array.isArray(fullRes.body.data.orders));

  // 2. Filtered by paymentMethod and status
  const filteredRes = await request(app)
    .get('/api/v1/reports/sales?paymentMethod=cod&status=delivered')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(filteredRes.status, 200);
  assert.ok(filteredRes.body.data.totals.orders >= 0);

  // 3. Filtered CSV export with custom date range
  const csvRes = await request(app)
    .get('/api/v1/reports/sales?format=csv&from=2020-01-01&to=2030-12-31')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(csvRes.status, 200);
  assert.equal(csvRes.headers['content-type'], 'text/csv; charset=utf-8');
  assert.ok(csvRes.text.includes('Order #'));
  assert.ok(csvRes.text.includes('Total (BDT)'));
});

test('Specification: Notifications, Inquiries & Media Folders', async () => {
  // 1. Send notification
  const ntfRes = await request(app)
    .post('/api/v1/notifications/send')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      channel: 'email',
      event: 'low_stock',
      payload: { sku: 'RM-BLZ-001', units: 3 }
    });
  assert.equal(ntfRes.status, 201);
  assert.equal(ntfRes.body.data.event, 'low_stock');

  // 2. Product inquiry detail & reply
  const inqRes = await request(app)
    .post('/api/v1/inquiries')
    .send({
      productId: 'prod-suit-1',
      name: 'Rahim Chowdhury',
      email: 'rahim@example.com',
      phone: '+880 1711223344',
      message: 'Can I order this bespoke with silver buttons?'
    });
  assert.equal(inqRes.status, 201);
  const inqId = inqRes.body.data.id;

  const inqDetail = await request(app)
    .get(`/api/v1/inquiries/${inqId}`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(inqDetail.status, 200);
  assert.equal(inqDetail.body.data.status, 'pending');

  const inqReply = await request(app)
    .post(`/api/v1/inquiries/${inqId}/reply`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ adminReply: 'Yes, our master tailor can customize the buttons.' });
  assert.equal(inqReply.status, 200);
  assert.equal(inqReply.body.data.status, 'replied');

  // 2b. Inquiry status update & deletion
  const inqStatusPatch = await request(app)
    .patch(`/api/v1/inquiries/${inqId}/status`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ status: 'resolved' });
  assert.equal(inqStatusPatch.status, 200);
  assert.equal(inqStatusPatch.body.data.status, 'resolved');

  const inqDel = await request(app)
    .delete(`/api/v1/inquiries/${inqId}`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(inqDel.status, 200);
  assert.equal(inqDel.body.data.deleted, true);

  // 2c. Notification delete and clear all
  const ntfId = ntfRes.body.data.id;
  const ntfDel = await request(app)
    .delete(`/api/v1/notifications/${ntfId}`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(ntfDel.status, 200);
  assert.equal(ntfDel.body.data.deleted, true);

  const ntfClear = await request(app)
    .delete('/api/v1/notifications')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(ntfClear.status, 200);
  assert.equal(ntfClear.body.data.cleared, true);

  // 3. Media folders list
  const foldersRes = await request(app)
    .get('/api/v1/media/folders')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(foldersRes.status, 200);
  assert.ok(Array.isArray(foldersRes.body.data));
});

test('Specification: Unified /api and /api/v1 parity, customer self-service and aliases', async () => {
  // 1. Verify /api endpoints are 100% accessible and return 200 OK (not 404!)
  const endpoints = [
    '/api/brands',
    '/api/categories',
    '/api/products',
    '/api/banners',
    '/api/homepage-sections',
    '/api/homepage_sections',
    '/api/offers',
    '/api/discounts',
    '/api/blog',
    '/api/pages',
    '/api/settings',
    '/api/website-settings',
    '/api/seo',
    '/api/shipping',
    '/api/shipping-methods'
  ];

  for (const ep of endpoints) {
    const res = await request(app).get(ep);
    assert.equal(res.status, 200, `Endpoint ${ep} should return 200`);
    assert.equal(res.body.success, true, `Endpoint ${ep} should succeed`);
  }

  // 2. Authenticated /api endpoints
  const authedEndpoints = [
    '/api/inventory',
    '/api/warehouses',
    '/api/orders',
    '/api/customers',
    '/api/reviews',
    '/api/inquiries',
    '/api/product-inquiries',
    '/api/media',
    '/api/notifications',
    '/api/audit-logs',
    '/api/audit_logs',
    '/api/roles',
    '/api/admins',
    '/api/admin-users',
    '/api/reports/sales',
    '/api/reports/inventory',
    '/api/reports/orders',
    '/api/reports/customers'
  ];

  for (const ep of authedEndpoints) {
    const res = await request(app).get(ep).set('Authorization', `Bearer ${adminToken}`);
    assert.equal(res.status, 200, `Authed endpoint ${ep} should return 200`);
    assert.equal(res.body.success, true, `Authed endpoint ${ep} should succeed`);
  }

  // 3. Customer self-service: register, login, profile, addresses, orders, wishlist
  const custReg = await request(app).post('/api/auth/customer/register').send({
    fullName: 'Shakib Al Hasan',
    email: 'shakib.test@richmanbd.com',
    phone: '+880 1700112233',
    password: 'Password123'
  });
  assert.equal(custReg.status, 201);
  const custToken = custReg.body.data.token;
  const custId = custReg.body.data.user.id;

  // Customer profile
  const custProfile = await request(app)
    .get('/api/customer/profile')
    .set('Authorization', `Bearer ${custToken}`);
  assert.equal(custProfile.status, 200);
  assert.equal(custProfile.body.data.email, 'shakib.test@richmanbd.com');

  // Customer add address
  const addAddr = await request(app)
    .post('/api/customer/addresses')
    .set('Authorization', `Bearer ${custToken}`)
    .send({
      label: 'Office',
      address: 'Plot 4, Madani Avenue, Baridhara',
      division: 'Dhaka',
      district: 'Dhaka City',
      isDefault: true
    });
  assert.equal(addAddr.status, 201);
  assert.equal(addAddr.body.data.label, 'Office');
  const addrId = addAddr.body.data.id;

  // Customer list addresses
  const listAddr = await request(app)
    .get('/api/customer/addresses')
    .set('Authorization', `Bearer ${custToken}`);
  assert.equal(listAddr.status, 200);
  assert.equal(listAddr.body.data.length, 1);

  // Customer update address
  const updateAddr = await request(app)
    .put(`/api/customer/addresses/${addrId}`)
    .set('Authorization', `Bearer ${custToken}`)
    .send({ label: 'Headquarters' });
  assert.equal(updateAddr.status, 200);

  // Customer access own /customers/:id/addresses
  const accessOwn = await request(app)
    .get(`/api/customers/${custId}/addresses`)
    .set('Authorization', `Bearer ${custToken}`);
  assert.equal(accessOwn.status, 200);

  // 4. Product images and variant subroutes
  const productImages = await request(app).get('/api/products/prod-01/images');
  assert.equal(productImages.status, 200);
  assert.ok(Array.isArray(productImages.body.data));

  // 5. Inquiry reply via alias
  const inqCreate = await request(app).post('/api/product-inquiries').send({
    productId: 'prod-01',
    name: 'Tamim Iqbal',
    email: 'tamim@example.com',
    message: 'Is size 42 available in Chittagong boutique?'
  });
  assert.equal(inqCreate.status, 201);
  const inqId = inqCreate.body.data.id;

  const inqReply = await request(app)
    .post(`/api/product-inquiries/${inqId}/reply`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ reply: 'Yes, Chittagong GEC circle store has 2 in stock.' });
  assert.equal(inqReply.status, 200);
  assert.equal(inqReply.body.data.status, 'replied');

  // 6. Payment Methods & Gateways Management
  const pmList = await request(app).get('/api/v1/payment-methods');
  assert.equal(pmList.status, 200);
  assert.ok(pmList.body.data.length >= 4);

  const pmGet = await request(app).get('/api/v1/payment-methods/pm-cod');
  assert.equal(pmGet.status, 200);
  assert.equal(pmGet.body.data.code, 'COD');

  const pmCreate = await request(app)
    .post('/api/v1/payment-methods')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      code: 'UPAY',
      name: 'Upay Mobile Banking',
      type: 'mobile_banking',
      description: 'Upay MFS checkout',
      instructions: 'Pay via Upay',
      status: 'active'
    });
  assert.equal(pmCreate.status, 201);
  const newPmId = pmCreate.body.data.id;

  const pmToggle = await request(app)
    .patch(`/api/v1/payment-methods/${newPmId}/toggle`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(pmToggle.status, 200);
  assert.equal(pmToggle.body.data.status, 'inactive');

  const pmDelete = await request(app)
    .delete(`/api/v1/payment-methods/${newPmId}`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(pmDelete.status, 200);
  assert.equal(pmDelete.body.data.deleted, true);
});


