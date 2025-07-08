import React, {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
} from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  ShoppingCart,
  User,
  Star,
  Menu,
  X,
  Trash2,
  Plus,
  Minus,
  Truck,
  CreditCard,
  ShieldCheck,
  Filter,
  LogOut,
  Settings,
  Zap,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

// Import obrazów dla kategorii
import categoryChargers from './assets/images/category-chargers.jpg';
import categoryAdapters from './assets/images/category-adapters.jpg';
import categoryAccessories from './assets/images/category-accessories.jpg';
import categoryBatteries from './assets/images/category-batteries.jpg';

// --- KONFIGURACJA FIREBASE (POPRAWIONA) ---
const firebaseConfig = {
  apiKey: 'AIzaSyC6L-8owWH1z6Ipf2FZax7gZ7FQOvuSNJs',
  authDomain: 'evshop-6719a.firebaseapp.com',
  projectId: 'evshop-6719a',
  storageBucket: 'evshop-6719a.firebasestorage.app',
  messagingSenderId: '619247072748',
  appId: '1:619247072748:web:ad274f442dba53736cbcc9',
  measurementId: 'G-Z80X8YRR4L',
};

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const logoUrl = `${process.env.PUBLIC_URL}/logo.png`;
const defaultProductImageUrl = `${process.env.PUBLIC_URL}/default-product.png`;
const heroImageUrl =
  'https://images.unsplash.com/photo-1619623697969-9f15038c1a16?q=80&w=2070&auto=format&fit=crop';

const categoriesData = [
  { name: 'Ładowarki', image: categoryChargers },
  { name: 'Adaptery', image: categoryAdapters },
  { name: 'Akcesoria', image: categoryAccessories },
  { name: 'Baterie', image: categoryBatteries },
];

