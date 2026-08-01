import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const url = urlMatch ? urlMatch[1].trim() : '';
const key = keyMatch ? keyMatch[1].trim() : '';

const supabase = createClient(url, key);

export const productsData = [
  // Category: Recipes & Marinades
  { name: 'Chicken Tikka Masala', category: 'Recipes & Marinades', packing: '1kg /20kG', trade_price: 1250, status: 'Active' },
  { name: 'Chicken Tandoori Masala', category: 'Recipes & Marinades', packing: '1kg /20kG', trade_price: 1250, status: 'Active' },
  { name: 'Shawarma Masala for 20Kg Chicken', category: 'Recipes & Marinades', packing: '1kg /20kG', trade_price: 1250, status: 'Active' },
  { name: 'FAJITA Masala for 20Kg Chicken', category: 'Recipes & Marinades', packing: '1kg /20kG', trade_price: 1250, status: 'Active' },
  { name: 'Zinger Marinade Recipe for 20 Kg Chicken', category: 'Recipes & Marinades', packing: '800gm/25Pkt', trade_price: 980, status: 'Active' },
  { name: 'Hot Zinger Marinade Recipe for 20 Kg Chicken', category: 'Recipes & Marinades', packing: '500gm', trade_price: 790, status: 'Active' },
  { name: 'BROAST MASALA FOR 20KG CHICKEN', category: 'Recipes & Marinades', packing: '1kg /20kG', trade_price: 1350, status: 'Active' },
  { name: 'Flour Seasoning for 10 Kg Flour', category: 'Recipes & Marinades', packing: '200gm/40Pkt', trade_price: 400, status: 'Active' },
  { name: 'Grill Marination Recipe', category: 'Recipes & Marinades', packing: '500gm/20Pkt', trade_price: 1325, status: 'Active' },
  { name: 'Biryani Masala / Quorma / Achar Gosht / Karahi Gosht Masala', category: 'Recipes & Marinades', packing: '1kg /20kG', trade_price: 1250, status: 'Active' },
  { name: 'Chicken Chatpata Sprinkle Masala (Economy)', category: 'Recipes & Marinades', packing: '1kg /20kG', trade_price: 900, status: 'Active' },
  { name: 'Chicken Chatpata Sprinkle Masala', category: 'Recipes & Marinades', packing: '400GM/40Pkt', trade_price: 525, status: 'Active' },
  { name: 'Chicken Cheese / Lemon / Salty Masala', category: 'Recipes & Marinades', packing: '400GM/40Pkt', trade_price: 650, status: 'Active' },
  { name: 'Chaat Masala VVIP', category: 'Recipes & Marinades', packing: '1kg /20kG', trade_price: 900, status: 'Active' },
  { name: 'Potato Fries Masala (Salty Chicken / Masala Flavor)', category: 'Recipes & Marinades', packing: 'Loose 40 KG', trade_price: 28000, status: 'Active' },
  { name: 'Tenderizing Powder for 40 Kg Meat', category: 'Recipes & Marinades', packing: '500gm/40Pkt', trade_price: 800, status: 'Active' },
  { name: 'Chicken Stock Powder', category: 'Recipes & Marinades', packing: '1kg /25kG', trade_price: 950, status: 'Active' },

  // Category: Organic Dry Vegetables
  { name: 'Garlic Powder A Quality', category: 'Organic Dry Vegetables', packing: '1Kg/20Pkt', trade_price: 1030, status: 'Active' },
  { name: 'Garlic Powder Economy', category: 'Organic Dry Vegetables', packing: '1Kg/20Pkt', trade_price: 800, status: 'Active' },
  { name: 'Ginger Powder A Quality', category: 'Organic Dry Vegetables', packing: '500GM/40Pkt', trade_price: 800, status: 'Active' },
  { name: 'Ginger Powder Economy', category: 'Organic Dry Vegetables', packing: '1Kg/20Pkt', trade_price: 900, status: 'Active' },
  { name: 'Onion Powder A', category: 'Organic Dry Vegetables', packing: '1Kg/20Pkt', trade_price: 1140, status: 'Active' },

  // Category: Pure Spices
  { name: 'Taiz Lal Mirch Powder Pure', category: 'Pure Spices', packing: '800gm/25Pkt', trade_price: 850, status: 'Active' },
  { name: 'Taiz Lal Mirch Powder Pure', category: 'Pure Spices', packing: '450gm/40Pkt', trade_price: 525, status: 'Active' },
  { name: 'Crush Chilli Fresh Pure', category: 'Pure Spices', packing: '800gm/20Pkt', trade_price: 850, status: 'Active' },
  { name: 'Crush Chilli Fresh Pure', category: 'Pure Spices', packing: '450gm/30Pkt', trade_price: 525, status: 'Active' },
  { name: 'Pure Pink Himalayan Salt', category: 'Pure Spices', packing: '10KG/2Pkt', trade_price: 1250, status: 'Active' },
  { name: 'Zeera Powder A Quality', category: 'Pure Spices', packing: '400GM/40Pkt', trade_price: 750, status: 'Active' },
  { name: 'Garam Masala Powder Executive Quality VVIP', category: 'Pure Spices', packing: '500gm/40Pkt', trade_price: 1400, status: 'Active' },
  { name: 'Dhaniya Powder (Coriander)', category: 'Pure Spices', packing: '800gm/20Pkt', trade_price: 690, status: 'Active' },
  { name: 'Black Pepper Whole Powder Pure VVIP', category: 'Pure Spices', packing: '400GM/40Pkt', trade_price: 1410, status: 'Active' },
  { name: 'White Pepper Whole Powder Pure VVIP', category: 'Pure Spices', packing: '400GM/40Pkt', trade_price: 1740, status: 'Active' },
  { name: 'Daarchini Powder (Cinnamon) Pure VVIP', category: 'Pure Spices', packing: '400GM/40Pkt', trade_price: 700, status: 'Active' },
  { name: 'Haldi Powder Pure VVIP', category: 'Pure Spices', packing: '900gm/20Pkt', trade_price: 950, status: 'Active' },
  { name: 'Jaifal / Javatri / Long (Available on Order)', category: 'Pure Spices', packing: 'On Order', trade_price: 0, status: 'Active' },

  // Category: Mayo • Sauces • Vinegar
  { name: 'White Synthetic Vinegar #1 UKCHEF BRAND', category: 'Mayo • Sauces • Vinegar', packing: '5 Ltr/4 Bottles', trade_price: 400, status: 'Active' },
  { name: 'White Synthetic Vinegar CHEFLIKE BRAND', category: 'Mayo • Sauces • Vinegar', packing: '5 Ltr/4 Bottles', trade_price: 320, status: 'Active' },
  { name: 'White Synthetic Vinegar #1 UKCHEF BRAND', category: 'Mayo • Sauces • Vinegar', packing: '4 Ltr/4 Duck Can', trade_price: 600, status: 'Active' },
  { name: 'Green Chilli Economy', category: 'Mayo • Sauces • Vinegar', packing: '3.2 Ltr/6 Can', trade_price: 925, status: 'Active' },
  { name: 'Pizza Sauce Economy Pack', category: 'Mayo • Sauces • Vinegar', packing: '3.2 Ltr/6 Can', trade_price: 1350, status: 'Active' },
  { name: 'Hot Chilli Sauce', category: 'Mayo • Sauces • Vinegar', packing: '4 KG Duck Can', trade_price: 1200, status: 'Active' },
  { name: 'Tomato Sauce', category: 'Mayo • Sauces • Vinegar', packing: '4 KG Duck Can', trade_price: 1200, status: 'Active' },
  { name: 'Chilli Garlic Sauce Duck Can', category: 'Mayo • Sauces • Vinegar', packing: '4 KG Duck Can', trade_price: 1200, status: 'Active' },
  { name: 'Chilli Garlic Sauce Economy', category: 'Mayo • Sauces • Vinegar', packing: '3.2 Ltr/6 Can', trade_price: 850, status: 'Active' },
  { name: 'White Synthetic Vinegar #1', category: 'Mayo • Sauces • Vinegar', packing: '800 Ml/12 Bottle', trade_price: 150, status: 'Active' },
  { name: 'Hot Chilli Sauce', category: 'Mayo • Sauces • Vinegar', packing: '800 Ml/12 Bottle', trade_price: 370, status: 'Active' },
  { name: 'Green Chilli Sauce', category: 'Mayo • Sauces • Vinegar', packing: '800 Ml/12 Bottle', trade_price: 370, status: 'Active' },
  { name: 'Chilli Garlic Sauce', category: 'Mayo • Sauces • Vinegar', packing: '800 Ml/12 Bottle', trade_price: 370, status: 'Active' },
  { name: 'Tomato Sauce', category: 'Mayo • Sauces • Vinegar', packing: '800 Ml/12 Bottle', trade_price: 370, status: 'Active' },
  { name: 'Pizza Sauce', category: 'Mayo • Sauces • Vinegar', packing: '800 Ml/12 Bottle', trade_price: 490, status: 'Active' },
  { name: 'UKCHEF Dressing Mayo', category: 'Mayo • Sauces • Vinegar', packing: '2 Ltr/10 Pouch', trade_price: 550, status: 'Active' }
];

async function runSeed() {
  console.log(`Starting insertion of ${productsData.length} products into Supabase...`);
  
  // Insert in batches of 20
  const batchSize = 20;
  let totalInserted = 0;

  for (let i = 0; i < productsData.length; i += batchSize) {
    const batch = productsData.slice(i, i + batchSize);
    const { data, error } = await supabase.from('products').insert(batch).select();
    
    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
      return;
    }
    
    totalInserted += data ? data.length : 0;
    console.log(`Batch ${i / batchSize + 1} inserted: ${data ? data.length : 0} items.`);
  }

  console.log(`\nInsertion complete! Total records inserted: ${totalInserted}`);

  // Verification query
  const { data: allProducts, error: selectErr } = await supabase.from('products').select('*');
  if (selectErr) {
    console.error('Verification query error:', selectErr);
  } else {
    console.log(`Verification successful! Total products in database: ${allProducts.length}`);
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed_products.js')) {
  runSeed();
}
