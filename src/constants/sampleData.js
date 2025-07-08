import categoryChargers from '../assets/images/category-chargers.jpg';
import categoryAdapters from '../assets/images/category-adapters.jpg';
import categoryAccessories from '../assets/images/category-accessories.jpg';
import categoryBatteries from '../assets/images/category-batteries.jpg';

export const categoriesData = [
  { name: 'Ładowarki', image: categoryChargers },
  { name: 'Adaptery', image: categoryAdapters },
  { name: 'Akcesoria', image: categoryAccessories },
  { name: 'Baterie', image: categoryBatteries },
];

export const sampleTeslaProducts = [
  {
    id: 'tesla-wall-connector',
    name: 'Tesla Wall Connector Gen 3',
    price: 2499,
    category: 'Ładowarki',
    brand: 'Tesla',
    rating: 4.9,
    bestseller: true,
    description:
      'Najszybsza ładowarka domowa Tesla z mocą do 11.5 kW. Idealna do codziennego użytku domowego.',
    imageUrls: [
      'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
    ],
  },
  {
    id: 'tesla-mobile-connector',
    name: 'Tesla Mobile Connector',
    price: 899,
    category: 'Ładowarki',
    brand: 'Tesla',
    rating: 4.8,
    bestseller: true,
    description:
      'Przenośna ładowarka Tesla z adapterami do różnych gniazdek. Niezbędna w każdej podróży.',
    imageUrls: [
      'https://images.unsplash.com/photo-1609592606436-c0e3d0c4b3b9?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1621784377641-2c1a2c7a4b91?q=80&w=800&auto=format&fit=crop',
    ],
  },
  {
    id: 'tesla-chademo-adapter',
    name: 'Tesla CHAdeMO Adapter',
    price: 1299,
    category: 'Adaptery',
    brand: 'Tesla',
    rating: 4.7,
    description:
      'Adapter CHAdeMO umożliwiający ładowanie Tesla na stacjach CHAdeMO o mocy do 50 kW.',
    imageUrls: [
      'https://images.unsplash.com/photo-1626668011687-8a114d5c1604?q=80&w=800&auto=format&fit=crop',
    ],
  },
  {
    id: 'tesla-j1772-adapter',
    name: 'Tesla J1772 Adapter',
    price: 399,
    category: 'Adaptery',
    brand: 'Tesla',
    rating: 4.6,
    description:
      'Adapter J1772 pozwalający na ładowanie Tesla na publicznych stacjach J1772.',
    imageUrls: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
    ],
  },
  {
    id: 'tesla-supercharger-cable',
    name: 'Tesla Supercharger Cable (zapasowy)',
    price: 699,
    category: 'Akcesoria',
    brand: 'Tesla',
    rating: 4.8,
    description:
      'Zapasowy kabel do ładowarki Tesla Supercharger. Wytrzymały i niezawodny.',
    imageUrls: [
      'https://images.unsplash.com/photo-1609592606436-c0e3d0c4b3b9?q=80&w=800&auto=format&fit=crop',
    ],
  },
  {
    id: 'tesla-powerwall',
    name: 'Tesla Powerwall 2',
    price: 28999,
    category: 'Baterie',
    brand: 'Tesla',
    rating: 4.9,
    bestseller: true,
    description:
      'Domowa bateria Tesla Powerwall 2 o pojemności 13,5 kWh. Zapewnia niezależność energetyczną.',
    imageUrls: [
      'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=800&auto=format&fit=crop',
    ],
  },
  {
    id: 'tesla-model-s-floor-mats',
    name: 'Tesla Model S - Dywaniki podłogowe',
    price: 459,
    category: 'Akcesoria',
    brand: 'Tesla',
    rating: 4.5,
    description:
      'Oryginalne dywaniki podłogowe Tesla Model S. Idealne dopasowanie i wysoka jakość.',
    imageUrls: [
      'https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=800&auto=format&fit=crop',
    ],
  },
  {
    id: 'tesla-model-3-trunk-mat',
    name: 'Tesla Model 3 - Mata bagażnika',
    price: 299,
    category: 'Akcesoria',
    brand: 'Tesla',
    rating: 4.4,
    description:
      'Wodoodporna mata bagażnika dla Tesla Model 3. Chroni przed zabrudzeniem i wilgocią.',
    imageUrls: [
      'https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=800&auto=format&fit=crop',
    ],
  },
  {
    id: 'tesla-wireless-charger',
    name: 'Tesla Wireless Phone Charger',
    price: 329,
    category: 'Akcesoria',
    brand: 'Tesla',
    rating: 4.3,
    description:
      'Bezprzewodowa ładowarka do telefonu Tesla. Kompatybilna z Model S, 3, X i Y.',
    imageUrls: [
      'https://images.unsplash.com/photo-1594736797933-d0401ba4b7c0?q=80&w=800&auto=format&fit=crop',
    ],
  },
  {
    id: 'tesla-gen2-mobile-connector',
    name: 'Tesla Gen 2 Mobile Connector Bundle',
    price: 1299,
    category: 'Ładowarki',
    brand: 'Tesla',
    rating: 4.8,
    description:
      'Kompletny zestaw Gen 2 Mobile Connector z adapterami NEMA 14-50, 5-15 i J1772.',
    imageUrls: [
      'https://images.unsplash.com/photo-1609592606436-c0e3d0c4b3b9?q=80&w=800&auto=format&fit=crop',
    ],
  },
];

export const logoUrl = `${process.env.PUBLIC_URL}/logo.png`;
export const defaultProductImageUrl = `${process.env.PUBLIC_URL}/default-product.png`;
export const heroImageUrl = `${process.env.PUBLIC_URL}/hero-background.jpg`;
