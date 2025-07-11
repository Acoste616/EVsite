import React, {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
} from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  getDocs,
  query,
} from 'firebase/firestore';
import { auth, db } from './services/firebase';
import { api } from './services/api';
import { heroImageUrl } from './constants/sampleData';
import Header from './components/Header';
import Footer from './components/Footer';
import ProductCard from './components/ProductCard';
import ErrorBoundary from './components/ErrorBoundary';
import PerformanceMonitor from './components/PerformanceMonitor';
import AccessibilityHelper from './components/AccessibilityHelper';
import {
  ShoppingCart,
  Star,
  Trash2,
  Plus,
  Minus,
  Truck,
  CreditCard,
  ShieldCheck,
  Filter,
  Zap,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

// Import obrazów dla kategorii
// Category images are now imported in constants/sampleData.js

// Firebase services are now imported from services/firebase.js

// Data constants are now imported from constants/sampleData.js

// API service is now imported from services/api.js

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

// Extracted UI components are now imported from components/

// Footer component moved to components/Footer.js

// ProductCard component moved to components/ProductCard.js

const BestsellersSection = ({ products, navigate, addToCart }) => {
  const featuredProducts = products.filter(p => p.bestseller).slice(0, 4);

  return (
    <section className="py-20">
      <h2 className="text-3xl font-bold text-center mb-12 text-white">
        Bestsellery
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {featuredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            navigate={navigate}
            addToCart={addToCart}
          />
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

const HomePage = ({ products, categories, navigate, addToCart }) => (
  <div>
    <HeroSection navigate={navigate} />
    <main
      id="products-section"
      className="container mx-auto p-4 -mt-24 relative z-10 bg-gray-900 rounded-t-2xl shadow-lg"
    >
      <BestsellersSection
        products={products}
        navigate={navigate}
        addToCart={addToCart}
      />
      <CategoriesSection categories={categories} navigate={navigate} />
      <FeaturedInfoSection />
    </main>
  </div>
);

const CategoryPage = ({ navigate, products, categoryName, addToCart }) => {
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
                  addToCart={addToCart}
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

const HeroSection = ({ navigate }) => {
  const [bgImageError, setBgImageError] = useState(false);

  const handleBgImageError = () => {
    setBgImageError(true);
  };

  return (
    <section
      className="relative w-full h-screen min-h-screen flex items-center justify-center overflow-hidden p-0 m-0"
      style={{ minHeight: '100vh', height: '100vh', maxHeight: '1200px' }}
    >
      {/* Background image fills the viewport */}
      {!bgImageError && (
        <img
          src={heroImageUrl}
          alt="Tło EV-Shop"
          className="absolute top-0 left-0 w-full h-full object-cover object-center z-0 select-none pointer-events-none"
          style={{ width: '100vw', height: '100vh', minHeight: '100vh', minWidth: '100vw' }}
          onError={handleBgImageError}
          draggable="false"
        />
      )}
      {/* Overlay for readability */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/80 via-black/40 to-black/90 z-10 pointer-events-none" />
      {/* Animated SVG lines with horizontal mask (glow only on sides) */}
      <svg
        className="absolute top-0 left-0 w-full h-full z-20 pointer-events-none"
        viewBox="0 0 1920 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100vw', height: '100vh', minWidth: '100vw', minHeight: '100vh', maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,1) 100%)', WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,1) 100%)' }}
      >
        <g>
          <path
            d="M0 400 Q480 200 960 400 T1920 400"
            stroke="#00eaff"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="hero-line"
          />
          <path
            d="M0 500 Q480 300 960 500 T1920 500"
            stroke="#00eaff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="hero-line hero-line-delay"
          />
          <path
            d="M0 600 Q480 400 960 600 T1920 600"
            stroke="#00eaff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="hero-line hero-line-delay2"
          />
        </g>
      </svg>
      {/* Content (car + text) above lines */}
      <div className="relative z-30 flex flex-col items-center justify-center w-full h-full text-center container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl md:text-6xl font-extrabold mb-4 neon-text"
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
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 shadow-lg shadow-blue-400/30"
        >
          Odkryj produkty
        </motion.button>
      </div>
      <style>{`
        .neon-text {
          text-shadow:
            0 0 8px #00eaff,
            0 0 16px #00eaff,
            0 0 32px #00eaff,
            0 0 64px #00eaff;
          animation: neon-glow 2s infinite alternate;
        }
        @keyframes neon-glow {
          0% { text-shadow: 0 0 8px #00eaff, 0 0 16px #00eaff, 0 0 32px #00eaff, 0 0 64px #00eaff; }
          100% { text-shadow: 0 0 24px #00eaff, 0 0 48px #00eaff, 0 0 96px #00eaff, 0 0 128px #00eaff; }
        }
        .hero-line {
          filter: drop-shadow(0 0 12px #00eaff);
          opacity: 0.7;
          stroke-dasharray: 3000;
          stroke-dashoffset: 0;
          animation: line-pulse 3s infinite alternate;
        }
        .hero-line-delay {
          animation-delay: 1s;
        }
        .hero-line-delay2 {
          animation-delay: 2s;
        }
        @keyframes line-pulse {
          0% { opacity: 0.3; stroke-dashoffset: 0; }
          50% { opacity: 1; stroke-dashoffset: 100; }
          100% { opacity: 0.3; stroke-dashoffset: 0; }
        }
      `}</style>
    </section>
  );
};

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
            addToCart={addToCart}
          />
        );
      case 'category':
        return (
          <CategoryPage
            navigate={navigate}
            products={products}
            categoryName={pageData}
            addToCart={addToCart}
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
            addToCart={addToCart}
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
    <ErrorBoundary>
      <PerformanceMonitor />
      <AccessibilityHelper />
      <AppContext.Provider value={contextValue}>
        <div className="bg-gray-900 min-h-screen font-sans">
          {isLoading && <LoadingScreen />}
          <NotificationCenter notifications={notifications} />
          <Header
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            user={user}
            userRole={userRole}
            cartItemCount={cartItemCount}
            navigate={navigate}
            handleLogout={handleLogout}
          />

          <AnimatePresence mode="wait">
            <motion.main
              id="main-content"
              role="main"
              aria-label="Główna treść strony"
              key={page}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              tabIndex="-1"
            >
              <ErrorBoundary>{renderPage()}</ErrorBoundary>
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
    </ErrorBoundary>
  );
}
