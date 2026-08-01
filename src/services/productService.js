import { supabase } from '../lib/supabase';

/**
 * Fetch all products from Supabase ordered alphabetically by name.
 */
export async function fetchProductsFromSupabase() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message || 'Failed to fetch products from Supabase');
  }

  return data || [];
}

/**
 * Insert a new product into Supabase products table.
 */
export async function addProductToSupabase(productData) {
  const payload = {
    name: productData.name.trim(),
    category: productData.category,
    packing: productData.packing.trim(),
    trade_price: Number(productData.trade_price),
    status: productData.status || 'Active'
  };

  const { data, error } = await supabase
    .from('products')
    .insert([payload])
    .select();

  if (error) {
    throw new Error(error.message || 'Failed to add product to Supabase');
  }

  return data && data[0] ? data[0] : null;
}

/**
 * Update an existing product in Supabase products table.
 */
export async function updateProductInSupabase(id, productData) {
  const payload = {
    name: productData.name.trim(),
    category: productData.category,
    packing: productData.packing.trim(),
    trade_price: Number(productData.trade_price),
    status: productData.status || 'Active'
  };

  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select();

  if (error) {
    throw new Error(error.message || 'Failed to update product in Supabase');
  }

  return data && data[0] ? data[0] : null;
}

/**
 * Delete a product from Supabase products table by ID.
 */
export async function deleteProductFromSupabase(id) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message || 'Failed to delete product from Supabase');
  }

  return true;
}
