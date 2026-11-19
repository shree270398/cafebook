-- ============================================================================
-- CafeBook — seed data (single cafe, 10 tables, full menu)
-- Run after schema.sql. Safe to re-run: existing rows are left untouched.
-- ============================================================================

insert into public.cafes (
  id, name, description, address, phone, email,
  opening_time, closing_time, timezone, facilities, image_url, is_active
)
values (
  '11111111-1111-4111-8111-111111111111',
  'CafeBook',
  'A slow-brewed neighbourhood cafe tucked away from the city rush. We roast in small batches, bake every morning and keep the music soft. Come for the coffee, stay for the light, the plants and the unhurried hours.',
  '24, 5th Cross, Indiranagar, Bengaluru 560038',
  '+91 98765 43210',
  'hello@cafebook.in',
  '10:00',
  '22:00',
  'Asia/Kolkata',
  array[
    'Free Wi-Fi',
    'Air conditioned',
    'Outdoor seating',
    'Pet friendly',
    'Card & UPI payments',
    'Wheelchair accessible'
  ],
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1600&q=80',
  true
)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Tables: numbers 1-10, capacities 2-8
-- ----------------------------------------------------------------------------
insert into public.cafe_tables (id, cafe_id, table_number, capacity, is_active)
values
  ('22222222-2222-4222-8222-000000000001', '11111111-1111-4111-8111-111111111111', 1, 2, true),
  ('22222222-2222-4222-8222-000000000002', '11111111-1111-4111-8111-111111111111', 2, 2, true),
  ('22222222-2222-4222-8222-000000000003', '11111111-1111-4111-8111-111111111111', 3, 2, true),
  ('22222222-2222-4222-8222-000000000004', '11111111-1111-4111-8111-111111111111', 4, 4, true),
  ('22222222-2222-4222-8222-000000000005', '11111111-1111-4111-8111-111111111111', 5, 4, true),
  ('22222222-2222-4222-8222-000000000006', '11111111-1111-4111-8111-111111111111', 6, 4, true),
  ('22222222-2222-4222-8222-000000000007', '11111111-1111-4111-8111-111111111111', 7, 4, true),
  ('22222222-2222-4222-8222-000000000008', '11111111-1111-4111-8111-111111111111', 8, 6, true),
  ('22222222-2222-4222-8222-000000000009', '11111111-1111-4111-8111-111111111111', 9, 6, true),
  ('22222222-2222-4222-8222-000000000010', '11111111-1111-4111-8111-111111111111', 10, 8, true)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Menu