// --- SAMPLE TESLA PRODUCTS ---
const sampleTeslaProducts = [
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

// --- API SERWIS (LIVE) ---
// Funkcje do interakcji z Firebase
const api = {
  fetchProducts: async () => {
    try {
      const productsCol = collection(db, 'products');
      const snapshot = await getDocs(productsCol);
      const firebaseProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Jeśli baza danych jest pusta, zwróć sample produkty Tesla
      if (firebaseProducts.length === 0) {
        return sampleTeslaProducts;
      }

      // Połącz produkty z Firebase z sample produktami Tesla
      const allProducts = [...firebaseProducts, ...sampleTeslaProducts];
      // Usuń duplikaty na podstawie ID
      const uniqueProducts = allProducts.filter(
        (product, index, self) =>
          index === self.findIndex(p => p.id === product.id)
      );

      return uniqueProducts;
    } catch (error) {
      console.error('Błąd podczas pobierania produktów:', error);
      // W przypadku błędu, zwróć sample produkty Tesla
      return sampleTeslaProducts;
    }
  },
  fetchCategories: async () => {
    return categoriesData;
  },
  fetchProduct: async id => {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },
  getReviews: (productId, callback) => {
    const reviewsQuery = query(collection(db, `products/${productId}/reviews`));
    return onSnapshot(reviewsQuery, snapshot => {
      const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(reviews);
    });
  },
  addReview: async (productId, review) => {
    await addDoc(collection(db, `products/${productId}/reviews`), review);
  },
  uploadImage: async file => {
    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  },
  deleteImage: async imageUrl => {
    // Zapobiegaj próbie usunięcia przykładowych zdjęć z unsplash
    if (imageUrl.includes('unsplash.com')) {
      console.log(
        'Próba usunięcia przykładowego zdjęcia - operacja zignorowana.'
      );
      return;
    }
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      if (error.code === 'storage/object-not-found') {
        console.warn(
          'Próbowano usunąć obraz, który nie istnieje w Firebase Storage:',
          imageUrl
        );
      } else {
        throw error;
      }
    }
  },
  // Funkcje dla admina
  addProduct: async product => addDoc(collection(db, 'products'), product),
  updateProduct: async (id, product) =>
    updateDoc(doc(db, 'products', id), product),
  deleteProduct: async id => deleteDoc(doc(db, 'products', id)),
  fetchOrders: async () => {
    const ordersCol = collection(db, 'orders');
    const snapshot = await getDocs(ordersCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  updateOrderStatus: async (id, status) =>
    updateDoc(doc(db, 'orders', id), { status }),
};

// --- CONTEXT API ---
const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

// Centrum powiadomień
const NotificationCenter = ({ notifications }) => (
  <div className="fixed top-5 right-5 z-50">
    <AnimatePresence>
      {notifications.map(note => (
        <motion.div
          key={note.id}
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.9 }}
          transition={{ duration: 0.4 }}
          className={`mb-2 p-4 rounded-lg shadow-xl text-white ${note.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}
        >
          {note.message}
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

// Ekran ładowania
const LoadingScreen = () => (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50">
    <div className="flex flex-col items-center">
      <Zap className="text-blue-400 w-16 h-16 animate-pulse" />
      <p className="text-white mt-4 text-lg">Ładowanie...</p>
    </div>
  </div>
);

// --- KOMPONENTY UI ---
const Header = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { user, userRole, cartItemCount, navigate, handleLogout } =
    useAppContext();

  return (
    <header className="bg-gray-900 bg-opacity-80 text-white p-4 flex items-center justify-between fixed top-0 left-0 right-0 z-40 backdrop-blur-sm">
      <div className="flex items-center space-x-6">
        <a onClick={() => navigate('home')} className="cursor-pointer">
          <img src={logoUrl} alt="EV-Shop Logo" className="h-10" />
        </a>
        <nav className="hidden md:flex items-center space-x-6">
          <a
            onClick={() => navigate('category', 'Ładowarki')}
            className="hover:text-blue-400 transition-colors"
          >
            Ładowarki
          </a>
          <a
            onClick={() => navigate('category', 'Adaptery')}
            className="hover:text-blue-400 transition-colors"
          >
            Adaptery
          </a>
          <a
            onClick={() => navigate('category', 'Akcesoria')}
            className="hover:text-blue-400 transition-colors"
          >
            Akcesoria
          </a>
          <a
            onClick={() => navigate('category', 'Baterie')}
            className="hover:text-blue-400 transition-colors"
          >
            Baterie
          </a>
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-4">
          <a
            onClick={() => navigate('cart')}
            className="relative cursor-pointer group"
          >
            <ShoppingCart className="h-7 w-7 text-gray-400 group-hover:text-blue-400 transition-colors" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                {cartItemCount}
              </span>
            )}
          </a>
          <div className="relative group">
            <a
              onClick={() => (user ? null : navigate('login'))}
              className="cursor-pointer"
            >
              <User className="h-7 w-7 text-gray-400 group-hover:text-blue-400 transition-colors" />
            </a>
            {user ? (
              <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="px-4 py-2 text-sm text-gray-400 border-b border-gray-700">
                  Zalogowano jako:
                </p>
                <p className="px-4 pt-1 pb-2 text-sm text-white truncate">
                  {user.email}
                </p>
                {userRole === 'admin' && (
                  <a
                    onClick={() => navigate('admin')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Panel Admina
                  </a>
                )}
                <a
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Wyloguj
                </a>
              </div>
            ) : (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <a
                  onClick={() => navigate('login')}
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer"
                >
                  Zaloguj się
                </a>
                <a
                  onClick={() => navigate('register')}
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer"
                >
                  Zarejestruj się
                </a>
              </div>
            )}
          </div>
        </div>
        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? (
              <X className="h-7 w-7" />
            ) : (
              <Menu className="h-7 w-7" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="bg-gray-900 text-gray-400 py-12">
    <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-4">
      <div>
        <h3 className="font-bold text-white mb-4">EV-Shop</h3>
        <p>Twoje źródło energii dla mobilności.</p>
      </div>
      <div>
        <h3 className="font-bold text-white mb-4">Kategorie</h3>
        <ul>
          <li>
            <a href="#" className="hover:text-white">
              Ładowarki
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-white">
              Adaptery
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-white">
              Akcesoria
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-white">
              Baterie
            </a>
          </li>
        </ul>
      </div>
      <div>
        <h3 className="font-bold text-white mb-4">Obsługa Klienta</h3>
        <ul>
          <li>
            <a href="#" className="hover:text-white">
              Kontakt
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-white">
              FAQ
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-white">
              Dostawa i zwroty
            </a>
          </li>
        </ul>
      </div>
      <div>
        <h3 className="font-bold text-white mb-4">Newsletter</h3>
        <input
          type="email"
          placeholder="Twój e-mail"
          className="bg-gray-800 p-2 rounded w-full mb-2"
        />
        <button className="bg-blue-600 text-white py-2 px-4 rounded w-full hover:bg-blue-700">
          Zapisz się
        </button>
      </div>
    </div>
    <div className="text-center mt-8 pt-8 border-t border-gray-800">
      <p>&copy; 2024 EV-Shop. Wszystkie prawa zastrzeżone.</p>
    </div>
  </footer>
);

const ProductCard = ({ product, navigate }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      onClick={() => navigate('product', product.id)}
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer group"
    >
      <div className="relative h-56">
        <img
          src={product.imageUrls[0] || defaultProductImageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.bestseller && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-gray-900 px-2 py-1 text-xs font-bold rounded">
            BESTSELLER
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white truncate">
          {product.name}
        </h3>
        <p className="text-gray-400 text-sm mb-2">
          {product.brand} - {product.category}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-blue-400">{product.price} PLN</p>
          <div className="flex items-center">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="text-white ml-1">{product.rating}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const BestsellersSection = ({ products, navigate }) => {
  const featuredProducts = products.filter(p => p.bestseller).slice(0, 4);

  return (
    <section className="py-20">
      <h2 className="text-3xl font-bold text-center mb-12 text-white">
        Bestsellery
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {featuredProducts.map(product => (
          <ProductCard key={product.id} product={product} navigate={navigate} />
        ))}
      </div>
    </section>
  );
};

const CategoriesSection = ({ categories, navigate }) => (
  <section className="py-20 bg-gray-800 text-white">
    <div className="container mx-auto px-4">
      <h2 className="text-4xl font-bold text-center mb-12">
        Przeglądaj Kategorie
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {categories.map((category, index) => (
          <motion.div
            key={category.name}
            className="category-card bg-gray-900 rounded-lg overflow-hidden shadow-lg cursor-pointer group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onClick={() => navigate('category', category.name)}
          >
            <div className="relative h-64">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {category.name}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const FeaturedInfoSection = () => (
  <section className="py-20 bg-gray-900 text-white">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold mb-8">Dlaczego EV-Shop?</h2>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="p-6">
          <Truck className="w-12 h-12 mx-auto text-blue-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Szybka Dostawa</h3>
          <p className="text-gray-400">
            Twoje zamówienie dotrze do Ciebie w mgnieniu oka.
          </p>
        </div>
        <div className="p-6">
          <CreditCard className="w-12 h-12 mx-auto text-blue-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Bezpieczne Płatności</h3>
          <p className="text-gray-400">
            Gwarantujemy bezpieczeństwo Twoich transakcji.
          </p>
        </div>
        <div className="p-6">
          <ShieldCheck className="w-12 h-12 mx-auto text-blue-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Gwarancja Jakości</h3>
          <p className="text-gray-400">
            Oferujemy tylko sprawdzone i certyfikowane produkty.
          </p>
        </div>
      </div>
    </div>
  </section>
);

const HomePage = ({ products, categories, navigate }) => (
  <div>
    <HeroSection navigate={navigate} />
    <main
      id="products-section"
      className="container mx-auto p-4 -mt-24 relative z-10 bg-gray-900 rounded-t-2xl shadow-lg"
    >
      <BestsellersSection products={products} navigate={navigate} />
      <CategoriesSection categories={categories} navigate={navigate} />
      <FeaturedInfoSection />
    </main>
  </div>
);

const CategoryPage = ({ navigate, products, categoryName }) => {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 30000]);
  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortBy, setSortBy] = useState('rating_desc');

  useEffect(() => {
    const categoryProducts = products.filter(p => p.category === categoryName);
    const availableBrands = [...new Set(categoryProducts.map(p => p.brand))];
    setBrands(availableBrands);
    setSelectedBrands(availableBrands);
    setFilteredProducts(categoryProducts); // Ustaw początkowe produkty
  }, [products, categoryName]);

  useEffect(() => {
    let tempProducts = products.filter(p => p.category === categoryName);

    // Wyszukiwanie
    if (searchTerm) {
      tempProducts = tempProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtracja po cenie
    tempProducts = tempProducts.filter(
      p => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Filtracja po marce
    tempProducts = tempProducts.filter(p => selectedBrands.includes(p.brand));

    // Sortowanie
    tempProducts.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'rating_desc':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    setFilteredProducts(tempProducts);
  }, [products, categoryName, searchTerm, priceRange, selectedBrands, sortBy]);

  const handleBrandChange = brand => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  return (
    <div className="container mx-auto mt-24 p-4 text-white">
      <h1 className="text-4xl font-bold mb-8 text-center">{categoryName}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Panel filtrów */}
        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg h-fit">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Filter className="mr-2" />
            Filtry
          </h2>

          {/* Wyszukiwanie */}
          <div className="mb-6">
            <label className="block mb-2">Szukaj</label>
            <input
              type="text"
              placeholder="Nazwa produktu..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded"
            />
          </div>

          {/* Zakres cen */}
          <div className="mb-6">
            <label className="block mb-2">
              Cena: {priceRange[0]} - {priceRange[1]} PLN
            </label>
            <input
              type="range"
              min="0"
              max="30000"
              step="100"
              value={priceRange[1]}
              onChange={e =>
                setPriceRange([priceRange[0], Number(e.target.value)])
              }
              className="w-full"
            />
          </div>

          {/* Marki */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Marka</h3>
            {brands.map(brand => (
              <div key={brand} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  id={brand}
                  checked={selectedBrands.includes(brand)}
                  onChange={() => handleBrandChange(brand)}
                  className="mr-2"
                />
                <label htmlFor={brand}>{brand}</label>
              </div>
            ))}
          </div>

          {/* Sortowanie */}
          <div>
            <label className="block mb-2">Sortuj według</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded"
            >
              <option value="rating_desc">Ocena malejąco</option>
              <option value="price_asc">Cena rosnąco</option>
              <option value="price_desc">Cena malejąco</option>
            </select>
          </div>
        </div>

        {/* Lista produktów */}
        <div className="lg:col-span-3">
          <AnimatePresence>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  navigate={navigate}
                />
              ))}
            </div>
          </AnimatePresence>
          {filteredProducts.length === 0 && (
            <p className="text-center text-gray-400 mt-10">
              Brak produktów spełniających kryteria.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const ReviewsSection = ({ productId, reviews }) => {
  const { user } = useAppContext();
  const [newReview, setNewReview] = useState({ rating: 5, text: '' });

  const handleReviewSubmit = async e => {
    e.preventDefault();
    if (!user) {
      alert('Musisz być zalogowany, aby dodać opinię.');
      return;
    }
    if (!newReview.text) {
      alert('Opinia nie może być pusta.');
      return;
    }
    await api.addReview(productId, {
      ...newReview,
      author: user.email,
      createdAt: new Date(),
    });
    setNewReview({ rating: 5, text: '' });
  };

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold mb-4">
        Opinie klientów ({reviews.length})
      </h3>
      <div className="space-y-6">
        {reviews.map(review => (
          <div key={review.id} className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                  />
                ))}
              </div>
              <p className="ml-4 font-semibold">{review.author}</p>
            </div>
            <p className="text-gray-300">{review.text}</p>
          </div>
        ))}
      </div>

      {user && (
        <form
          onSubmit={handleReviewSubmit}
          className="mt-8 bg-gray-800 p-6 rounded-lg"
        >
          <h4 className="text-xl font-semibold mb-4">Dodaj swoją opinię</h4>
          <div className="flex items-center mb-4">
            <span>Twoja ocena:</span>
            <div className="flex ml-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 cursor-pointer ${i < newReview.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                  onClick={() => setNewReview({ ...newReview, rating: i + 1 })}
                />
              ))}
            </div>
          </div>
          <textarea
            value={newReview.text}
            onChange={e => setNewReview({ ...newReview, text: e.target.value })}
            placeholder="Twoja opinia..."
            className="w-full p-2 bg-gray-700 rounded h-24 mb-4"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Dodaj opinię
          </button>
        </form>
      )}
    </div>
  );
};

const ProductPage = ({ navigate, productId }) => {
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart } = useAppContext();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const productData = await api.fetchProduct(productId);
      setProduct(productData);
      setIsLoading(false);
    };
    fetchData();

    const unsubscribe = api.getReviews(productId, setReviews);
    return () => unsubscribe();
  }, [productId]);

  if (isLoading) return <LoadingScreen />;
  if (!product)
    return (
      <div className="text-center mt-24 text-white">
        Produkt nie został znaleziony.
      </div>
    );

  return (
    <div className="container mx-auto mt-24 p-4 text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Galeria zdjęć */}
        <div>
          <div className="relative h-96 bg-gray-800 rounded-lg mb-4">
            <img
              src={product.imageUrls[activeImage]}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex space-x-2">
            {product.imageUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`${product.name} thumbnail ${index + 1}`}
                onClick={() => setActiveImage(index)}
                className={`w-24 h-24 object-cover rounded-md cursor-pointer border-2 ${activeImage === index ? 'border-blue-500' : 'border-transparent'}`}
              />
            ))}
          </div>
        </div>

        {/* Informacje o produkcie */}
        <div>
          <h1 className="text-4xl font-extrabold mb-2">{product.name}</h1>
          <p className="text-gray-400 mb-4">
            {product.brand} - {product.category}
          </p>
          <div className="flex items-center mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < product.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                />
              ))}
            </div>
            <span className="ml-2">({reviews.length} opinii)</span>
          </div>
          <p className="text-3xl font-bold text-blue-400 mb-6">
            {product.price} PLN
          </p>
          <p className="text-gray-300 mb-6">{product.description}</p>
          <button
            onClick={() => addToCart(product)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center text-lg"
          >
            <ShoppingCart className="mr-2" /> Dodaj do koszyka
          </button>
        </div>
      </div>
      <ReviewsSection productId={productId} reviews={reviews} />
    </div>
  );
};

const CartPage = ({ navigate }) => {
  const { cart, updateCartQuantity, removeFromCart, clearCart } =
    useAppContext();
  const totalPrice = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="container mx-auto mt-24 p-4 text-white">
      <h1 className="text-4xl font-bold mb-8">Twój Koszyk</h1>
      {cart.length === 0 ? (
        <div className="text-center">
          <p>Koszyk jest pusty.</p>
          <button
            onClick={() => navigate('home')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Wróć do sklepu
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <div
                key={item.id}
                className="flex items-center bg-gray-800 p-4 rounded-lg"
              >
                <img
                  src={item.imageUrls[0]}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-md mr-4"
                />
                <div className="flex-grow">
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="text-gray-400">{item.price} PLN</p>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() =>
                      updateCartQuantity(item.id, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1}
                    className="p-1 bg-gray-700 rounded"
                  >
                    <Minus />
                  </button>
                  <span className="w-12 text-center">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateCartQuantity(item.id, item.quantity + 1)
                    }
                    className="p-1 bg-gray-700 rounded"
                  >
                    <Plus />
                  </button>
                </div>
                <p className="w-24 text-right font-semibold">
                  {item.price * item.quantity} PLN
                </p>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="ml-4 text-gray-400 hover:text-red-500"
                >
                  <Trash2 />
                </button>
              </div>
            ))}
          </div>
          <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg h-fit">
            <h2 className="text-2xl font-bold mb-4">Podsumowanie</h2>
            <div className="flex justify-between mb-2">
              <span>Suma częściowa:</span>
              <span>{totalPrice.toFixed(2)} PLN</span>
            </div>
            <div className="flex justify-between mb-4">
              <span>Dostawa:</span>
              <span>GRATIS</span>
            </div>
            <div className="flex justify-between font-bold text-xl border-t border-gray-700 pt-4 mt-4">
              <span>Do zapłaty:</span>
              <span>{totalPrice.toFixed(2)} PLN</span>
            </div>
            <button
              onClick={() => navigate('checkout')}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
            >
              Przejdź do kasy
            </button>
            <button
              onClick={clearCart}
              className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg"
            >
              Wyczyść koszyk
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const CheckoutPage = ({ navigate }) => {
  const { cart, user, clearCart, addNotification, setOrderDetails } =
    useAppContext();
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    address: '',
    city: '',
    zip: '',
    country: 'Polska',
  });
  const [currentStep, setCurrentStep] = useState(1);

  const handleChange = e => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Logika płatności (symulacja)
      setCurrentStep(3);
      try {
        const orderData = {
          userId: user ? user.uid : 'guest',
          items: cart,
          total: cart.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
          ),
          shippingInfo,
          status: 'Nowe',
          createdAt: new Date(),
        };
        const docRef = await addDoc(collection(db, 'orders'), orderData);
        setOrderDetails({ ...orderData, id: docRef.id });
        clearCart();
        addNotification('Zamówienie złożone pomyślnie!', 'success');
        navigate('order-confirmation');
      } catch (error) {
        addNotification('Błąd podczas składania zamówienia.', 'error');
        console.error('Błąd zapisu zamówienia:', error);
        setCurrentStep(2); // Wróć do płatności w razie błędu
      }
    }
  };

  const ProgressBar = ({ currentStep }) => (
    <div className="flex items-center w-full mb-8">
      <div
        className={`flex-1 text-center ${currentStep >= 1 ? 'text-blue-400' : 'text-gray-500'}`}
      >
        <div className="mx-auto w-8 h-8 rounded-full border-2 flex items-center justify-center mb-1">
          1
        </div>
        Dostawa
      </div>
      <div
        className={`flex-1 h-0.5 ${currentStep >= 2 ? 'bg-blue-400' : 'bg-gray-700'}`}
      ></div>
      <div
        className={`flex-1 text-center ${currentStep >= 2 ? 'text-blue-400' : 'text-gray-500'}`}
      >
        <div className="mx-auto w-8 h-8 rounded-full border-2 flex items-center justify-center mb-1">
          2
        </div>
        Płatność
      </div>
      <div
        className={`flex-1 h-0.5 ${currentStep >= 3 ? 'bg-blue-400' : 'bg-gray-700'}`}
      ></div>
      <div
        className={`flex-1 text-center ${currentStep >= 3 ? 'text-blue-400' : 'text-gray-500'}`}
      >
        <div className="mx-auto w-8 h-8 rounded-full border-2 flex items-center justify-center mb-1">
          3
        </div>
        Potwierdzenie
      </div>
    </div>
  );

  return (
    <div className="container mx-auto mt-24 p-4 text-white">
      <h1 className="text-4xl font-bold mb-8 text-center">Zamówienie</h1>
      <ProgressBar currentStep={currentStep} />
      <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto bg-gray-800 p-8 rounded-lg"
      >
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-2xl font-semibold mb-6">Adres dostawy</h2>
              <input
                name="name"
                value={shippingInfo.name}
                onChange={handleChange}
                placeholder="Imię i nazwisko"
                className="w-full p-2 bg-gray-700 rounded mb-4"
                required
              />
              <input
                name="address"
                value={shippingInfo.address}
                onChange={handleChange}
                placeholder="Adres"
                className="w-full p-2 bg-gray-700 rounded mb-4"
                required
              />
              <input
                name="city"
                value={shippingInfo.city}
                onChange={handleChange}
                placeholder="Miasto"
                className="w-full p-2 bg-gray-700 rounded mb-4"
                required
              />
              <input
                name="zip"
                value={shippingInfo.zip}
                onChange={handleChange}
                placeholder="Kod pocztowy"
                className="w-full p-2 bg-gray-700 rounded mb-4"
                required
              />
            </motion.div>
          )}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-2xl font-semibold mb-6">Płatność</h2>
              <p className="text-center text-gray-400 mb-4">
                Symulacja płatności. Kliknij, aby sfinalizować.
              </p>
            </motion.div>
          )}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-2xl font-semibold mb-6 text-center">
                Przetwarzanie...
              </h2>
              <LoadingScreen />
            </motion.div>
          )}
        </AnimatePresence>
        <button
          type="submit"
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
        >
          {currentStep === 1 ? 'Przejdź do płatności' : 'Zapłać i zamów'}
        </button>
      </form>
    </div>
  );
};

const OrderConfirmationPage = ({ navigate, orderDetails }) => (
  <div className="container mx-auto mt-24 p-4 text-white text-center">
    <CheckCircle className="w-24 h-24 mx-auto text-green-500 mb-4" />
    <h1 className="text-4xl font-bold mb-4">Dziękujemy za zamówienie!</h1>
    <p className="text-lg text-gray-300 mb-8">
      Twoje zamówienie #{orderDetails.id.slice(0, 8)} zostało przyjęte.
    </p>
    <div className="max-w-md mx-auto bg-gray-800 p-6 rounded-lg text-left mb-8">
      <h2 className="text-xl font-semibold mb-4">Szczegóły zamówienia</h2>
      <p>
        <strong>Status:</strong> {orderDetails.status}
      </p>
      <p>
        <strong>Całkowita kwota:</strong> {orderDetails.total.toFixed(2)} PLN
      </p>
      <p>
        <strong>Adres dostawy:</strong> {orderDetails.shippingInfo.address},{' '}
        {orderDetails.shippingInfo.city}
      </p>
    </div>
    <button
      onClick={() => navigate('home')}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
    >
      Wróć na stronę główną
    </button>
  </div>
);

const AccessDenied = ({ navigate }) => (
  <div className="container mx-auto mt-24 p-4 text-white text-center">
    <AlertCircle className="w-24 h-24 mx-auto text-red-500 mb-4" />
    <h1 className="text-4xl font-bold mb-4">Brak dostępu</h1>
    <p className="text-lg text-gray-300 mb-8">
      Nie masz uprawnień do przeglądania tej strony.
    </p>
    <button
      onClick={() => navigate('home')}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
    >
      Wróć na stronę główną
    </button>
  </div>
);

const LoginPage = ({ navigate, addNotification }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { setUser } = useAppContext();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const additionalUserInfo = getAdditionalUserInfo(userCredential);

      // Create user doc only if they are a new user from Google Sign-In
      if (additionalUserInfo?.isNewUser) {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: userCredential.user.email,
          role: 'user',
          createdAt: new Date(),
        });
      }

      addNotification('Zalogowano pomyślnie!', 'success');
      navigate('home');
    } catch (error) {
      setError('Błąd logowania przez Google.');
      addNotification('Błąd logowania przez Google.', 'error');
    }
  };

  const handleLogin = async e => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      setUser(userCredential.user);
      addNotification('Zalogowano pomyślnie!', 'success');
      navigate('home');
    } catch (error) {
      setError('Nieprawidłowy email lub hasło.');
      addNotification('Nieprawidłowy email lub hasło.', 'error');
    }
  };

  const handleChange = e => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center">Logowanie</h1>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full p-3 bg-gray-700 rounded"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Hasło"
            onChange={handleChange}
            className="w-full p-3 bg-gray-700 rounded"
            required
          />
          <button
            type="submit"
            className="w-full p-3 bg-blue-600 rounded font-bold hover:bg-blue-700"
          >
            Zaloguj
          </button>
        </form>
        <div className="text-center text-gray-400">lub</div>
        <button
          onClick={handleGoogleLogin}
          className="w-full p-3 bg-red-600 rounded font-bold hover:bg-red-700 flex items-center justify-center"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png"
            alt="Google"
            className="w-5 h-5 mr-2"
          />
          Zaloguj przez Google
        </button>
        <div className="text-center">
          <a
            onClick={() => navigate('register')}
            className="font-medium text-blue-400 hover:text-blue-300 cursor-pointer"
          >
            Nie masz konta? Zarejestruj się
          </a>
        </div>
      </div>
    </div>
  );
};

const RegisterPage = ({ navigate, addNotification }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const { setUser } = useAppContext();

  const handleRegister = async e => {
    e.preventDefault();
    if (credentials.password !== credentials.confirmPassword) {
      setError('Hasła nie są zgodne.');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Ustawienie domyślnej roli 'user' dla nowego użytkownika
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        role: 'user',
        createdAt: new Date(),
      });

      setUser(userCredential.user);
      addNotification('Rejestracja pomyślna!', 'success');
      navigate('home');
    } catch (error) {
      setError('Błąd rejestracji. Sprawdź, czy email jest poprawny.');
      addNotification('Błąd rejestracji.', 'error');
    }
  };

  const handleChange = e => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center">Rejestracja</h1>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleRegister} className="space-y-6">
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full p-3 bg-gray-700 rounded"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Hasło"
            onChange={handleChange}
            className="w-full p-3 bg-gray-700 rounded"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Potwierdź hasło"
            onChange={handleChange}
            className="w-full p-3 bg-gray-700 rounded"
            required
          />
          <button
            type="submit"
            className="w-full p-3 bg-blue-600 rounded font-bold hover:bg-blue-700"
          >
            Zarejestruj
          </button>
        </form>
        <div className="text-center">
          <a
            onClick={() => navigate('login')}
            className="font-medium text-blue-400 hover:text-blue-300 cursor-pointer"
          >
            Masz już konto? Zaloguj się
          </a>
        </div>
      </div>
    </div>
  );
};

const AdminPanel = ({ navigate }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { userRole } = useAppContext();

  if (userRole !== 'admin') {
    return <AccessDenied navigate={navigate} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'products':
        return <AdminProducts />;
      case 'orders':
        return <AdminOrders />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="container mx-auto mt-24 p-4 text-white">
      <h1 className="text-4xl font-bold mb-8">Panel Administratora</h1>
      <div className="flex border-b border-gray-700 mb-8">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`py-2 px-4 ${activeTab === 'dashboard' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400'}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`py-2 px-4 ${activeTab === 'products' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400'}`}
        >
          Produkty
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-2 px-4 ${activeTab === 'orders' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400'}`}
        >
          Zamówienia
        </button>
      </div>
      <div>{renderContent()}</div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const products = await getDocs(collection(db, 'products'));
      const orders = await getDocs(collection(db, 'orders'));
      const users = await getDocs(collection(db, 'users'));
      const totalRevenue = orders.docs.reduce(
        (acc, doc) => acc + doc.data().total,
        0
      );
      setStats({
        products: products.size,
        orders: orders.size,
        users: users.size,
        revenue: totalRevenue,
      });
    };
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-gray-400">Produkty</h3>
        <p className="text-3xl font-bold">{stats.products}</p>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-gray-400">Zamówienia</h3>
        <p className="text-3xl font-bold">{stats.orders}</p>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-gray-400">Użytkownicy</h3>
        <p className="text-3xl font-bold">{stats.users}</p>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-gray-400">Przychód</h3>
        <p className="text-3xl font-bold">{stats.revenue.toFixed(2)} PLN</p>
      </div>
    </div>
  );
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useAppContext();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    const productsCol = query(collection(db, 'products'));
    const snapshot = await getDocs(productsCol);
    setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setIsLoading(false);
  };

  const handleSave = async productData => {
    setIsLoading(true);
    try {
      // Funkcja do czyszczenia pustych wartości, które nie są obsługiwane przez Firestore
      const cleanData = data => {
        const cleaned = {};
        for (const key in data) {
          if (
            data[key] !== null &&
            data[key] !== undefined &&
            data[key] !== ''
          ) {
            cleaned[key] = data[key];
          }
        }
        // Upewnij się, że imageUrls jest tablicą
        cleaned.imageUrls = Array.isArray(cleaned.imageUrls)
          ? cleaned.imageUrls
          : [];
        return cleaned;
      };

      const finalData = cleanData(productData);

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, finalData);
        addNotification('Produkt zaktualizowany!', 'success');
      } else {
        await api.addProduct(finalData);
        addNotification('Produkt dodany!', 'success');
      }
      fetchProducts();
    } catch (error) {
      console.error('Błąd zapisu produktu:', error);
      addNotification(`Błąd zapisu: ${error.message}`, 'error');
    }
    setIsModalOpen(false);
    setEditingProduct(null);
    setIsLoading(false);
  };

  const handleDelete = async id => {
    if (window.confirm('Czy na pewno chcesz usunąć ten produkt?')) {
      try {
        // Najpierw usuń powiązane obrazy
        const productToDelete = products.find(p => p.id === id);
        if (productToDelete && productToDelete.imageUrls) {
          for (const url of productToDelete.imageUrls) {
            await api.deleteImage(url);
          }
        }
        // Następnie usuń produkt
        await api.deleteProduct(id);
        addNotification('Produkt usunięty!', 'success');
        fetchProducts();
      } catch (error) {
        console.error('Błąd usuwania produktu:', error);
        addNotification(`Błąd usuwania: ${error.message}`, 'error');
      }
    }
  };

  const handleEdit = product => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <div>
      <button
        onClick={handleAddNew}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Dodaj nowy produkt
      </button>
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-4">Nazwa</th>
              <th className="p-4">Kategoria</th>
              <th className="p-4">Cena</th>
              <th className="p-4">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-b border-gray-700">
                <td className="p-4">{product.name}</td>
                <td className="p-4">{product.category}</td>
                <td className="p-4">{product.price} PLN</td>
                <td className="p-4">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-blue-400 hover:text-blue-300 mr-2"
                  >
                    Edytuj
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    Usuń
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <ProductEditModal
          product={editingProduct}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

