// defaults.js — starter data. Photos are Unsplash URLs (verified 200 in brainstorm).
export const DEFAULT_MENU = [
  { id: 'seed-espresso',   name: 'Espresso',   color: '#c08552', caffeineMg: 65,
    photo: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&q=80' },
  { id: 'seed-cappuccino', name: 'Cappuccino', color: '#a06a3f', caffeineMg: 75,
    photo: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600&q=80' },
  { id: 'seed-flatwhite',  name: 'Flat White', color: '#8a572f', caffeineMg: 130,
    photo: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=600&q=80' },
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
