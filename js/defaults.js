// defaults.js — starter data. Photos are Unsplash URLs (verified 200 in brainstorm).
export const DEFAULT_MENU = [
  { id: 'seed-espresso',       name: 'Espresso',       color: '#c08552', caffeineMg: 65,
    photo: 'https://images.unsplash.com/photo-1572286258217-40142c1c6a70?w=600&q=80',
    description: 'A single, intense shot. Pure crema and bite.' },
  { id: 'seed-espresso-tonic', name: 'Espresso Tonic', color: '#d9a066', caffeineMg: 65,
    photo: 'https://images.unsplash.com/photo-1629022194335-b2eca031e320?w=600&q=80',
    description: 'Espresso over tonic and ice. Bright, fizzy, bittersweet.' },
  { id: 'seed-capuorange',     name: 'Capuorange',     color: '#b8946a', caffeineMg: 75,
    photo: 'https://img.magnific.com/premium-photo/coffee-orange-juice-bumble-bee-cocktail-table-healthy-food-meal-snack-copy-space_88242-11958.jpg',
    description: 'Espresso and fresh orange juice. Citrus meets coffee.' },
  { id: 'seed-capupucino',     name: 'Capupucino (rice-hazelnut milk)', color: '#a06a3f', caffeineMg: 75,
    photo: 'https://images.unsplash.com/photo-1710173472469-9d28e977914c?w=600&q=80',
    description: 'Cappuccino with rice-hazelnut milk. Nutty and dairy-free.' },
  { id: 'seed-latte',          name: 'Latte',          color: '#8a572f', caffeineMg: 80,
    photo: 'https://img.magnific.com/premium-photo/glass-latte-coffee-with-foam-top-wooden-table_909563-13.jpg',
    description: 'Espresso with lots of steamed milk. Smooth and mild.' },
  { id: 'seed-cappuccino',     name: 'Cappuccino',     color: '#6b4423', caffeineMg: 75,
    photo: 'https://images.unsplash.com/photo-1710173472469-9d28e977914c?w=600&q=80',
    description: 'Equal espresso, steamed milk, and a thick foam cap.' },
  { id: 'seed-cortado',        name: 'Cortado',        color: '#c08552', caffeineMg: 70,
    photo: 'https://images.unsplash.com/photo-1519532059956-a63a37af5deb?w=600&q=80',
    description: 'Equal parts espresso and warm milk. Balanced, no foam.' },
  { id: 'seed-iced-latte',     name: 'Iced Latte',     color: '#d9a066', caffeineMg: 80,
    photo: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&q=80',
    description: 'Chilled espresso and milk over ice. Crisp and refreshing.' },
];

export const HERO_PHOTO = 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=700&q=80';

// Offered as quick picks when adding a coffee.
export const PHOTO_GALLERY = [
  'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&q=80',
  'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600&q=80',
  'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=600&q=80',
  'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600&q=80',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
];

// Suggested colors for new coffees (used in by-type chart).
export const COLOR_SWATCHES = ['#c08552', '#a06a3f', '#8a572f', '#6b4423', '#d9a066', '#b8946a'];
