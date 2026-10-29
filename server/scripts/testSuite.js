const BASE_URL = 'http://localhost:5000/api';

async function request(url, options = {}) {
  const fullUrl = `${BASE_URL}${url}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(fullUrl, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || `HTTP ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function runTests() {
  console.log('====================================================');
  console.log('  STARTING SHOPEZ FULL-STACK AUTOMATED TEST SUITE    ');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  const assert = (condition, name) => {
    if (condition) {
      console.log(`  [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${name}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const health = await request('/health');
    assert(health.status === 'healthy', 'API Health Check responds healthy');

    // 2. Fetch categories
    const categories = await request('/categories');
    assert(categories.success && categories.data.length >= 5, `Fetched ${categories.data.length} categories`);

    // 3. Fetch products
    const products = await request('/products?limit=10');
    assert(products.success && products.data.length > 0, `Fetched ${products.data.length} active products`);
    const firstProduct = products.data[0];

    // 4. Product details
    const prodDetail = await request(`/products/${firstProduct._id}`);
    assert(prodDetail.success && prodDetail.data.title === firstProduct.title, 'Fetch single product details');

    // 5. Customer Login
    const customerLogin = await request('/auth/login', {
      method: 'POST',
      body: {
        email: 'alex@example.com',
        password: 'User@shopez2026'
      }
    });
    assert(customerLogin.success && customerLogin.token, 'Customer authentication');
    const customerToken = customerLogin.token;
    const customerAuth = { headers: { Authorization: `Bearer ${customerToken}` } };

    // 6. Current User Profile
    const me = await request('/auth/me', customerAuth);
    assert(me.success && me.data.email === 'alex@example.com', 'Get current user profile (/auth/me)');

    // 7. Add product to cart
    const cartRes = await request('/cart/items', {
      method: 'POST',
      ...customerAuth,
      body: {
        productId: firstProduct._id,
        size: firstProduct.sizes[0] || 'Standard',
        quantity: 1
      }
    });
    assert(cartRes.success && cartRes.data.items.length > 0, 'Add product to shopping cart');

    // 8. Place order
    const orderRes = await request('/orders', {
      method: 'POST',
      ...customerAuth,
      body: {
        shippingAddress: {
          fullName: 'Alex Johnson',
          phone: '+1 555-345-6789',
          street: '100 Ocean Drive',
          city: 'Miami Beach',
          state: 'Florida',
          pincode: '33139'
        },
        paymentMethod: 'Cash on Delivery'
      }
    });
    assert(orderRes.success && orderRes.data.orderNumber, `Order placed successfully (#${orderRes.data.orderNumber})`);
    const createdOrderId = orderRes.data._id;

    // 9. Fetch customer orders
    const myOrders = await request('/orders/my-orders', customerAuth);
    assert(myOrders.success && myOrders.data.length > 0, 'Customer order history');

    // 10. Admin Login
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@shopez.com',
        password: 'Admin@shopez2026'
      }
    });
    assert(adminLogin.success && adminLogin.user.userType === 'admin', 'Admin authentication');
    const adminToken = adminLogin.token;
    const adminAuth = { headers: { Authorization: `Bearer ${adminToken}` } };

    // 11. Admin Dashboard Stats
    const stats = await request('/admin/dashboard/stats', adminAuth);
    assert(stats.success && stats.data.totalProducts > 0, 'Admin dashboard live business statistics');

    // 12. Admin Order Management (Update status & tracking)
    const updateStatus = await request(`/admin/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      ...adminAuth,
      body: {
        status: 'Processing',
        paymentStatus: 'Pending'
      }
    });
    assert(updateStatus.success && updateStatus.data.status === 'Processing', 'Admin update order fulfillment status');

    const updateTracking = await request(`/admin/orders/${createdOrderId}/tracking`, {
      method: 'PATCH',
      ...adminAuth,
      body: {
        trackingNumber: 'TRK-2026-EXPRESS'
      }
    });
    assert(updateTracking.success && updateTracking.data.trackingNumber === 'TRK-2026-EXPRESS', 'Admin update tracking information');

    console.log('====================================================');
    console.log(`  ALL ${passed} INTEGRATION TESTS PASSED! (${failed} failed)`);
    console.log('====================================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test Suite Error:', err.message, err.data || '');
    process.exit(1);
  }
}

runTests();
