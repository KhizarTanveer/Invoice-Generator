import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const url = urlMatch ? urlMatch[1].trim() : '';
const key = keyMatch ? keyMatch[1].trim() : '';

const supabase = createClient(url, key);

async function deduplicate() {
  console.log('Fetching all products from Supabase database...');
  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  console.log(`Current total records in table: ${data.length}`);

  const seen = new Map();
  const idsToDelete = [];

  for (const item of data) {
    const itemKey = `${item.name}|${item.category}|${item.packing}|${item.trade_price}`;
    if (seen.has(itemKey)) {
      idsToDelete.push(item.id);
    } else {
      seen.set(itemKey, item.id);
    }
  }

  console.log(`Unique products count: ${seen.size}`);
  console.log(`Duplicate records to delete: ${idsToDelete.length}`);

  if (idsToDelete.length > 0) {
    for (let i = 0; i < idsToDelete.length; i += 50) {
      const chunk = idsToDelete.slice(i, i + 50);
      const { error: delErr } = await supabase.from('products').delete().in('id', chunk);
      if (delErr) {
        console.error('Delete error:', delErr);
      }
    }
    console.log('Duplicates removed.');
  }

  const { data: finalData, count, error: countErr } = await supabase.from('products').select('*', { count: 'exact' });
  if (countErr) {
    console.error('Final count error:', countErr);
  } else {
    console.log('\n================ VERIFICATION SUMMARY ================');
    console.log(`Final Row Count in Supabase Products Table: ${count}`);
    console.log(`Unique Products Count: ${finalData.length}`);
    console.log('======================================================');
  }
}

deduplicate();
