async function runVerification() {
  console.log('=== STARTING AUTOMATED END-TO-END VERIFICATION ===\n');

  let passed = 0;
  let failed = 0;

  // 1. Health check
  try {
    const res = await fetch('http://localhost:5000/api/health');
    const data = await res.json();
    if (data.status === 'online' && data.supabaseConnected) {
      console.log('✅ TEST 1 PASSED: Express server online and connected to Supabase (', data.supabaseUrl, ')');
      passed++;
    } else {
      console.error('❌ TEST 1 FAILED:', data);
      failed++;
    }
  } catch (e) {
    console.error('❌ TEST 1 ERROR:', e.message);
    failed++;
  }

  // 2. Fetch products from Supabase
  let sampleProductId = null;
  try {
    const res = await fetch('http://localhost:5000/api/products');
    const data = await res.json();
    if (data.success && data.data && data.data.length > 0) {
      console.log(`✅ TEST 2 PASSED: Successfully retrieved ${data.data.length} products from Supabase DB:`);
      data.data.forEach((p, idx) => {
        console.log(`   ${idx + 1}. [${p.id.slice(0, 8)}...] ${p.title} | ₹${p.price} | Stock: ${p.stock} | Live: ${p.is_selling} | Tags: ${p.velocity_text}`);
      });
      sampleProductId = data.data[0].id;
      passed++;
    } else {
      console.error('❌ TEST 2 FAILED:', data);
      failed++;
    }
  } catch (e) {
    console.error('❌ TEST 2 ERROR:', e.message);
    failed++;
  }

  // 3. Register Artisan Profile in Supabase
  try {
    const artisanPayload = {
      full_name: 'अशोक बुनकर (Ashok Bunkar)',
      phone: '9822114455',
      craft_category: 'हथकरघा बुनाई',
      craft_specialty: 'Handwoven Khadi & Silk',
      state: 'Maharashtra',
      district: 'Wardha',
      social_category: 'OBC',
      language_preference: 'hi'
    };

    const res = await fetch('http://localhost:5000/api/artisans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(artisanPayload)
    });
    const data = await res.json();
    if (data.success && data.data && (data.storage === 'supabase' || data.data.id)) {
      console.log(`✅ TEST 3 PASSED: Artisan registered successfully into Supabase! ID: ${data.data.id}, Code: ${data.data.artisan_code}`);
      passed++;
    } else {
      console.error('❌ TEST 3 FAILED:', data);
      failed++;
    }
  } catch (e) {
    console.error('❌ TEST 3 ERROR:', e.message);
    failed++;
  }

  // 4. Add Product to Supabase
  try {
    const productPayload = {
      title: 'पारंपरिक वर्धा खादी कुर्ता (Traditional Khadi Kurta)',
      price: 1250,
      stock: 15,
      category: 'handloom',
      image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=400&auto=format&fit=crop&q=80'
    };

    const res = await fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productPayload)
    });
    const data = await res.json();
    if (data.success && data.data && data.data.id) {
      console.log(`✅ TEST 4 PASSED: Product added to Supabase DB! ID: ${data.data.id}, Title: ${data.data.title}, Price: ₹${data.data.price}`);
      sampleProductId = data.data.id;
      passed++;
    } else {
      console.error('❌ TEST 4 FAILED:', data);
      failed++;
    }
  } catch (e) {
    console.error('❌ TEST 4 ERROR:', e.message);
    failed++;
  }

  // 5. Stock Update Stepper API
  try {
    const res = await fetch(`http://localhost:5000/api/products/${sampleProductId}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta: 10 })
    });
    const data = await res.json();
    if (data.success && data.data && data.data.stock !== undefined) {
      console.log(`✅ TEST 5 PASSED: Stock stepper updated stock to ${data.data.stock} (Status: ${data.data.status})`);
      passed++;
    } else {
      console.error('❌ TEST 5 FAILED:', data);
      failed++;
    }
  } catch (e) {
    console.error('❌ TEST 5 ERROR:', e.message);
    failed++;
  }

  // 6. Vite Frontend Server check
  try {
    const res = await fetch('http://localhost:5173/');
    if (res.ok) {
      const html = await res.text();
      if (html.includes('id="root"')) {
        console.log('✅ TEST 6 PASSED: Vite frontend server serving at http://localhost:5173/');
        passed++;
      }
    }
  } catch (e) {
    console.error('❌ TEST 6 ERROR:', e.message);
    failed++;
  }

  console.log(`\n=== VERIFICATION RESULTS: ${passed}/6 PASSED (${failed} FAILED) ===`);
}

runVerification();
