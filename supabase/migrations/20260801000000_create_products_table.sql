-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    packing TEXT NOT NULL,
    trade_price NUMERIC NOT NULL,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access" ON public.products;
DROP POLICY IF EXISTS "Allow public insert access" ON public.products;
DROP POLICY IF EXISTS "Allow public update access" ON public.products;
DROP POLICY IF EXISTS "Allow public delete access" ON public.products;

-- Create RLS Policies for full access by anon and authenticated users
CREATE POLICY "Allow public read access" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.products FOR DELETE USING (true);

-- Grant privileges to public roles
GRANT ALL ON public.products TO anon, authenticated, service_role;

-- Insert 51 products
INSERT INTO public.products (name, category, packing, trade_price, status) VALUES
-- Category: Recipes & Marinades
('Chicken Tikka Masala', 'Recipes & Marinades', '1kg /20kG', 1250, 'Active'),
('Chicken Tandoori Masala', 'Recipes & Marinades', '1kg /20kG', 1250, 'Active'),
('Shawarma Masala for 20Kg Chicken', 'Recipes & Marinades', '1kg /20kG', 1250, 'Active'),
('FAJITA Masala for 20Kg Chicken', 'Recipes & Marinades', '1kg /20kG', 1250, 'Active'),
('Zinger Marinade Recipe for 20 Kg Chicken', 'Recipes & Marinades', '800gm/25Pkt', 980, 'Active'),
('Hot Zinger Marinade Recipe for 20 Kg Chicken', 'Recipes & Marinades', '500gm', 790, 'Active'),
('BROAST MASALA FOR 20KG CHICKEN', 'Recipes & Marinades', '1kg /20kG', 1350, 'Active'),
('Flour Seasoning for 10 Kg Flour', 'Recipes & Marinades', '200gm/40Pkt', 400, 'Active'),
('Grill Marination Recipe', 'Recipes & Marinades', '500gm/20Pkt', 1325, 'Active'),
('Biryani Masala / Quorma / Achar Gosht / Karahi Gosht Masala', 'Recipes & Marinades', '1kg /20kG', 1250, 'Active'),
('Chicken Chatpata Sprinkle Masala (Economy)', 'Recipes & Marinades', '1kg /20kG', 900, 'Active'),
('Chicken Chatpata Sprinkle Masala', 'Recipes & Marinades', '400GM/40Pkt', 525, 'Active'),
('Chicken Cheese / Lemon / Salty Masala', 'Recipes & Marinades', '400GM/40Pkt', 650, 'Active'),
('Chaat Masala VVIP', 'Recipes & Marinades', '1kg /20kG', 900, 'Active'),
('Potato Fries Masala (Salty Chicken / Masala Flavor)', 'Recipes & Marinades', 'Loose 40 KG', 28000, 'Active'),
('Tenderizing Powder for 40 Kg Meat', 'Recipes & Marinades', '500gm/40Pkt', 800, 'Active'),
('Chicken Stock Powder', 'Recipes & Marinades', '1kg /25kG', 950, 'Active'),

-- Category: Organic Dry Vegetables
('Garlic Powder A Quality', 'Organic Dry Vegetables', '1Kg/20Pkt', 1030, 'Active'),
('Garlic Powder Economy', 'Organic Dry Vegetables', '1Kg/20Pkt', 800, 'Active'),
('Ginger Powder A Quality', 'Organic Dry Vegetables', '500GM/40Pkt', 800, 'Active'),
('Ginger Powder Economy', 'Organic Dry Vegetables', '1Kg/20Pkt', 900, 'Active'),
('Onion Powder A', 'Organic Dry Vegetables', '1Kg/20Pkt', 1140, 'Active'),

-- Category: Pure Spices
('Taiz Lal Mirch Powder Pure', 'Pure Spices', '800gm/25Pkt', 850, 'Active'),
('Taiz Lal Mirch Powder Pure', 'Pure Spices', '450gm/40Pkt', 525, 'Active'),
('Crush Chilli Fresh Pure', 'Pure Spices', '800gm/20Pkt', 850, 'Active'),
('Crush Chilli Fresh Pure', 'Pure Spices', '450gm/30Pkt', 525, 'Active'),
('Pure Pink Himalayan Salt', 'Pure Spices', '10KG/2Pkt', 1250, 'Active'),
('Zeera Powder A Quality', 'Pure Spices', '400GM/40Pkt', 750, 'Active'),
('Garam Masala Powder Executive Quality VVIP', 'Pure Spices', '500gm/40Pkt', 1400, 'Active'),
('Dhaniya Powder (Coriander)', 'Pure Spices', '800gm/20Pkt', 690, 'Active'),
('Black Pepper Whole Powder Pure VVIP', 'Pure Spices', '400GM/40Pkt', 1410, 'Active'),
('White Pepper Whole Powder Pure VVIP', 'Pure Spices', '400GM/40Pkt', 1740, 'Active'),
('Daarchini Powder (Cinnamon) Pure VVIP', 'Pure Spices', '400GM/40Pkt', 700, 'Active'),
('Haldi Powder Pure VVIP', 'Pure Spices', '900gm/20Pkt', 950, 'Active'),
('Jaifal / Javatri / Long (Available on Order)', 'Pure Spices', 'On Order', 0, 'Active'),

-- Category: Mayo • Sauces • Vinegar
('White Synthetic Vinegar #1 UKCHEF BRAND', 'Mayo • Sauces • Vinegar', '5 Ltr/4 Bottles', 400, 'Active'),
('White Synthetic Vinegar CHEFLIKE BRAND', 'Mayo • Sauces • Vinegar', '5 Ltr/4 Bottles', 320, 'Active'),
('White Synthetic Vinegar #1 UKCHEF BRAND', 'Mayo • Sauces • Vinegar', '4 Ltr/4 Duck Can', 600, 'Active'),
('Green Chilli Economy', 'Mayo • Sauces • Vinegar', '3.2 Ltr/6 Can', 925, 'Active'),
('Pizza Sauce Economy Pack', 'Mayo • Sauces • Vinegar', '3.2 Ltr/6 Can', 1350, 'Active'),
('Hot Chilli Sauce', 'Mayo • Sauces • Vinegar', '4 KG Duck Can', 1200, 'Active'),
('Tomato Sauce', 'Mayo • Sauces • Vinegar', '4 KG Duck Can', 1200, 'Active'),
('Chilli Garlic Sauce Duck Can', 'Mayo • Sauces • Vinegar', '4 KG Duck Can', 1200, 'Active'),
('Chilli Garlic Sauce Economy', 'Mayo • Sauces • Vinegar', '3.2 Ltr/6 Can', 850, 'Active'),
('White Synthetic Vinegar #1', 'Mayo • Sauces • Vinegar', '800 Ml/12 Bottle', 150, 'Active'),
('Hot Chilli Sauce', 'Mayo • Sauces • Vinegar', '800 Ml/12 Bottle', 370, 'Active'),
('Green Chilli Sauce', 'Mayo • Sauces • Vinegar', '800 Ml/12 Bottle', 370, 'Active'),
('Chilli Garlic Sauce', 'Mayo • Sauces • Vinegar', '800 Ml/12 Bottle', 370, 'Active'),
('Tomato Sauce', 'Mayo • Sauces • Vinegar', '800 Ml/12 Bottle', 370, 'Active'),
('Pizza Sauce', 'Mayo • Sauces • Vinegar', '800 Ml/12 Bottle', 490, 'Active'),
('UKCHEF Dressing Mayo', 'Mayo • Sauces • Vinegar', '2 Ltr/10 Pouch', 550, 'Active');