const ProductEditModal = ({ product, onSave, onClose }) => {
  const [productData, setProductData] = useState(
    product || {
      name: '',
      price: '',
      category: '',
      brand: '',
      description: '',
      imageUrls: [],
      bestseller: false,
    }
  );
  const [isUploading, setIsUploading] = useState(false);
  const { addNotification } = useAppContext();

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePriceChange = e => {
    setProductData(prev => ({
      ...prev,
      price: parseFloat(e.target.value) || 0,
    }));
  };

  const handleImageUpload = async e => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      try {
        const url = await api.uploadImage(file);
        setProductData(prev => ({
          ...prev,
          imageUrls: [...(prev.imageUrls || []), url],
        }));
        addNotification('Zdjęcie dodane!', 'success');
      } catch (error) {
        addNotification('Błąd przesyłania zdjęcia.', 'error');
      }
      setIsUploading(false);
    }
  };

  const handleImageDelete = async urlToDelete => {
    if (window.confirm('Czy na pewno chcesz usunąć to zdjęcie?')) {
      try {
        await api.deleteImage(urlToDelete);
        setProductData(prev => ({
          ...prev,
          imageUrls: prev.imageUrls.filter(url => url !== urlToDelete),
        }));
        addNotification('Zdjęcie usunięte!', 'success');
      } catch (error) {
        console.error('Błąd usuwania zdjęcia:', error);
        addNotification('Błąd usuwania zdjęcia.', 'error');
      }
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSave(productData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-white rounded-lg p-8 w-full max-w-2xl max-h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">
          {product ? 'Edytuj produkt' : 'Dodaj produkt'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={productData.name}
            onChange={handleChange}
            placeholder="Nazwa"
            className="w-full p-2 bg-gray-700 rounded"
          />
          <input
            name="price"
            type="number"
            value={productData.price}
            onChange={handlePriceChange}
            placeholder="Cena"
            className="w-full p-2 bg-gray-700 rounded"
          />
          <input
            name="category"
            value={productData.category}
            onChange={handleChange}
            placeholder="Kategoria"
            className="w-full p-2 bg-gray-700 rounded"
          />
          <input
            name="brand"
            value={productData.brand}
            onChange={handleChange}
            placeholder="Marka"
            className="w-full p-2 bg-gray-700 rounded"
          />
          <textarea
            name="description"
            value={productData.description}
            onChange={handleChange}
            placeholder="Opis"
            className="w-full p-2 bg-gray-700 rounded h-24"
          />

          <div>
            <label className="block mb-2">Zdjęcia:</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {(productData.imageUrls || []).map(url => (
                <div key={url} className="relative group">
                  <img
                    src={url}
                    alt="product"
                    className="w-full h-24 object-cover rounded"
                  />
                  <button
                    onClick={() => handleImageDelete(url)}
                    type="button"
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <input
              type="file"
              onChange={handleImageUpload}
              className="w-full text-sm"
            />
            {isUploading && <p>Przesyłanie...</p>}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="bestseller"
              name="bestseller"
              checked={productData.bestseller}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="bestseller">Bestseller</label>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 bg-gray-600 rounded"
            >
              Anuluj
            </button>
            <button type="submit" className="py-2 px-4 bg-blue-600 rounded">
              Zapisz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const fetchedOrders = await api.fetchOrders();
      setOrders(fetchedOrders);
    };
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    await api.updateOrderStatus(orderId, newStatus);
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-700">
          <tr>
            <th className="p-4">ID Zamówienia</th>
            <th className="p-4">Klient</th>
            <th className="p-4">Data</th>
            <th className="p-4">Suma</th>
            <th className="p-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} className="border-b border-gray-700">
              <td className="p-4">{order.id.slice(0, 8)}...</td>
              <td className="p-4">{order.shippingInfo.name}</td>
              <td className="p-4">
                {new Date(order.createdAt.seconds * 1000).toLocaleDateString()}
              </td>
              <td className="p-4">{order.total.toFixed(2)} PLN</td>
              <td className="p-4">
                <select
                  value={order.status}
                  onChange={e => handleStatusChange(order.id, e.target.value)}
                  className="bg-gray-700 p-1 rounded"
                >
                  <option>Nowe</option>
                  <option>W trakcie realizacji</option>
                  <option>Wysłane</option>
                  <option>Zakończone</option>
                  <option>Anulowane</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const HeroSection = ({ navigate }) => (
  <section
    className="relative h-screen bg-cover bg-center flex flex-col items-center justify-center text-white"
    style={{ backgroundImage: `url(${heroImageUrl})` }}
  >
    <div className="absolute inset-0 bg-black opacity-50"></div>
    <div className="relative z-10 text-center container mx-auto px-4">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-4xl md:text-6xl font-extrabold mb-4"
      >
        Energia dla Twojej podróży
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="text-lg md:text-xl mb-8"
      >
        Najwyższej jakości ładowarki i akcesoria do pojazdów elektrycznych.
      </motion.p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('products')}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300"
      >
        Odkryj produkty
      </motion.button>
    </div>
  </section>
);

export default function App() {
  const [page, setPage] = useState('home');
  const [pageData, setPageData] = useState(null);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [cart, setCart] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const notificationId = useRef(0);

  // Ładowanie danych i nasłuchiwanie stanu autentykacji
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          // Użytkownik istnieje, wczytaj jego rolę
          setUserRole(userDoc.data().role);
        } else {
          // Nie twórz dokumentu tutaj, aby uniknąć nadpisywania ról.
          // Tworzenie dokumentu jest teraz obsługiwane w `handleRegister` i `handleGoogleLogin`.
          // Warunek wyścigu może oznaczać, że dokument nie jest od razu dostępny.
          // Domyślne ustawienie "user" lokalnie jest bezpieczne.
          setUserRole('user');
        }
      } else {
        setUserRole(null);
      }
      loadInitialData(); // Przeładuj dane po zmianie użytkownika
    });
    return () => unsubscribe();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    const [productsData, categoriesData] = await Promise.all([
      api.fetchProducts(),
      api.fetchCategories(),
    ]);
    setProducts(productsData);
    setCategories(categoriesData);
    setIsLoading(false);
  };

  // Obsługa koszyka
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addNotification = (message, type = 'success') => {
    const id = notificationId.current++;
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(note => note.id !== id));
    }, 3000);
  };

  const navigate = (newPage, data = null) => {
    setPage(newPage);
    setPageData(data);
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false); // Zamknij menu mobilne przy nawigacji
  };

  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
    addNotification(`${product.name} dodano do koszyka!`, 'success');
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      setCart(
        cart.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeFromCart = productId => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const clearCart = () => setCart([]);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = async () => {
    await signOut(auth);
    addNotification('Wylogowano pomyślnie.', 'success');
    navigate('home');
  };

  const renderPage = () => {
    switch (page) {
      case 'home':
        return (
          <HomePage
            products={products}
            categories={categories}
            navigate={navigate}
          />
        );
      case 'category':
        return (
          <CategoryPage
            navigate={navigate}
            products={products}
            categoryName={pageData}
          />
        );
      case 'product':
        return <ProductPage navigate={navigate} productId={pageData} />;
      case 'cart':
        return <CartPage navigate={navigate} />;
      case 'checkout':
        return <CheckoutPage navigate={navigate} />;
      case 'order-confirmation':
        return (
          <OrderConfirmationPage
            navigate={navigate}
            orderDetails={orderDetails}
          />
        );
      case 'login':
        return (
          <LoginPage navigate={navigate} addNotification={addNotification} />
        );
      case 'register':
        return (
          <RegisterPage navigate={navigate} addNotification={addNotification} />
        );
      case 'admin':
        return <AdminPanel navigate={navigate} />;
      default:
        return (
          <HomePage
            products={products}
            categories={categories}
            navigate={navigate}
          />
        );
    }
  };

  const contextValue = {
    user,
    userRole,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartItemCount,
    navigate,
    addNotification,
    handleLogout,
    setUser,
    setOrderDetails,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="bg-gray-900 min-h-screen font-sans">
        {isLoading && <LoadingScreen />}
        <NotificationCenter notifications={notifications} />
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <AnimatePresence mode="wait">
          <motion.main
            key={page}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderPage()}
          </motion.main>
        </AnimatePresence>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-64 bg-gray-800 z-30 p-6 md:hidden"
            >
              <nav className="flex flex-col space-y-4 text-white">
                <a
                  onClick={() => navigate('category', 'Ładowarki')}
                  className="hover:text-blue-400"
                >
                  Ładowarki
                </a>
                <a
                  onClick={() => navigate('category', 'Adaptery')}
                  className="hover:text-blue-400"
                >
                  Adaptery
                </a>
                <a
                  onClick={() => navigate('category', 'Akcesoria')}
                  className="hover:text-blue-400"
                >
                  Akcesoria
                </a>
                <a
                  onClick={() => navigate('category', 'Baterie')}
                  className="hover:text-blue-400"
                >
                  Baterie
                </a>
                <hr className="border-gray-700" />
                <a
                  onClick={() => navigate('cart')}
                  className="hover:text-blue-400"
                >
                  Koszyk ({cartItemCount})
                </a>
                {user ? (
                  <>
                    {userRole === 'admin' && (
                      <a
                        onClick={() => navigate('admin')}
                        className="hover:text-blue-400"
                      >
                        Panel Admina
                      </a>
                    )}
                    <a onClick={handleLogout} className="hover:text-blue-400">
                      Wyloguj
                    </a>
                  </>
                ) : (
                  <>
                    <a
                      onClick={() => navigate('login')}
                      className="hover:text-blue-400"
                    >
                      Zaloguj się
                    </a>
                    <a
                      onClick={() => navigate('register')}
                      className="hover:text-blue-400"
                    >
                      Zarejestruj się
                    </a>
                  </>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        <Footer />
      </div>
    </AppContext.Provider>
  );
}
