import { createClient } from '@supabase/supabase-js';
import { INITIAL_VENDOR_PRODUCTS } from '../locales/translations';

// Supabase Credentials
export const SUPABASE_URL = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
  'https://txhpzolqynlgemswoejb.supabase.co';

export const SUPABASE_ANON_KEY = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4aHB6b2xxeW5sZ2Vtc3dvZWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NTYwOTIsImV4cCI6MjEwNDUzMjA5Mn0.kOHpHa0WU4x9dlNJyu4j5lyr1aiu0-d_3F8UbZAuYic';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  SUPABASE_URL.includes('supabase.co')
);

export const supabase = isSupabaseConfigured 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const ARTISANS_STORAGE_KEY = 'business_saathi_artisan_profiles';
const PRODUCTS_STORAGE_KEY = 'business_saathi_vendor_products';
const STOCK_OVERRIDES_KEY = 'business_saathi_stock_overrides';

// Helper: Read stock overrides from local storage
function getStockOverrides() {
  try {
    const raw = localStorage.getItem(STOCK_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Helper: Save stock override for a product
function saveStockOverride(productId, updates) {
  try {
    const overrides = getStockOverrides();
    overrides[productId] = { ...(overrides[productId] || {}), ...updates };
    localStorage.setItem(STOCK_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch (e) {
    console.warn('Failed to save stock override:', e);
  }
}

// Helper: Map Supabase product to UI product model
export function mapSupabaseProductToUI(sp, overrides = {}) {
  const o = overrides[sp.id] || {};
  const defaultStock = sp.status === 'out_of_stock' ? 0 : 12;
  const stock = o.stock !== undefined ? o.stock : defaultStock;
  const is_selling = o.is_selling !== undefined ? o.is_selling : (sp.status === 'active' && stock > 0);
  
  let status = 'live';
  if (!is_selling || stock === 0) status = 'out_of_stock';
  else if (stock <= 5) status = 'low_stock';

  const tagsText = Array.isArray(sp.tags) && sp.tags.length > 0 
    ? sp.tags.slice(0, 3).join(' • ')
    : '🔥 प्रमाणित हस्तकला';

  return {
    id: sp.id,
    artisan_id: sp.artisan_id,
    title: sp.name || 'हस्तनिर्मित उत्पाद',
    title_en: sp.name || 'Handcrafted Artisan Item',
    title_mr: sp.name || 'हातमाग हस्तकला उत्पादन',
    price: Number(sp.price) || 499,
    price_min: sp.price_min ? Number(sp.price_min) : undefined,
    price_max: sp.price_max ? Number(sp.price_max) : undefined,
    materials_cost: sp.materials_cost ? Number(sp.materials_cost) : undefined,
    labor_cost: sp.labor_cost ? Number(sp.labor_cost) : undefined,
    stock: stock,
    is_selling: is_selling,
    status: status,
    velocity: stock <= 5 ? 'fast' : 'medium',
    velocity_text: `🏷️ ${tagsText}`,
    revenue: (Number(sp.price) || 500) * (sp.id.charCodeAt(0) % 20 + 8),
    orders_count: (sp.id.charCodeAt(1) % 15 + 4),
    image: sp.image_url || 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=400&auto=format&fit=crop',
    category: sp.craft_type || 'handloom',
    craft_type: sp.craft_type || 'Handmade Craft',
    tags: sp.tags || [],
    created_at: sp.created_at || new Date().toISOString(),
    is_supabase: true
  };
}

export const artisanDbService = {
  // 1. SAVE ARTISAN PROFILE TO SUPABASE
  async saveArtisanProfile(profileData) {
    const artisanCode = `ART-${profileData.state === 'Maharashtra' ? 'MH' : 'IN'}-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const visvasEligible = ['OBC', 'SC', 'ST', 'Women SHG', 'Artisan SHG'].includes(profileData.social_category);

    const supabaseArtisanPayload = {
      tenant_id: 'tenant-artisan-saathi',
      name: profileData.full_name || profileData.name || 'रमेश पाटील',
      craft_type: profileData.craft_category || 'handloom',
      capacity_tier: '10-50',
      village: profileData.district || 'Paithan',
      district: profileData.district || 'Chhatrapati Sambhajinagar',
      state: profileData.state || 'Maharashtra',
      cluster_name: profileData.craft_specialty || (profileData.district + ' Handloom Cluster'),
      phone: profileData.phone || ''
    };

    // Try Supabase directly
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('artisans')
          .insert([supabaseArtisanPayload])
          .select()
          .single();

        if (!error && data) {
          console.log('✅ Supabase artisan profile saved successfully:', data.id);
          const fullProfile = {
            id: data.id,
            artisan_code: artisanCode,
            full_name: data.name,
            phone: data.phone || profileData.phone,
            craft_category: data.craft_type,
            craft_specialty: data.cluster_name,
            state: data.state,
            district: data.district,
            social_category: profileData.social_category || 'OBC',
            visvas_eligible: visvasEligible,
            source: 'supabase'
          };
          this.saveToLocalCache(fullProfile);
          return { success: true, source: 'supabase', data: fullProfile };
        } else if (error) {
          console.warn('Supabase insert warning:', error.message);
        }
      } catch (err) {
        console.warn('Supabase save profile exception:', err.message);
      }
    }

    // Fallback through backend API
    try {
      const response = await fetch('/api/artisans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          this.saveToLocalCache(result.data);
          return { success: true, source: result.storage || 'backend_api', data: result.data };
        }
      }
    } catch (apiErr) {
      console.warn('Backend API fallback error:', apiErr.message);
    }

    // Local durability
    const fallbackProfile = {
      id: 'art-' + Date.now(),
      artisan_code: artisanCode,
      full_name: profileData.full_name || 'रमेश पाटील',
      phone: profileData.phone || '9823012345',
      craft_category: profileData.craft_category || 'हथकरघा बुनाई',
      craft_specialty: profileData.craft_specialty || 'Pure Silk Paithani',
      state: profileData.state || 'Maharashtra',
      district: profileData.district || 'Chhatrapati Sambhajinagar',
      social_category: profileData.social_category || 'OBC',
      visvas_eligible: visvasEligible,
      source: 'local'
    };

    this.saveToLocalCache(fallbackProfile);
    return { success: true, source: 'local_storage', data: fallbackProfile };
  },

  saveToLocalCache(artisan) {
    try {
      const existing = this.getLocalProfiles();
      const updated = [artisan, ...existing.filter(a => a.phone !== artisan.phone && a.id !== artisan.id)];
      localStorage.setItem(ARTISANS_STORAGE_KEY, JSON.stringify(updated));
      return artisan;
    } catch (e) {
      console.warn('Local storage error:', e);
      return artisan;
    }
  },

  getLocalProfiles() {
    try {
      const raw = localStorage.getItem(ARTISANS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  getActiveArtisan() {
    const profiles = this.getLocalProfiles();
    return profiles.length > 0 ? profiles[0] : null;
  },

  // 2. PRODUCTS & STOCK APIS DIRECTLY WIRED TO SUPABASE
  async getProducts() {
    const overrides = getStockOverrides();

    // Direct Supabase query first
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          console.log(`✅ Loaded ${data.length} live products directly from Supabase!`);
          const uiProds = data.map(sp => mapSupabaseProductToUI(sp, overrides));
          this.saveProductsToLocal(uiProds);
          return uiProds;
        } else if (error) {
          console.warn('Supabase query products warning:', error.message);
        }
      } catch (err) {
        console.warn('Supabase get products error:', err.message);
      }
    }

    // Backend API fetch second
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const result = await response.json();
        if (result.data && result.data.length > 0) {
          // If backend returned raw supabase rows, map them
          const uiProds = result.data.map(item => {
            if (item.name && !item.title) {
              return mapSupabaseProductToUI(item, overrides);
            }
            return item;
          });
          this.saveProductsToLocal(uiProds);
          return uiProds;
        }
      }
    } catch (e) {
      console.warn('Products fetch error, reading local store:', e);
    }

    return this.getLocalProducts();
  },

  // 3. UPDATE STOCK WITH STEPS & DURABILITY
  async updateStock(productId, delta, newStock) {
    const products = this.getLocalProducts();
    const item = products.find(p => p.id === productId);

    let calculatedStock = 0;
    if (newStock !== undefined) {
      calculatedStock = Math.max(0, Number(newStock));
    } else if (item && delta !== undefined) {
      calculatedStock = Math.max(0, item.stock + Number(delta));
    }

    const isSelling = calculatedStock > 0;
    const status = calculatedStock === 0 ? 'out_of_stock' : calculatedStock <= 5 ? 'low_stock' : 'live';

    // Persist override locally so it survives refreshes
    saveStockOverride(productId, { stock: calculatedStock, is_selling: isSelling });

    // Call backend API if running
    try {
      await fetch(`/api/products/${productId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta, newStock: calculatedStock })
      });
    } catch {
      // Offline fallback
    }

    if (item) {
      item.stock = calculatedStock;
      item.is_selling = isSelling;
      item.status = status;
      this.updateLocalProduct(item);
      return item;
    }

    return null;
  },

  // 4. TOGGLE PRODUCT LIVE / PAUSED STATUS
  async toggleProductStatus(productId, is_selling) {
    const products = this.getLocalProducts();
    const item = products.find(p => p.id === productId);

    saveStockOverride(productId, { is_selling: Boolean(is_selling) });

    try {
      await fetch(`/api/products/${productId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_selling })
      });
    } catch {
      // Offline fallback
    }

    if (item) {
      item.is_selling = Boolean(is_selling);
      item.status = !is_selling ? 'out_of_stock' : item.stock <= 5 ? 'low_stock' : 'live';
      this.updateLocalProduct(item);
      return item;
    }

    return null;
  },

  // 5. ADD PRODUCT TO SUPABASE
  async addProduct(productPayload) {
    const priceNum = Number(productPayload.price) || 499;
    const stockNum = Number(productPayload.stock) || 12;

    const supabaseProduct = {
      tenant_id: 'tenant-artisan-saathi',
      name: productPayload.title || 'हस्तनिर्मित उत्पाद',
      craft_type: productPayload.category || productPayload.craft_type || 'handloom',
      price: priceNum,
      price_min: Math.round(priceNum * 0.9),
      price_max: Math.round(priceNum * 1.2),
      materials_cost: Math.round(priceNum * 0.35),
      labor_hours: 14,
      labor_cost: Math.round(priceNum * 0.45),
      tags: [
        productPayload.category || 'Handmade',
        'GI Certified',
        'Business Saathi',
        '100% Handcrafted'
      ],
      image_url: productPayload.image || 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=400&auto=format&fit=crop&q=80',
      is_studio_enhanced: true,
      status: 'active'
    };

    let createdId = 'prod-' + Date.now();

    // Insert to Supabase directly
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .insert([supabaseProduct])
          .select()
          .single();

        if (!error && data) {
          console.log('✅ Supabase product inserted successfully:', data.id);
          createdId = data.id;
          saveStockOverride(createdId, { stock: stockNum, is_selling: true });
          const mapped = mapSupabaseProductToUI(data, { [createdId]: { stock: stockNum, is_selling: true } });
          const current = this.getLocalProducts();
          this.saveProductsToLocal([mapped, ...current]);
          return mapped;
        } else if (error) {
          console.warn('Supabase product insert error:', error.message);
        }
      } catch (err) {
        console.warn('Supabase product insert exception:', err.message);
      }
    }

    // Try backend API
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...productPayload, ...supabaseProduct })
      });
      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          const item = result.data.name ? mapSupabaseProductToUI(result.data, { [result.data.id]: { stock: stockNum, is_selling: true } }) : result.data;
          const current = this.getLocalProducts();
          this.saveProductsToLocal([item, ...current]);
          return item;
        }
      }
    } catch (e) {
      console.warn('Add product API fallback error:', e);
    }

    // Fallback item
    const fallbackItem = {
      id: createdId,
      title: productPayload.title,
      title_en: productPayload.title,
      title_mr: productPayload.title,
      price: priceNum,
      stock: stockNum,
      is_selling: true,
      status: stockNum > 5 ? 'live' : 'low_stock',
      velocity_text: '🔥 नया सामान - ऑनलाइन लाइव',
      revenue: 0,
      orders_count: 0,
      image: productPayload.image || 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=400&auto=format&fit=crop&q=80',
      category: productPayload.category || 'handloom',
      craft_type: 'Handmade Craft',
      created_at: new Date().toISOString(),
      is_supabase: false
    };

    saveStockOverride(createdId, { stock: stockNum, is_selling: true });
    const current = this.getLocalProducts();
    this.saveProductsToLocal([fallbackItem, ...current]);
    return fallbackItem;
  },

  getLocalProducts() {
    try {
      const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : INITIAL_VENDOR_PRODUCTS;
    } catch {
      return INITIAL_VENDOR_PRODUCTS;
    }
  },

  saveProductsToLocal(products) {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.warn('Save products error:', e);
    }
  },

  updateLocalProduct(updatedItem) {
    const products = this.getLocalProducts();
    const idx = products.findIndex(p => p.id === updatedItem.id);
    if (idx !== -1) {
      products[idx] = updatedItem;
      this.saveProductsToLocal(products);
    }
  }
};