-- ----------------------------------------------------------------------------
insert into public.menu_items (
  id, cafe_id, item_name, description, price, category, image_url, is_available
)
values
  ('33333333-3333-4333-8333-000000000001', '11111111-1111-4111-8111-111111111111',
   'Espresso', 'Double-shot single origin, pulled to a velvet crema.',
   149.00, 'Coffee',
   'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=900&q=80', true),

  ('33333333-3333-4333-8333-000000000002', '11111111-1111-4111-8111-111111111111',
   'Cappuccino', 'Silky steamed milk, a dusting of cocoa, a proper morning.',
   189.00, 'Coffee',
   'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=900&q=80', true),

  ('33333333-3333-4333-8333-000000000003', '11111111-1111-4111-8111-111111111111',
   'Cafe Latte', 'Slow-steamed milk poured over a rich double espresso.',
   199.00, 'Coffee',
   'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=900&q=80', true),

  ('33333333-3333-4333-8333-000000000004', '11111111-1111-4111-8111-111111111111',
   'Mocha', 'Dark chocolate, espresso and cream in a warm hug of a cup.',
   219.00, 'Coffee',
   'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=900&q=80', true),

  ('33333333-3333-4333-8333-000000000005', '11111111-1111-4111-8111-111111111111',
   'Cold Brew', 'Steeped for 18 hours. Smooth, bright and served over ice.',
   229.00, 'Coffee',
   'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80', true),

  ('33333333-3333-4333-8333-000000000006', '11111111-1111-4111-8111-111111111111',
   'Masala Chai', 'Assam leaves simmered with ginger, cardamom and clove.',
   99.00, 'Tea',
   'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=80', true),

  ('33333333-3333-4333-8333-000000000007', '11111111-1111-4111-8111-111111111111',
   'Green Tea', 'Fragrant jasmine green tea, gently steeped.',
   129.00, 'Tea',
   'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=900&q=80', true),

  ('33333333-3333-4333-8333-000000000008', '11111111-1111-4111-8111-111111111111',
   'Earl Grey', 'Bergamot-scented black tea with a slice of lemon.',
   139.00, 'Tea',
   'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=900&q=80', true),

  ('33333333-3333-4333-8333-000000000009', '11111111-1111-4111-8111-111111111111',
   'Iced Latte', 'Double espresso, cold milk and ice. Simple and perfect.',
   219.00, 'Cold Drinks',
   'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80', true),

  ('33333333-3333-4333-8333-000000000010', '11111111-1111-4111-8111-111111111111',
   'Berry Smoothie', 'Mixed berries, yoghurt and honey blended thick.',
   249.00, 'Cold Drinks',
   'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=900&q=80', true),

  ('33333333-3333-4333-8333-000000000011', '11111111-1111-4111-8111-111111111111',
   'Fresh Lime Soda', 'Hand-squeezed lime, soda and a pinch of black salt.',
   129.00, 'Cold Drinks',
   'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80', true),

  ('33333333-3333-4333-8333-000000000012', '11111111-1111-4111-8111-111111111111',
   'Avocado Toast', 'Sourdough, smashed avocado, chilli flakes and a poached egg.',
   289.00, 'Breakfast',
   'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=900&q=80', true),

  ('33333333-3333-4333-8333-000000000013', '11111111-1111-4111-8111-111111111111',
   'Pancake Stack', 'Buttermilk pancakes, maple butter and seasonal fruit.',
   269.00, 'Breakfast',
   'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=900&q=80', true),

  ('33333333-3333-4333-8333-000000000014', '11111111-1111-4111-8111-111111111111',
   'Farmhouse Omelette', 'Three-egg omelette with peppers, herbs and toasted bread.',
   249.00, 'Breakfast',
   'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=900&q=80', true),

  ('33333333-3333-4333-8333-000000000015', '11111111-1111-4111-8111-111111111111',
   'Grilled Veg Sandwich', 'Grilled sourdough, roasted vegetables and basil pesto.',
   279.00, 'Mains',
   'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80', true),

  ('33333333-3333-4333-8333-000000000016', '11111111-1111-4111-8111-111111111111',
   'Chicken Pesto Pasta', 'Penne tossed in basil pesto with grilled chicken.',
   389.00, 'Mains',
   'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80', true),

  ('33333333-3333-4333-8333-000000000017', '11111111-1111-4111-8111-111111111111',
   'Margherita Pizza', 'Thin crust, San Marzano tomato, mozzarella and basil.',
   349.00, 'Mains',
   'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80', true),

  ('33333333-3333-4333-8333-000000000018', '11111111-1111-4111-8111-111111111111',
   'Tiramisu', 'Espresso-soaked sponge layered with mascarpone cream.',
   259.00, 'Desserts',
   'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=80', true),

  ('33333333-3333-4333-8333-000000000019', '11111111-1111-4111-8111-111111111111',
   'Chocolate Brownie', 'Warm fudge brownie served with vanilla ice cream.',
   199.00, 'Desserts',
   'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80', true),

  ('33333333-3333-4333-8333-000000000020', '11111111-1111-4111-8111-111111111111',
   'New York Cheesecake', 'Baked vanilla cheesecake with a berry compote.',
   249.00, 'Desserts',
   'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=900&q=80', true),

  ('33333333-3333-4333-8333-000000000021', '11111111-1111-4111-8111-111111111111',
   'Peri-Peri Fries', 'Crispy fries tossed in house peri-peri seasoning.',
   179.00, 'Snacks',
   'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80', true),

  ('33333333-3333-4333-8333-000000000022', '11111111-1111-4111-8111-111111111111',
   'Garlic Bread', 'Toasted ciabatta with garlic herb butter and parmesan.',
   169.00, 'Snacks',
   'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=900&q=80', true)
on conflict (id) do nothing;
