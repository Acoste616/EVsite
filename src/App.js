import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ShoppingCart, User, Star, Menu, X, Trash2, Plus, Minus, Truck, CreditCard, ShieldCheck, Search, Filter, LogOut, Settings, ArrowRight, Eye, Zap, ImagePlus, AlertCircle, CheckCircle, BarChart } from 'lucide-react';

// --- KONFIGURACJA FIREBASE (ZAKTUALIZOWANA) ---
const firebaseConfig = {
  apiKey: "AIzaSyC6L-8owWH1z6Ipf2FZax7gZ7FQOvuSNJs",
  authDomain: "evshop-6719a.firebaseapp.com",
  projectId: "evshop-6719a",
  storageBucket: "evshop-6719a.appspot.com", // Poprawiona domena dla Storage
  messagingSenderId: "619247072748",
  appId: "1:619247072748:web:ad274f442dba53736cbcc9",
  measurementId: "G-Z80X8YRR4L"
};


// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

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
    description: 'Najszybsza ładowarka domowa Tesla z mocą do 11.5 kW. Idealna do codziennego użytku domowego.',
    imageUrls: [
      'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop'
    ]
  },
  {
    id: 'tesla-mobile-connector',
    name: 'Tesla Mobile Connector',
    price: 899,
    category: 'Ładowarki',
    brand: 'Tesla',
    rating: 4.8,
    bestseller: true,
    description: 'Przenośna ładowarka Tesla z adapterami do różnych gniazdek. Niezbędna w każdej podróży.',
    imageUrls: [
      'https://images.unsplash.com/photo-1609592606436-c0e3d0c4b3b9?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1621784377641-2c1a2c7a4b91?q=80&w=800&auto=format&fit=crop'
    ]
  },
  {
    id: 'tesla-chademo-adapter',
    name: 'Tesla CHAdeMO Adapter',
    price: 1299,
    category: 'Adaptery',
    brand: 'Tesla',
    rating: 4.7,
    description: 'Adapter CHAdeMO umożliwiający ładowanie Tesla na stacjach CHAdeMO o mocy do 50 kW.',
    imageUrls: [
      'https://images.unsplash.com/photo-1626668011687-8a114d5c1604?q=80&w=800&auto=format&fit=crop'
    ]
  },
  {
    id: 'tesla-j1772-adapter',
    name: 'Tesla J1772 Adapter',
    price: 399,
    category: 'Adaptery',
    brand: 'Tesla',
    rating: 4.6,
    description: 'Adapter J1772 pozwalający na ładowanie Tesla na publicznych stacjach J1772.',
    imageUrls: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop'
    ]
  },
  {
    id: 'tesla-supercharger-cable',
    name: 'Tesla Supercharger Cable (zapasowy)',
    price: 699,
    category: 'Akcesoria',
    brand: 'Tesla',
    rating: 4.8,
    description: 'Zapasowy kabel do ładowarki Tesla Supercharger. Wytrzymały i niezawodny.',
    imageUrls: [
      'https://images.unsplash.com/photo-1609592606436-c0e3d0c4b3b9?q=80&w=800&auto=format&fit=crop'
    ]
  },
  {
    id: 'tesla-powerwall',
    name: 'Tesla Powerwall 2',
    price: 28999,
    category: 'Baterie',
    brand: 'Tesla',
    rating: 4.9,
    bestseller: true,
    description: 'Domowa bateria Tesla Powerwall 2 o pojemności 13,5 kWh. Zapewnia niezależność energetyczną.',
    imageUrls: [
      'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=800&auto=format&fit=crop'
    ]
  },
  {
    id: 'tesla-model-s-floor-mats',
    name: 'Tesla Model S - Dywaniki podłogowe',
    price: 459,
    category: 'Akcesoria',
    brand: 'Tesla',
    rating: 4.5,
    description: 'Oryginalne dywaniki podłogowe Tesla Model S. Idealne dopasowanie i wysoka jakość.',
    imageUrls: [
      'https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=800&auto=format&fit=crop'
    ]
  },
  {
    id: 'tesla-model-3-trunk-mat',
    name: 'Tesla Model 3 - Mata bagażnika',
    price: 299,
    category: 'Akcesoria',
    brand: 'Tesla',
    rating: 4.4,
    description: 'Wodoodporna mata bagażnika dla Tesla Model 3. Chroni przed zabrudzeniem i wilgocią.',
    imageUrls: [
      'https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=800&auto=format&fit=crop'
    ]
  },
  {
    id: 'tesla-wireless-charger',
    name: 'Tesla Wireless Phone Charger',
    price: 329,
    category: 'Akcesoria',
    brand: 'Tesla',
    rating: 4.3,
    description: 'Bezprzewodowa ładowarka do telefonu Tesla. Kompatybilna z Model S, 3, X i Y.',
    imageUrls: [
      'https://images.unsplash.com/photo-1594736797933-d0401ba4b7c0?q=80&w=800&auto=format&fit=crop'
    ]
  },
  {
    id: 'tesla-gen2-mobile-connector',
    name: 'Tesla Gen 2 Mobile Connector Bundle',
    price: 1299,
    category: 'Ładowarki',
    brand: 'Tesla',
    rating: 4.8,
    description: 'Kompletny zestaw Gen 2 Mobile Connector z adapterami NEMA 14-50, 5-15 i J1772.',
    imageUrls: [
      'https://images.unsplash.com/photo-1609592606436-c0e3d0c4b3b9?q=80&w=800&auto=format&fit=crop'
    ]
  }
];

// --- API SERWIS (LIVE) ---
// Funkcje do interakcji z Firebase
const api = {
  fetchProducts: async () => {
    try {
      const productsCol = collection(db, 'products');
      const snapshot = await getDocs(productsCol);
      const firebaseProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Jeśli baza danych jest pusta, zwróć sample produkty Tesla
      if (firebaseProducts.length === 0) {
        return sampleTeslaProducts;
      }
      
      // Połącz produkty z Firebase z sample produktami Tesla
      const allProducts = [...firebaseProducts, ...sampleTeslaProducts];
      // Usuń duplikaty na podstawie ID
      const uniqueProducts = allProducts.filter((product, index, self) => 
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
    const products = await api.fetchProducts();
    const categoryNames = [...new Set(products.map(p => p.category))];
    // Użyj prawdziwych zdjęć dla kategorii, jeśli są dostępne, w przeciwnym razie placeholder
    const defaultImage = "https://images.unsplash.com/photo-1633886122439-d852891157c3?q=80&w=800&auto=format&fit=crop";
    return categoryNames.map(name => ({
        name,
        image: products.find(p => p.category === name)?.imageUrls?.[0] || defaultImage
    }));
  },
  fetchProduct: async (id) => {
    try {
      // Najpierw sprawdź Firebase
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      
      // Jeśli nie ma w Firebase, sprawdź sample products
      const sampleProduct = sampleTeslaProducts.find(p => p.id === id);
      if (sampleProduct) {
        console.log('Found sample product:', sampleProduct.name);
        return sampleProduct;
      }
      
      console.warn('Product not found:', id);
      return null;
    } catch (error) {
      console.warn('Error fetching product, trying sample data:', error);
      // W przypadku błędu Firebase, sprawdź sample products
      const sampleProduct = sampleTeslaProducts.find(p => p.id === id);
      return sampleProduct || null;
    }
  },
  getReviews: (productId, callback) => {
    const reviewsQuery = query(collection(db, `products/${productId}/reviews`));
    return onSnapshot(reviewsQuery, (snapshot) => {
      const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(reviews);
    });
  },
  addReview: async (productId, review) => {
    await addDoc(collection(db, `products/${productId}/reviews`), review);
  },
  uploadImage: async (file) => {
    try {
      if (!file) {
        throw new Error('Nie wybrano pliku');
      }
      
      // Walidacja typu pliku
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Nieprawidłowy typ pliku. Dozwolone: JPG, PNG, WEBP');
      }
      
      // Walidacja rozmiaru (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('Plik jest za duży. Maksymalny rozmiar: 5MB');
      }
      
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
      
      // Upload z timeout (30 sekund)
      const uploadWithTimeout = Promise.race([
        uploadBytes(storageRef, file),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Upload timeout - przekroczono 30 sekund')), 30000)
        )
      ]);
      
      await uploadWithTimeout;
      
      // Download URL z timeout (10 sekund)
      const urlWithTimeout = Promise.race([
        getDownloadURL(storageRef),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout pobierania URL')), 10000)
        )
      ]);
      
      const downloadURL = await urlWithTimeout;
      
      console.log('Upload successful, URL:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('Upload error:', error);
      
      // Lepsze błędy Firebase Storage
      if (error.code === 'storage/unauthorized') {
        throw new Error('Brak uprawnień do uploadu. Sprawdź konfigurację Firebase Storage.');
      } else if (error.code === 'storage/quota-exceeded') {
        throw new Error('Przekroczono limit miejsca na Firebase Storage.');
      } else if (error.code === 'storage/invalid-format') {
        throw new Error('Nieprawidłowy format pliku.');
      } else if (error.code === 'storage/network-request-failed') {
        throw new Error('Błąd sieci. Sprawdź połączenie internetowe i spróbuj ponownie.');
      } else if (error.code === 'storage/retry-limit-exceeded') {
        throw new Error('Przekroczono limit prób uploadu. Spróbuj ponownie za chwilę.');
      } else if (error.code === 'storage/timeout') {
        throw new Error('Przekroczono limit czasu uploadu. Spróbuj z mniejszym plikiem.');
      } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        throw new Error('Przekroczono limit czasu. Sprawdź połączenie internetowe.');
      } else if (error.message.includes('Network')) {
        throw new Error('Błąd sieci. Sprawdź połączenie internetowe.');
      }
      
      // Ogólny błąd z dodatkowym kontekstem
      throw new Error(`Błąd uploadu: ${error.message || 'Nieznany błąd'}`);
    }
  },
  // Funkcje dla admina z obsługą błędów
  addProduct: async (product) => {
    try {
      return await addDoc(collection(db, 'products'), product);
    } catch (error) {
      console.error('Błąd dodawania produktu:', error);
      if (error.code === 'permission-denied') {
        throw new Error('Brak uprawnień do dodawania produktów. Skonfiguruj reguły Firebase.');
      }
      throw new Error('Nie można dodać produktu. Sprawdź połączenie.');
    }
  },
  updateProduct: async (id, product) => {
    try {
      return await updateDoc(doc(db, 'products', id), product);
    } catch (error) {
      console.error('Błąd aktualizacji produktu:', error);
      if (error.code === 'permission-denied') {
        throw new Error('Brak uprawnień do edycji produktów. Skonfiguruj reguły Firebase.');
      }
      throw new Error('Nie można zaktualizować produktu.');
    }
  },
  deleteProduct: async (id) => {
    try {
      return await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      console.error('Błąd usuwania produktu:', error);
      if (error.code === 'permission-denied') {
        throw new Error('Brak uprawnień do usuwania produktów. Skonfiguruj reguły Firebase.');
      }
      throw new Error('Nie można usunąć produktu.');
    }
  },
  fetchOrders: async () => {
    const ordersCol = collection(db, 'orders');
    const snapshot = await getDocs(ordersCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  updateOrderStatus: async (id, status) => updateDoc(doc(db, 'orders', id), { status }),
};

// --- CONTEXT API ---
const AppContext = createContext();

// --- KOMPONENTY UI ---

const PermissionErrorDisplay = ({ message }) => (
    <div className="fixed inset-0 bg-gray-900/95 flex items-center justify-center z-[100] p-8 text-center">
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-8 max-w-2xl">
            <AlertCircle className="h-16 w-16 mx-auto text-red-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Błąd Konfiguracji Firebase</h2>
            <p className="text-red-200">{message}</p>
            <p className="text-gray-400 mt-4 text-sm">
                Wygląda na to, że Twoja baza danych Firestore ma nieprawidłowe reguły bezpieczeństwa. Przejdź do panelu Firebase, wybierz bazę Firestore, przejdź do zakładki "Reguły" (Rules) i wklej reguły podane w dokumentacji projektu.
            </p>
        </div>
    </div>
);

const NotificationCenter = ({ notifications }) => (
    <div className="fixed top-24 right-4 z-[100] space-y-2">
        {(notifications || []).map(n => {
            let bgColor = 'bg-red-600';
            let icon = <AlertCircle className="mr-2" />;
            
            if (n.type === 'success') {
                bgColor = 'bg-green-600';
                icon = <CheckCircle className="mr-2" />;
            } else if (n.type === 'info') {
                bgColor = 'bg-blue-600';
                icon = <AlertCircle className="mr-2" />;
            } else if (n.type === 'warning') {
                bgColor = 'bg-yellow-600';
                icon = <AlertCircle className="mr-2" />;
            }
            
            return (
                <div key={n.id} className={`flex items-center p-4 rounded-lg shadow-lg animate-fade-in-right ${bgColor} text-white max-w-md`}>
                    {icon}
                    <span className="text-sm">{n.message}</span>
                </div>
            );
        })}
    </div>
);

const LoadingScreen = () => (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 flex flex-col items-center justify-center z-[100]">
        <div className="relative">
            {/* Animated background circles */}
            <div className="absolute -top-8 -left-8 w-16 h-16 bg-blue-500/20 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-8 -right-8 w-12 h-12 bg-purple-500/20 rounded-full animate-pulse delay-1000"></div>
            
            {/* Main content */}
            <div className="flex items-center space-x-3 animate-fade-in-up">
                <div className="relative">
                    <Zap className="h-12 w-12 text-blue-500 animate-pulse" />
                    <div className="absolute inset-0 animate-ping">
                        <Zap className="h-12 w-12 text-blue-400 opacity-20" />
                    </div>
                </div>
                <span className="text-3xl font-bold text-gradient">EV Akcesoria</span>
            </div>
        </div>
        
        <div className="mt-8 animate-fade-in-up delay-300">
            <p className="text-gray-400 text-lg mb-4">Ładowanie przyszłości...</p>
            
            {/* Loading bar */}
            <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            </div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-400 rounded-full animate-bounce delay-1000"></div>
            <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-bounce delay-3000"></div>
        </div>
    </div>
);

const Header = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
    const { navigate, cartItemCount, user, userRole, handleLogout, categories } = useContext(AppContext);
    const navLinks = (
        <>
            <a onClick={() => navigate('home')} className="cursor-pointer hover:text-blue-400 transition-colors">Strona główna</a>
            <a onClick={() => navigate('category', 'Wszystkie')} className="cursor-pointer hover:text-blue-400 transition-colors">Produkty</a>
            {(categories || []).slice(0, 3).map(cat => (
                 <a key={cat.name} onClick={() => navigate('category', cat.name)} className="cursor-pointer hover:text-blue-400 transition-colors">{cat.name}</a>
            ))}
        </>
    );

    return (
        <header className="glass-effect border-b border-gray-700/50 fixed top-0 left-0 right-0 z-50 animate-slide-in-down">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex-shrink-0">
                        <a onClick={() => navigate('home')} className="flex items-center space-x-2 cursor-pointer group">
                            <div className="relative">
                                <Zap className="h-8 w-8 text-blue-500 transition-all duration-300 group-hover:text-blue-400 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-blue-500/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-300"></div>
                            </div>
                            <span className="text-2xl font-bold text-gradient group-hover:scale-105 transition-transform duration-300">EV Akcesoria</span>
                        </a>
                    </div>
                    <nav className="hidden md:flex md:space-x-8 items-center text-lg font-medium text-gray-300">
                        <div className="flex space-x-8">
                            <a onClick={() => navigate('home')} className="cursor-pointer hover:text-blue-400 transition-all duration-300 relative group">
                                Strona główna
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
                            </a>
                            <a onClick={() => navigate('category', 'Wszystkie')} className="cursor-pointer hover:text-blue-400 transition-all duration-300 relative group">
                                Produkty
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
                            </a>
                            {(categories || []).slice(0, 3).map(cat => (
                                 <a key={cat.name} onClick={() => navigate('category', cat.name)} className="cursor-pointer hover:text-blue-400 transition-all duration-300 relative group">
                                    {cat.name}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
                                </a>
                            ))}
                        </div>
                    </nav>
                    <div className="flex items-center space-x-4">
                        <a onClick={() => navigate('cart')} className="relative cursor-pointer group">
                            <div className="relative">
                                <ShoppingCart className="h-7 w-7 text-gray-400 group-hover:text-blue-400 transition-all duration-300 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-blue-400/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-300"></div>
                            </div>
                            {cartItemCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce font-bold shadow-lg">
                                    {cartItemCount}
                                </span>
                            )}
                        </a>
                        <div className="relative group">
                             <a onClick={() => user ? null : navigate('login')} className="cursor-pointer">
                                <div className="relative">
                                    <User className="h-7 w-7 text-gray-400 group-hover:text-blue-400 transition-all duration-300 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-blue-400/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-300"></div>
                                    {user && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                    )}
                                </div>
                            </a>
                            {user ? (
                                <div className="absolute right-0 mt-2 w-56 glass-effect border border-gray-700 rounded-lg shadow-xl py-2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100">
                                    <div className="px-4 py-2 border-b border-gray-700/50">
                                        <p className="text-xs text-gray-400">Zalogowano jako:</p>
                                        <p className="text-sm text-white truncate font-medium">{user.email}</p>
                                        {userRole === 'admin' && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-600/20 text-blue-400 border border-blue-600/30 mt-1">
                                                <Settings className="w-3 h-3 mr-1" />
                                                Administrator
                                            </span>
                                        )}
                                    </div>
                                    {userRole === 'admin' && (
                                        <a onClick={() => navigate('admin')} className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-blue-600/20 hover:text-blue-400 cursor-pointer transition-colors">
                                            <Settings className="w-4 h-4 mr-3" />
                                            Panel Admina
                                        </a>
                                    )}
                                    <a onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-red-600/20 hover:text-red-400 cursor-pointer transition-colors">
                                        <LogOut className="w-4 h-4 mr-3" />
                                        Wyloguj
                                    </a>
                                </div>
                            ) : (
                                <div className="absolute right-0 mt-2 w-48 glass-effect border border-gray-700 rounded-lg shadow-xl py-2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100">
                                    <a onClick={() => navigate('login')} className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-blue-600/20 hover:text-blue-400 cursor-pointer transition-colors">
                                        <User className="w-4 h-4 mr-3" />
                                        Zaloguj się
                                    </a>
                                    <a onClick={() => navigate('register')} className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-green-600/20 hover:text-green-400 cursor-pointer transition-colors">
                                        <User className="w-4 h-4 mr-3" />
                                        Zarejestruj się
                                    </a>
                                </div>
                            )}
                        </div>
                        <div className="md:hidden">
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                                {isMobileMenuOpen ? <X className="h-7 w-7 text-gray-300" /> : <Menu className="h-7 w-7 text-gray-300" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {isMobileMenuOpen && (
                <div className="md:hidden glass-effect shadow-xl border-t border-gray-700/50 animate-slide-in-down">
                    <nav className="flex flex-col space-y-2 p-4 text-gray-300">
                        <a onClick={() => navigate('home')} className="px-4 py-3 rounded-lg hover:bg-blue-600/20 hover:text-blue-400 cursor-pointer transition-all duration-300 flex items-center">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100"></div>
                            Strona główna
                        </a>
                        <a onClick={() => navigate('category', 'Wszystkie')} className="px-4 py-3 rounded-lg hover:bg-blue-600/20 hover:text-blue-400 cursor-pointer transition-all duration-300 flex items-center">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100"></div>
                            Produkty
                        </a>
                        {(categories || []).slice(0, 3).map(cat => (
                             <a key={cat.name} onClick={() => navigate('category', cat.name)} className="px-4 py-3 rounded-lg hover:bg-blue-600/20 hover:text-blue-400 cursor-pointer transition-all duration-300 flex items-center">
                                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100"></div>
                                {cat.name}
                            </a>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
};

const Footer = () => (
    <footer className="relative bg-gray-900 border-t border-gray-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-blue-400">EV Akcesoria</h3>
                    <p className="text-gray-400">Napędzamy rewolucję. Najlepsze akcesoria dla Twojego EV, dostępne od ręki.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-4">Informacje</h3>
                    <ul className="space-y-2">
                        <li><a href="#" className="text-gray-400 hover:text-white">O nas</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Kontakt</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Polityka prywatności</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Regulamin</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-4">Obsługa klienta</h3>
                    <ul className="space-y-2">
                         <li><a href="#" className="text-gray-400 hover:text-white">Dostawa i płatności</a></li>
                         <li><a href="#" className="text-gray-400 hover:text-white">Zwroty i reklamacje</a></li>
                         <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-4">Kontakt</h3>
                    <p className="text-gray-400">ul. Elektryczna 1, Warszawa</p>
                    <p className="text-gray-400">kontakt@ev-akcesoria.pl</p>
                    <p className="text-gray-400">+48 123 456 789</p>
                </div>
            </div>
            <div className="mt-8 border-t border-gray-700 pt-8 text-center text-gray-500">
                <p>&copy; {new Date().getFullYear()} EV Akcesoria. Wszelkie prawa zastrzeżone. Stworzone z pasji do elektromobilności.</p>
            </div>
        </div>
    </footer>
);

const ProductCard = ({ product, navigate }) => {
    const { addToCart } = useContext(AppContext);
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden group card-hover glass-effect">
            <div className="relative">
                <img 
                    src={product.imageUrls && product.imageUrls[0] ? product.imageUrls[0] : 'https://placehold.co/600x600/111827/ffffff?text=Brak+zdjęcia'} 
                    alt={product.name} 
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105" 
                />
                
                {/* Category Badge */}
                <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 m-2 rounded-full text-sm font-semibold shadow-lg">
                    {product.category}
                </div>
                
                {/* Bestseller Badge */}
                {product.bestseller && (
                    <div className="absolute top-0 left-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 m-2 rounded-full text-sm font-semibold shadow-lg flex items-center">
                        <Star className="h-3 w-3 mr-1" fill="currentColor" />
                        Bestseller
                    </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                
                {/* Action Buttons */}
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 flex justify-center space-x-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); addToCart(product); }} 
                        className="bg-blue-600 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-500 flex-1 btn-glow flex items-center justify-center"
                    >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Do koszyka
                    </button>
                    <button 
                        onClick={() => navigate('product', product.id)} 
                        className="bg-white/20 backdrop-blur-sm text-white font-bold p-2 rounded-full hover:bg-white/30 transition-all"
                    >
                        <Eye className="h-5 w-5" />
                    </button>
                </div>
            </div>
            
            <div className="p-4 cursor-pointer" onClick={() => navigate('product', product.id)}>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">{product.name}</h3>
                
                {/* Brand */}
                {product.brand && (
                    <p className="text-sm text-gray-400 mb-2">{product.brand}</p>
                )}
                
                <div className="flex items-center justify-between mt-3">
                    <div>
                        <p className="text-2xl font-bold text-blue-400">{product.price.toFixed(2)} zł</p>
                        {product.originalPrice && product.originalPrice > product.price && (
                            <p className="text-sm text-gray-500 line-through">{product.originalPrice.toFixed(2)} zł</p>
                        )}
                    </div>
                    
                    <div className="flex items-center">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star 
                                    key={i} 
                                    className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-600'}`} 
                                    fill="currentColor" 
                                />
                            ))}
                        </div>
                        <span className="text-gray-400 ml-2 text-sm">({product.rating || 'Brak'})</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HomePage = ({ navigate, products, categories }) => {
    const bestsellers = products.filter(p => p.bestseller).slice(0, 4);

    return (
        <div className="space-y-24 md:space-y-32 pb-24">
            {/* Hero Section with Spectacular EV Background */}
            <section className="relative h-[85vh] text-white flex items-center justify-center overflow-hidden">
                {/* Dynamic Background Images */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-gray-900/60 to-purple-900/40 z-10"></div>
                    <img 
                        src="https://images.unsplash.com/photo-1617195737496-bc30194e3a19?q=80&w=1920&auto=format&fit=crop"
                        alt="Tesla Model S charging"
                        className="absolute inset-0 w-full h-full object-cover animate-fade-in-up"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent z-5"></div>
                </div>
                
                {/* Floating EV Icons */}
                <div className="absolute inset-0 z-5">
                    <div className="absolute top-1/4 left-1/4 animate-pulse">
                        <Zap className="w-6 h-6 text-blue-400 animate-bounce" />
                    </div>
                    <div className="absolute top-1/3 right-1/3 animate-pulse delay-1000">
                        <Zap className="w-4 h-4 text-purple-400 animate-bounce" />
                    </div>
                    <div className="absolute bottom-1/4 left-1/3 animate-pulse delay-2000">
                        <Zap className="w-8 h-8 text-cyan-400 animate-bounce" />
                    </div>
                    <div className="absolute top-1/2 right-1/4 animate-pulse delay-3000">
                        <Zap className="w-5 h-5 text-blue-300 animate-bounce" />
                    </div>
                </div>
                
                {/* Content */}
                <div className="relative z-20 text-center p-4 animate-fade-in-up">
                    <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-4 text-gradient animate-zoom-in">
                        Przyszłość jest Elektryczna.
                    </h1>
                    <p className="text-lg md:text-2xl max-w-3xl mx-auto mb-8 text-gray-300 animate-fade-in-up delay-300">
                        Wyposaż swój samochód w najlepsze akcesoria na rynku. Odkryj świat elektromobilności.
                    </p>
                    <div className="animate-fade-in-up delay-500">
                        <button 
                            onClick={() => navigate('category', 'Wszystkie')} 
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-10 rounded-full text-xl btn-glow flex items-center justify-center mx-auto mb-6"
                        >
                            Odkryj produkty <ArrowRight className="ml-3 h-6 w-6" />
                        </button>
                        <div className="flex justify-center space-x-8 text-sm text-gray-400">
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                                Darmowa dostawa
                            </div>
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
                                24/7 Support
                            </div>
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></div>
                                Gwarancja 2 lata
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div className="glass-effect p-6 rounded-lg card-hover">
                        <div className="text-3xl font-bold text-blue-400 mb-2">500+</div>
                        <div className="text-gray-300">Zadowolonych klientów</div>
                    </div>
                    <div className="glass-effect p-6 rounded-lg card-hover">
                        <div className="text-3xl font-bold text-green-400 mb-2">50+</div>
                        <div className="text-gray-300">Produktów w ofercie</div>
                    </div>
                    <div className="glass-effect p-6 rounded-lg card-hover">
                        <div className="text-3xl font-bold text-purple-400 mb-2">24h</div>
                        <div className="text-gray-300">Szybka dostawa</div>
                    </div>
                    <div className="glass-effect p-6 rounded-lg card-hover">
                        <div className="text-3xl font-bold text-cyan-400 mb-2">99%</div>
                        <div className="text-gray-300">Pozytywnych opinii</div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white animate-fade-in-up">
                    Przeglądaj Kategorie
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8">
                    {(categories || []).map((category, index) => (
                        <div 
                            key={category.name} 
                            onClick={() => navigate('category', category.name)} 
                            className="group cursor-pointer text-center transform transition-all duration-300 hover:!scale-105 hover:z-10 animate-fade-in-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="relative rounded-lg overflow-hidden shadow-lg mb-4 aspect-square card-hover">
                                <img 
                                    src={category.image} 
                                    alt={category.name} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Bestsellers Section */}
            <section className="bg-gray-900/50 py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-radial"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white animate-fade-in-up">
                        Nasze Bestsellery
                    </h2>
                     {bestsellers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {(bestsellers || []).map((product, index) => (
                                <div 
                                    key={product.id} 
                                    className="animate-fade-in-up"
                                    style={{ animationDelay: `${index * 150}ms` }}
                                >
                                    <ProductCard product={product} navigate={navigate} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center animate-fade-in-up">
                            <div className="glass-effect p-8 rounded-lg inline-block">
                                <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-400 text-lg">Brak bestsellerów do wyświetlenia.</p>
                                <p className="text-gray-500 text-sm mt-2">Dodaj produkty w panelu admina.</p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white animate-fade-in-up">
                    Dlaczego warto wybrać nas?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center glass-effect p-8 rounded-lg card-hover animate-fade-in-up">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Zap className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-4">Szybka dostawa</h3>
                        <p className="text-gray-400">Dostarczamy Twoje zamówienia w ciągu 24 godzin na terenie całej Polski.</p>
                    </div>
                    <div className="text-center glass-effect p-8 rounded-lg card-hover animate-fade-in-up delay-200">
                        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-4">Gwarancja jakości</h3>
                        <p className="text-gray-400">Wszystkie produkty objęte są 2-letnią gwarancją producenta.</p>
                    </div>
                    <div className="text-center glass-effect p-8 rounded-lg card-hover animate-fade-in-up delay-400">
                        <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Star className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-4">Najwyższa jakość</h3>
                        <p className="text-gray-400">Współpracujemy tylko z najlepszymi producentami na rynku.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

const CategoryPage = ({ navigate, products, categoryName }) => {
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [sort, setSort] = useState('popular');
    const [filters, setFilters] = useState({ brand: 'all', price: 'all' });

    useEffect(() => {
        let tempProducts = categoryName === 'Wszystkie' ? [...products] : products.filter(p => p.category === categoryName);

        if (filters.brand !== 'all') tempProducts = tempProducts.filter(p => p.brand === filters.brand);
        if (filters.price !== 'all') {
            const [min, max] = filters.price.split('-').map(Number);
            tempProducts = tempProducts.filter(p => p.price >= min && (max ? p.price <= max : true));
        }

        switch (sort) {
            case 'price-asc': tempProducts.sort((a, b) => a.price - b.price); break;
            case 'price-desc': tempProducts.sort((a, b) => b.price - a.price); break;
            case 'name-asc': tempProducts.sort((a, b) => a.name.localeCompare(b.name)); break;
            default: tempProducts.sort((a, b) => (b.reviews || 0) - (a.reviews || 0)); break;
        }

        setFilteredProducts(tempProducts);
    }, [categoryName, products, sort, filters]);

    const uniqueBrands = ['all', ...new Set(products.map(p => p.brand))];
    const priceRanges = [
        { label: 'Wszystkie', value: 'all' }, { label: 'Poniżej 100 zł', value: '0-100' },
        { label: '100 - 500 zł', value: '100-500' }, { label: '500 - 2000 zł', value: '500-2000' },
        { label: 'Powyżej 2000 zł', value: '2000' },
    ];

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-4xl font-bold mb-8 text-white">{categoryName}</h1>
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="w-full md:w-1/4">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-md space-y-6 border border-gray-700">
                        <h3 className="text-xl font-semibold flex items-center text-white"><Filter className="mr-2" /> Filtry</h3>
                        <div>
                            <label htmlFor="sort" className="block text-sm font-medium text-gray-400">Sortuj według</label>
                            <select id="sort" value={sort} onChange={e => setSort(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                <option value="popular">Popularność</option> <option value="price-asc">Cena: rosnąco</option>
                                <option value="price-desc">Cena: malejąco</option> <option value="name-asc">Nazwa: A-Z</option>
                            </select>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2 text-white">Marka</h4>
                            <div className="space-y-2">
                                {uniqueBrands.map(brand => (
                                    <div key={brand} className="flex items-center">
                                        <input id={`brand-${brand}`} name="brand" type="radio" value={brand} checked={filters.brand === brand} onChange={e => setFilters({...filters, brand: e.target.value})} className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500" />
                                        <label htmlFor={`brand-${brand}`} className="ml-3 text-sm text-gray-300">{brand === 'all' ? 'Wszystkie' : brand}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2 text-white">Cena</h4>
                            <div className="space-y-2">
                                {priceRanges.map(range => (
                                    <div key={range.value} className="flex items-center">
                                        <input id={`price-${range.value}`} name="price" type="radio" value={range.value} checked={filters.price === range.value} onChange={e => setFilters({...filters, price: e.target.value})} className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500" />
                                        <label htmlFor={`price-${range.value}`} className="ml-3 text-sm text-gray-300">{range.label}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>
                <main className="w-full md:w-3/4">
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredProducts.map(product => <ProductCard key={product.id} product={product} navigate={navigate} />)}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-gray-800 rounded-lg">
                            <h2 className="text-2xl font-semibold text-white">Brak produktów</h2>
                            <p className="text-gray-400 mt-2">Nie znaleziono produktów w tej kategorii.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

const ReviewsSection = ({ productId, reviews }) => {
    const { user, addNotification, navigate } = useContext(AppContext);
    const [newReviewText, setNewReviewText] = useState('');
    const [newRating, setNewRating] = useState(5);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            addNotification('Musisz być zalogowany, aby dodać opinię.', 'error');
            navigate('login');
            return;
        }
        if (newReviewText.trim() === '') {
            addNotification('Opinia nie może być pusta.', 'error');
            return;
        }
        const review = {
            author: user.email,
            text: newReviewText,
            rating: newRating,
            createdAt: new Date(),
        };
        try {
            await api.addReview(productId, review);
            setNewReviewText('');
            setNewRating(5);
            addNotification('Dziękujemy za Twoją opinię!');
        } catch (error) {
            addNotification('Wystąpił błąd podczas dodawania opinii.', 'error');
        }
    };

    return (
        <div className="mt-16">
            <h2 className="text-3xl font-bold text-white mb-8">Opinie klientów</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    {reviews.length > 0 ? reviews.map(review => (
                        <div key={review.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                            <div className="flex justify-between items-center mb-2">
                                <p className="font-semibold text-white">{review.author}</p>
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < review.rating ? 'text-yellow-400' : 'text-gray-600'} fill="currentColor" />)}
                                </div>
                            </div>
                            <p className="text-gray-300">{review.text}</p>
                        </div>
                    )) : <p className="text-gray-400">Brak opinii dla tego produktu. Bądź pierwszy!</p>}
                </div>
                <div className="sticky top-24">
                    <form onSubmit={handleReviewSubmit} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-4">Dodaj swoją opinię</h3>
                        <div className="mb-4">
                            <label className="block text-gray-400 mb-2">Ocena</label>
                            <div className="flex">
                                {[...Array(5)].map((_, i) => <Star key={i} size={24} className={`cursor-pointer ${i < newRating ? 'text-yellow-400' : 'text-gray-600'}`} fill="currentColor" onClick={() => setNewRating(i + 1)} />)}
                            </div>
                        </div>
                        <textarea value={newReviewText} onChange={e => setNewReviewText(e.target.value)} placeholder="Twoja opinia..." className="w-full p-2 border rounded bg-gray-700 border-gray-600 text-white h-32"></textarea>
                        <button type="submit" className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-md">Wyślij opinię</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const ProductPage = ({ navigate, productId }) => {
    const { addToCart, products } = useContext(AppContext);
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mainImage, setMainImage] = useState('');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const productData = await api.fetchProduct(productId);
            setProduct(productData);
            if (productData && productData.imageUrls && productData.imageUrls.length > 0) {
                setMainImage(productData.imageUrls[0]);
            }
            setIsLoading(false);
        };
        fetchData();
        const unsubscribe = api.getReviews(productId, setReviews);
        return () => unsubscribe();
    }, [productId]);

    if (isLoading) return <LoadingScreen />;
    
    if (!product) {
        return (
            <div className="bg-gray-900 min-h-screen flex items-center justify-center">
                <div className="text-center p-8">
                    <AlertCircle className="h-16 w-16 mx-auto text-red-400 mb-4" />
                    <h1 className="text-3xl font-bold text-white mb-2">Produkt nie znaleziony</h1>
                    <p className="text-gray-400 mb-6">Produkt o podanym ID nie istnieje lub został usunięty.</p>
                    <button 
                        onClick={() => navigate('home')} 
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg flex items-center mx-auto"
                    >
                        <ArrowRight className="h-5 w-5 mr-2 rotate-180" />
                        Powrót do strony głównej
                    </button>
                </div>
            </div>
        );
    }
    
    const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

    return (
        <div className="bg-gray-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div>
                        <div className="aspect-w-1 aspect-h-1 w-full bg-gray-800 rounded-lg overflow-hidden shadow-lg mb-4">
                            <img src={mainImage || (product.imageUrls && product.imageUrls[0])} alt={product.name} className="w-full h-full object-cover transition-all duration-300 hover:scale-105" />
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {product.imageUrls.map((url, index) => (
                                <div key={index} onClick={() => setMainImage(url)} className={`cursor-pointer rounded-md overflow-hidden border-2 transition-all ${mainImage === url ? 'border-blue-500' : 'border-gray-700 hover:border-blue-600'}`}>
                                    <img src={url} alt={`${product.name} - widok ${index + 1}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col justify-center">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">{product.name}</h1>
                        <div className="flex items-center mt-2">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => <Star key={i} className={`h-5 w-5 ${i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-600'}`} fill="currentColor" />)}
                            </div>
                            <span className="ml-2 text-gray-400">({reviews.length} opinii)</span>
                        </div>
                        <p className="text-4xl font-bold text-blue-400 my-4">{product.price.toFixed(2)} zł</p>
                        <div className="flex items-center space-x-4 my-6">
                            <div className="flex items-center border border-gray-600 rounded-md bg-gray-800">
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 text-gray-400 hover:bg-gray-700"><Minus className="h-5 w-5" /></button>
                                <span className="px-4 text-lg font-semibold text-white">{quantity}</span>
                                <button onClick={() => setQuantity(q => q + 1)} className="p-3 text-gray-400 hover:bg-gray-700"><Plus className="h-5 w-5" /></button>
                            </div>
                            <button onClick={() => addToCart(product, quantity)} className="flex-1 bg-blue-600 text-white font-bold py-3 px-6 rounded-md hover:bg-blue-500 transition-colors flex items-center justify-center space-x-2">
                                <ShoppingCart className="h-5 w-5" /><span>Dodaj do koszyka</span>
                            </button>
                        </div>
                        <button onClick={() => { addToCart(product, quantity); navigate('checkout'); }} className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-md hover:bg-green-500 transition-colors">Kup teraz</button>
                    </div>
                </div>
                <ReviewsSection productId={productId} reviews={reviews} />
                 <div className="mt-24">
                    <h2 className="text-3xl font-bold text-white mb-8">Zobacz również</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {relatedProducts.map(p => <ProductCard key={p.id} product={p} navigate={navigate} />)}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CartPage = ({ navigate }) => {
    const { cart, updateCartQuantity, removeFromCart, cartTotal, cartItemCount } = useContext(AppContext);

    if (cartItemCount === 0) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <ShoppingCart className="h-24 w-24 mx-auto text-gray-600" />
                <h1 className="text-3xl font-bold mt-4 text-white">Twój koszyk jest pusty</h1>
                <p className="text-gray-400 mt-2">Odkryj nasze produkty i dodaj coś do koszyka.</p>
                <button onClick={() => navigate('category', 'Wszystkie')} className="mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-md transition-colors">Wróć do sklepu</button>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold mb-8 text-white">Twój Koszyk</h1>
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-2/3 bg-gray-800 rounded-lg shadow-md p-6 space-y-4 border border-gray-700">
                        {(cart || []).map(item => (
                            <div key={item.id} className="flex items-center space-x-4 border-b border-gray-700 pb-4 last:border-b-0">
                                <img src={item.imageUrls[0]} alt={item.name} className="w-24 h-24 object-cover rounded-md" />
                                <div className="flex-grow">
                                    <h3 className="font-semibold text-lg text-white">{item.name}</h3>
                                    <p className="text-gray-400 text-sm">{item.category}</p>
                                    <p className="font-bold text-blue-400 mt-1">{(item.price * item.quantity).toFixed(2)} zł</p>
                                </div>
                                <div className="flex items-center border border-gray-600 rounded-md bg-gray-700">
                                    <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="p-2 text-gray-400 hover:bg-gray-600"><Minus className="h-4 w-4" /></button>
                                    <span className="px-3 text-md font-semibold text-white">{item.quantity}</span>
                                    <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="p-2 text-gray-400 hover:bg-gray-600"><Plus className="h-4 w-4" /></button>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="text-gray-500 hover:text-red-500"><Trash2 className="h-5 w-5" /></button>
                            </div>
                        ))}
                    </div>
                    <div className="lg:w-1/3">
                        <div className="bg-gray-800 rounded-lg shadow-md p-6 sticky top-24 border border-gray-700">
                            <h2 className="text-2xl font-bold border-b border-gray-700 pb-4 text-white">Podsumowanie</h2>
                            <div className="space-y-2 mt-4 text-gray-300">
                                <div className="flex justify-between"><span>Wartość produktów</span><span>{cartTotal.toFixed(2)} zł</span></div>
                                <div className="flex justify-between"><span>Dostawa</span><span>Darmowa</span></div>
                            </div>
                            <div className="flex justify-between font-bold text-xl mt-4 pt-4 border-t border-gray-700 text-white"><span>Do zapłaty</span><span>{cartTotal.toFixed(2)} zł</span></div>
                            <button onClick={() => navigate('checkout')} className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-md transition-colors">Przejdź do kasy</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CheckoutPage = ({ navigate }) => {
    const { cart, cartTotal, clearCart, user, addNotification } = useContext(AppContext);
    const [isProcessing, setIsProcessing] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: user?.email || '',
        address: '',
        zipCode: '',
        city: '',
        paymentMethod: 'stripe'
    });

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        
        const orderData = {
            userId: user.uid,
            customer: formData,
            items: cart,
            total: cartTotal,
            status: 'Nowe',
            createdAt: new Date(),
        };

        try {
            const docRef = await addDoc(collection(db, "orders"), orderData);
            setTimeout(() => {
                const orderDetails = {
                    orderNumber: docRef.id,
                    total: cartTotal,
                    date: new Date().toLocaleDateString('pl-PL'),
                };
                clearCart();
                setIsProcessing(false);
                navigate('orderConfirmation', orderDetails);
            }, 2000);
        } catch (error) {
            addNotification('Wystąpił błąd podczas składania zamówienia.', 'error');
            setIsProcessing(false);
        }
    };

    if (isProcessing) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-700 h-32 w-32 mb-4 border-t-blue-500 animate-spin"></div>
                <h2 className="text-2xl font-semibold text-center text-white">Przetwarzanie zamówienia...</h2>
                <p className="text-gray-400">Proszę czekać, finalizujemy Twoje zakupy.</p>
            </div>
        );
    }
    
    const ProgressBar = ({ currentStep }) => (
        <div className="flex items-center mb-12">
            <div className={`flex-1 flex items-center ${currentStep >= 1 ? 'text-blue-400' : 'text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${currentStep >= 1 ? 'border-blue-400' : 'border-gray-500'}`}>{currentStep > 1 ? <CheckCircle size={16}/> : '1'}</div>
                <span className="ml-2 font-semibold">Dostawa</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${currentStep >= 2 ? 'bg-blue-400' : 'bg-gray-700'}`}></div>
            <div className={`flex-1 flex items-center ${currentStep >= 2 ? 'text-blue-400' : 'text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${currentStep >= 2 ? 'border-blue-400' : 'border-gray-500'}`}>{currentStep > 2 ? <CheckCircle size={16}/> : '2'}</div>
                <span className="ml-2 font-semibold">Płatność</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${currentStep >= 3 ? 'bg-blue-400' : 'bg-gray-700'}`}></div>
            <div className={`flex-1 flex items-center ${currentStep >= 3 ? 'text-blue-400' : 'text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${currentStep >= 3 ? 'border-blue-400' : 'border-gray-500'}`}>3</div>
                <span className="ml-2 font-semibold">Podsumowanie</span>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg border border-gray-700">
                    <h1 className="text-3xl font-bold text-center mb-4 text-white">Finalizacja zamówienia</h1>
                    <ProgressBar currentStep={step} />
                    <form onSubmit={handleSubmit}>
                        {step === 1 && (
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4">1. Adres dostawy</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input name="name" onChange={handleChange} value={formData.name} type="text" placeholder="Imię" required className="p-3 border rounded-md bg-gray-700 border-gray-600 text-white" />
                                    <input name="surname" onChange={handleChange} value={formData.surname} type="text" placeholder="Nazwisko" required className="p-3 border rounded-md bg-gray-700 border-gray-600 text-white" />
                                    <input name="email" onChange={handleChange} value={formData.email} type="email" placeholder="Email" required className="p-3 border rounded-md sm:col-span-2 bg-gray-700 border-gray-600 text-white" />
                                    <input name="address" onChange={handleChange} value={formData.address} type="text" placeholder="Adres" required className="p-3 border rounded-md sm:col-span-2 bg-gray-700 border-gray-600 text-white" />
                                    <input name="zipCode" onChange={handleChange} value={formData.zipCode} type="text" placeholder="Kod pocztowy" required className="p-3 border rounded-md bg-gray-700 border-gray-600 text-white" />
                                    <input name="city" onChange={handleChange} value={formData.city} type="text" placeholder="Miasto" required className="p-3 border rounded-md bg-gray-700 border-gray-600 text-white" />
                                </div>
                                <button onClick={() => setStep(2)} className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-md transition-colors">Dalej</button>
                            </div>
                        )}
                        {step === 2 && (
                             <div>
                                <h2 className="text-2xl font-bold text-white mb-4">2. Metoda płatności</h2>
                                <div className="space-y-4">
                                     <label className="flex items-center p-4 border rounded-md cursor-pointer transition-all border-gray-600 bg-gray-700 hover:bg-gray-600"><input type="radio" name="paymentMethod" value="stripe" checked={formData.paymentMethod === 'stripe'} onChange={handleChange} className="h-5 w-5 text-blue-600"/><span className="ml-4 font-semibold text-white">Karta płatnicza</span></label>
                                     <label className="flex items-center p-4 border rounded-md cursor-pointer transition-all border-gray-600 bg-gray-700 hover:bg-gray-600"><input type="radio" name="paymentMethod" value="blik" checked={formData.paymentMethod === 'blik'} onChange={handleChange} className="h-5 w-5 text-blue-600"/><span className="ml-4 font-semibold text-white">BLIK</span></label>
                                     <label className="flex items-center p-4 border rounded-md cursor-pointer transition-all border-gray-600 bg-gray-700 hover:bg-gray-600"><input type="radio" name="paymentMethod" value="payu" checked={formData.paymentMethod === 'payu'} onChange={handleChange} className="h-5 w-5 text-blue-600"/><span className="ml-4 font-semibold text-white">Szybki przelew</span></label>
                                </div>
                                <div className="flex justify-between mt-6">
                                    <button onClick={() => setStep(1)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-md transition-colors">Wstecz</button>
                                    <button onClick={() => setStep(3)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-md transition-colors">Dalej</button>
                                </div>
                            </div>
                        )}
                        {step === 3 && (
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4">3. Podsumowanie</h2>
                                <div className="bg-gray-700 p-6 rounded-lg space-y-2 text-gray-300">
                                    <div className="flex justify-between"><span>Wartość produktów:</span><span>{cartTotal.toFixed(2)} zł</span></div>
                                    <div className="flex justify-between"><span>Dostawa:</span><span>Darmowa</span></div>
                                    <div className="flex justify-between font-bold text-xl mt-2 pt-2 border-t border-gray-600 text-white"><span>Do zapłaty:</span><span>{cartTotal.toFixed(2)} zł</span></div>
                                </div>
                                <div className="flex justify-between mt-8">
                                    <button onClick={() => setStep(2)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-md transition-colors">Wstecz</button>
                                    <button type="submit" className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-md transition-colors flex items-center space-x-2"><ShieldCheck /><span>Zamawiam i płacę</span></button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

const OrderConfirmationPage = ({ navigate, orderDetails }) => (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <ShieldCheck className="h-24 w-24 mx-auto text-green-500 animate-pulse" />
        <h1 className="text-3xl font-bold mt-4 text-white">Dziękujemy za zamówienie!</h1>
        <p className="text-gray-400 mt-2">Twoje zamówienie zostało przyjęte do realizacji. Potwierdzenie wysłaliśmy na Twój adres e-mail.</p>
        <div className="bg-gray-800 inline-block p-6 rounded-lg mt-6 text-left border border-gray-700">
            <p className="text-gray-300"><span className="font-semibold text-white">Numer zamówienia:</span> {orderDetails.orderNumber}</p>
            <p className="text-gray-300"><span className="font-semibold text-white">Data:</span> {orderDetails.date}</p>
            <p className="text-gray-300"><span className="font-semibold text-white">Kwota:</span> {orderDetails.total.toFixed(2)} zł</p>
        </div>
        <div className="mt-8">
            <button onClick={() => navigate('home')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-md transition-colors">Kontynuuj zakupy</button>
        </div>
    </div>
);

const AccessDenied = ({ navigate }) => (
     <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-bold mt-4 text-white">Brak dostępu</h1>
        <p className="text-gray-400 mt-2">Nie masz uprawnień, aby wyświetlić tę stronę.</p>
        <button onClick={() => navigate('home')} className="mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-md transition-colors">Wróć na stronę główną</button>
    </div>
);

// --- KOMPONENTY LOGOWANIA I REJESTRACJI ---
const LoginPage = ({ navigate, addNotification }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            addNotification('Zalogowano pomyślnie!');
            navigate('home');
        } catch (err) {
            setError('Nieprawidłowy email lub hasło.');
            addNotification('Błąd logowania.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[70vh]">
            <div className="p-8 bg-gray-800 border border-gray-700 shadow-xl rounded-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-white">Logowanie</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full p-3 border rounded-md bg-gray-700 border-gray-600 text-white" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Hasło" required className="w-full p-3 border rounded-md bg-gray-700 border-gray-600 text-white" />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-md disabled:bg-gray-500">
                        {isLoading ? 'Logowanie...' : 'Zaloguj się'}
                    </button>
                </form>
                <p className="text-center text-gray-400 mt-4">Nie masz konta? <a onClick={() => navigate('register')} className="text-blue-400 hover:underline cursor-pointer">Zarejestruj się</a></p>
            </div>
        </div>
    );
};

const RegisterPage = ({ navigate, addNotification }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            addNotification('Rejestracja pomyślna! Możesz się teraz zalogować.');
            navigate('login');
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('Ten adres email jest już zajęty.');
            } else if (err.code === 'auth/weak-password') {
                setError('Hasło musi mieć co najmniej 6 znaków.');
            } else {
                setError('Błąd rejestracji. Spróbuj ponownie.');
            }
            addNotification('Błąd rejestracji.', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="flex items-center justify-center min-h-[70vh]">
            <div className="p-8 bg-gray-800 border border-gray-700 shadow-xl rounded-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-white">Rejestracja</h2>
                <form onSubmit={handleRegister} className="space-y-4">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full p-3 border rounded-md bg-gray-700 border-gray-600 text-white" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Hasło (min. 6 znaków)" required className="w-full p-3 border rounded-md bg-gray-700 border-gray-600 text-white" />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-md disabled:bg-gray-500">
                        {isLoading ? 'Rejestrowanie...' : 'Zarejestruj się'}
                    </button>
                </form>
                <p className="text-center text-gray-400 mt-4">Masz już konto? <a onClick={() => navigate('login')} className="text-blue-400 hover:underline cursor-pointer">Zaloguj się</a></p>
            </div>
        </div>
    );
};


// --- PANEL ADMINISTRACYJNY ---
const AdminPanel = ({ navigate }) => {
    const [adminPage, setAdminPage] = useState('dashboard');
    
    return (
        <div className="bg-gray-900 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold mb-8 text-white">Panel Administratora</h1>
                <div className="flex flex-col md:flex-row gap-8">
                    <aside className="md:w-1/4">
                        <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700">
                            <nav className="space-y-2">
                                <a onClick={() => setAdminPage('dashboard')} className={`flex items-center p-3 rounded-md cursor-pointer ${adminPage === 'dashboard' ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-gray-700'}`}><BarChart className="mr-3"/>Dashboard</a>
                                <a onClick={() => setAdminPage('products')} className={`flex items-center p-3 rounded-md cursor-pointer ${adminPage === 'products' ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-gray-700'}`}><ShoppingCart className="mr-3"/>Produkty</a>
                                <a onClick={() => setAdminPage('orders')} className={`flex items-center p-3 rounded-md cursor-pointer ${adminPage === 'orders' ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-gray-700'}`}><Truck className="mr-3"/>Zamówienia</a>
                            </nav>
                        </div>
                    </aside>
                    <main className="md:w-3/4">
                        <div className="bg-gray-800 p-8 rounded-lg shadow-md border border-gray-700">
                            {adminPage === 'dashboard' && <AdminDashboard />}
                            {adminPage === 'products' && <AdminProducts />}
                            {adminPage === 'orders' && <AdminOrders />}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const [stats, setStats] = useState({ orders: 0, revenue: 0, products: 0 });
    const { products } = useContext(AppContext);

    useEffect(() => {
        const fetchOrders = async () => {
            const ordersData = await api.fetchOrders();
            const totalRevenue = ordersData.reduce((sum, order) => sum + order.total, 0);
            setStats({
                orders: ordersData.length,
                revenue: totalRevenue,
                products: products.length
            });
        };
        fetchOrders();
    }, [products]);

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-700 p-6 rounded-lg"><h3 className="text-gray-400 text-sm">Całkowita liczba zamówień</h3><p className="text-3xl font-bold text-white">{stats.orders}</p></div>
                <div className="bg-gray-700 p-6 rounded-lg"><h3 className="text-gray-400 text-sm">Całkowity przychód</h3><p className="text-3xl font-bold text-white">{stats.revenue.toFixed(2)} zł</p></div>
                <div className="bg-gray-700 p-6 rounded-lg"><h3 className="text-gray-400 text-sm">Liczba produktów</h3><p className="text-3xl font-bold text-white">{stats.products}</p></div>
            </div>
        </div>
    );
};

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Wszystkie');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(10);
    const { addNotification } = useContext(AppContext);

    useEffect(() => {
        const fetch = async () => {
            setIsLoading(true);
            setProducts(await api.fetchProducts());
            setIsLoading(false);
        };
        fetch();
    }, []);

    // Filtrowanie i sortowanie produktów
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             product.brand.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Wszystkie' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        let aValue, bValue;
        switch (sortBy) {
            case 'name':
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
                break;
            case 'price':
                aValue = a.price;
                bValue = b.price;
                break;
            case 'category':
                aValue = a.category.toLowerCase();
                bValue = b.category.toLowerCase();
                break;
            case 'brand':
                aValue = a.brand.toLowerCase();
                bValue = b.brand.toLowerCase();
                break;
            default:
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
        }
        
        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    // Paginacja
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

    const categories = ['Wszystkie', 'Ładowarki', 'Adaptery', 'Akcesoria', 'Baterie'];

    const handleSave = async (productData) => {
        setIsLoading(true);
        try {
            if (editingProduct) {
                await api.updateProduct(editingProduct.id, productData);
                setProducts(products.map(p => p.id === editingProduct.id ? { ...productData, id: editingProduct.id } : p));
                addNotification('Produkt zaktualizowany.');
            } else {
                const newDocRef = await api.addProduct(productData);
                setProducts([...products, { ...productData, id: newDocRef.id }]);
                addNotification('Produkt dodany.');
            }
            setIsModalOpen(false);
        } catch (e) {
            addNotification('Błąd zapisu produktu.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Czy na pewno chcesz usunąć ten produkt?')) {
            setIsLoading(true);
            try {
                await api.deleteProduct(id);
                setProducts(products.filter(p => p.id !== id));
                addNotification('Produkt usunięty.');
            } catch (e) {
                addNotification('Błąd podczas usuwania produktu.', 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };
    
    if (isLoading) return <div className="flex justify-center items-center h-64"><div className="spinner"></div></div>;
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Produkty ({sortedProducts.length})</h2>
                <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-500 flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Dodaj produkt
                </button>
            </div>

            {/* Filtry i wyszukiwanie */}
            <div className="bg-gray-800 p-4 rounded-lg mb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-gray-400 mb-2">Wyszukaj</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Szukaj produktów..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2">Kategoria</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        >
                            {(categories || ['Wszystkie', 'Ładowarki', 'Adaptery', 'Akcesoria', 'Baterie']).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2">Sortuj według</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        >
                            <option value="name">Nazwy</option>
                            <option value="price">Ceny</option>
                            <option value="category">Kategorii</option>
                            <option value="brand">Marki</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2">Kierunek</label>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        >
                            <option value="asc">Rosnąco</option>
                            <option value="desc">Malejąco</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Lista produktów */}
            <div className="overflow-x-auto bg-gray-800 rounded-lg">
                <table className="w-full text-left text-gray-300">
                    <thead className="bg-gray-700 text-sm text-gray-400 uppercase">
                        <tr>
                            <th className="p-3">Zdjęcie</th>
                            <th className="p-3">Nazwa</th>
                            <th className="p-3">Kategoria</th>
                            <th className="p-3">Marka</th>
                            <th className="p-3">Cena</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentProducts.map(p => (
                            <tr key={p.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                <td className="p-3">
                                    <img 
                                        src={p.imageUrls?.[0] || 'https://via.placeholder.com/60x60?text=No+Image'} 
                                        alt={p.name}
                                        className="w-12 h-12 object-cover rounded"
                                    />
                                </td>
                                <td className="p-3 font-medium text-white">{p.name}</td>
                                <td className="p-3">{p.category}</td>
                                <td className="p-3">{p.brand}</td>
                                <td className="p-3 font-bold text-green-400">{p.price?.toFixed(2)} zł</td>
                                <td className="p-3">
                                    {p.bestseller && (
                                        <span className="bg-yellow-600 text-white px-2 py-1 rounded-full text-xs">
                                            Bestseller
                                        </span>
                                    )}
                                </td>
                                <td className="p-3 space-x-2">
                                    <button 
                                        onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} 
                                        className="text-blue-400 hover:underline p-1"
                                        title="Edytuj"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(p.id)} 
                                        className="text-red-400 hover:underline p-1"
                                        title="Usuń"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Paginacja */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
                    >
                        Poprzednia
                    </button>
                    <span className="text-white">
                        Strona {currentPage} z {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
                    >
                        Następna
                    </button>
                </div>
            )}

            {isModalOpen && <ProductEditModal product={editingProduct} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

const ProductEditModal = ({ product, onSave, onClose }) => {
    const [formData, setFormData] = useState(() => {
        if (product) {
            return {
                name: product.name || '',
                price: product.price || 0,
                category: product.category || 'Ładowarki',
                brand: product.brand || '',
                description: product.description || '',
                imageUrls: product.imageUrls || [],
                bestseller: product.bestseller || false,
                rating: product.rating || 0,
                tags: product.tags || [],
                shortDescription: product.shortDescription || '',
                features: product.features || [],
                specifications: product.specifications || '',
                warranty: product.warranty || '',
                inStock: product.inStock !== undefined ? product.inStock : true,
                stockQuantity: product.stockQuantity || 0
            };
        }
        return { 
            name: '', 
            price: 0, 
            category: 'Ładowarki', 
            brand: '', 
            description: '', 
            imageUrls: [], 
            bestseller: false, 
            rating: 0,
            tags: [],
            shortDescription: '',
            features: [],
            specifications: '',
            warranty: '',
            inStock: true,
            stockQuantity: 0
        };
    });
    const [isUploading, setIsUploading] = useState(false);
    const [newTag, setNewTag] = useState('');
    const [newFeature, setNewFeature] = useState('');
    const { addNotification, categories } = useContext(AppContext);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    
    const handlePriceChange = (e) => {
        setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }));
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) {
            addNotification('Nie wybrano pliku', 'error');
            return;
        }
        
        console.log('=== UPLOAD START ===');
        console.log('File name:', file.name);
        console.log('File size:', file.size, 'bytes');
        console.log('File type:', file.type);
        console.log('FormData imageUrls before:', formData.imageUrls?.length || 0);
        
        setIsUploading(true);
        
        try {
            addNotification('Rozpoczynam upload...', 'info');
            console.log('Calling api.uploadImage...');
            
            const url = await api.uploadImage(file);
            console.log('Upload successful! URL:', url);
            
            setFormData(prev => {
                const newUrls = [...(prev.imageUrls || []), url];
                console.log('Updated imageUrls:', newUrls);
                return { ...prev, imageUrls: newUrls };
            });
            
            addNotification(`Zdjęcie "${file.name}" zostało dodane pomyślnie!`, 'success');
            
            // Wyczyść input
            e.target.value = '';
            console.log('=== UPLOAD SUCCESS ===');
            
        } catch (error) {
            console.error('=== UPLOAD ERROR ===');
            console.error('Error object:', error);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            
            // Tryb offline - użyj placeholder obrazów
            if (error.message.includes('network') || error.message.includes('timeout') || error.message.includes('Firebase') || error.message.includes('Storage')) {
                console.log('Trying offline mode with placeholder...');
                const placeholderUrl = `https://via.placeholder.com/800x600/3B82F6/FFFFFF?text=${encodeURIComponent(file.name)}`;
                
                setFormData(prev => {
                    const newUrls = [...(prev.imageUrls || []), placeholderUrl];
                    console.log('Added placeholder URL:', placeholderUrl);
                    return { ...prev, imageUrls: newUrls };
                });
                
                addNotification(`Dodano placeholder dla "${file.name}" (tryb offline)`, 'warning');
                e.target.value = '';
                return;
            }
            
            const errorMessage = error.message || 'Nieznany błąd uploadu';
            addNotification(`Błąd uploadu: ${errorMessage}`, 'error');
        } finally {
            console.log('Setting isUploading to false');
            setIsUploading(false);
        }
    };

    const handleImageDelete = (indexToDelete) => {
        setFormData(prev => ({
            ...prev,
            imageUrls: prev.imageUrls.filter((_, index) => index !== indexToDelete)
        }));
        addNotification('Zdjęcie usunięte.');
    };

    const handleAddTag = () => {
        if (newTag.trim() && !(formData.tags || []).includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...(prev.tags || []), newTag.trim()]
            }));
            setNewTag('');
            addNotification('Tag dodany.');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
        }));
        addNotification('Tag usunięty.');
    };

    const handleAddFeature = () => {
        if (newFeature.trim() && !(formData.features || []).includes(newFeature.trim())) {
            setFormData(prev => ({
                ...prev,
                features: [...(prev.features || []), newFeature.trim()]
            }));
            setNewFeature('');
            addNotification('Cecha dodana.');
        }
    };

    const handleRemoveFeature = (featureToRemove) => {
        setFormData(prev => ({
            ...prev,
            features: (prev.features || []).filter(feature => feature !== featureToRemove)
        }));
        addNotification('Cecha usunięta.');
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Rozszerzona walidacja formularza
        if (!formData.name?.trim()) {
            addNotification('Nazwa produktu jest wymagana', 'error');
            return;
        }
        
        if (formData.price <= 0) {
            addNotification('Cena musi być większa od 0', 'error');
            return;
        }
        
        if (!formData.description?.trim()) {
            addNotification('Opis produktu jest wymagany', 'error');
            return;
        }
        
        if (!formData.shortDescription?.trim()) {
            addNotification('Krótki opis produktu jest wymagany', 'error');
            return;
        }
        
        if (!formData.brand?.trim()) {
            addNotification('Marka produktu jest wymagana', 'error');
            return;
        }
        
        if ((formData.imageUrls || []).length === 0) {
            addNotification('Dodaj przynajmniej jedno zdjęcie produktu', 'error');
            return;
        }
        
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-white">{product ? 'Edytuj produkt' : 'Dodaj produkt'}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Podstawowe informacje */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 mb-2">Nazwa produktu *</label>
                            <input name="name" value={formData.name} onChange={handleChange} placeholder="Tesla Wall Connector Gen 3" className="w-full p-3 border rounded bg-gray-700 border-gray-600 text-white" required />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Marka *</label>
                            <input name="brand" value={formData.brand} onChange={handleChange} placeholder="Tesla" className="w-full p-3 border rounded bg-gray-700 border-gray-600 text-white" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 mb-2">Cena (zł) *</label>
                            <input name="price" type="number" step="0.01" value={formData.price} onChange={handlePriceChange} placeholder="2499.00" className="w-full p-3 border rounded bg-gray-700 border-gray-600 text-white" required />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Kategoria *</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full p-3 border rounded bg-gray-700 border-gray-600 text-white">
                                {categories?.map(c => <option key={c.name} value={c.name}>{c.name}</option>) || 
                                 ['Ładowarki', 'Adaptery', 'Akcesoria', 'Baterie'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-400 mb-2">Krótki opis *</label>
                        <input name="shortDescription" value={formData.shortDescription} onChange={handleChange} placeholder="Najszybsza ładowarka domowa Tesla z mocą do 11.5 kW" className="w-full p-3 border rounded bg-gray-700 border-gray-600 text-white" required />
                    </div>

                    <div>
                        <label className="block text-gray-400 mb-2">Pełny opis *</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Szczegółowy opis produktu..." className="w-full p-3 border rounded h-32 bg-gray-700 border-gray-600 text-white" required></textarea>
                    </div>

                    {/* Specyfikacje i gwarancja */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 mb-2">Specyfikacje techniczne</label>
                            <textarea name="specifications" value={formData.specifications} onChange={handleChange} placeholder="Moc: 11.5 kW&#10;Napięcie: 230V&#10;Kabel: 5.5m" className="w-full p-3 border rounded h-24 bg-gray-700 border-gray-600 text-white"></textarea>
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Gwarancja</label>
                            <input name="warranty" value={formData.warranty} onChange={handleChange} placeholder="2 lata" className="w-full p-3 border rounded bg-gray-700 border-gray-600 text-white" />
                        </div>
                    </div>

                    {/* Stan magazynowy */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                            <input type="checkbox" id="inStock" name="inStock" checked={formData.inStock} onChange={handleChange} className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded" />
                            <label htmlFor="inStock" className="ml-2 text-white">Dostępny w magazynie</label>
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Ilość w magazynie</label>
                            <input name="stockQuantity" type="number" value={formData.stockQuantity} onChange={handleChange} placeholder="10" className="w-full p-3 border rounded bg-gray-700 border-gray-600 text-white" />
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input type="checkbox" id="bestseller" name="bestseller" checked={formData.bestseller} onChange={handleChange} className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded" />
                        <label htmlFor="bestseller" className="ml-2 text-white">Oznacz jako bestseller</label>
                    </div>
                    {/* Zarządzanie zdjęciami */}
                    <div className="mb-6">
                        <label className="block text-gray-400 mb-2">Zdjęcia produktu *</label>
                        
                        {/* Podgląd zdjęć */}
                        <div className="grid grid-cols-4 gap-2 mb-4">
                            {(formData.imageUrls || []).map((url, index) => (
                                <div key={url} className="relative group">
                                    <img 
                                        src={url} 
                                        alt={`Zdjęcie ${index + 1}`}
                                        className="w-full h-20 object-cover rounded border border-gray-600" 
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleImageDelete(index)}
                                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                        title="Usuń zdjęcie"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                    <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                                        {index + 1}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Upload input */}
                        <div className="flex items-center space-x-4">
                            <div className="flex-1">
                                <input 
                                    type="file" 
                                    onChange={handleImageUpload} 
                                    className="block w-full text-sm text-gray-400 
                                               file:mr-4 file:py-2 file:px-4 
                                               file:rounded-full file:border-0 
                                               file:text-sm file:font-semibold 
                                               file:bg-blue-600 file:text-white 
                                               hover:file:bg-blue-500 file:cursor-pointer"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    disabled={isUploading}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Dozwolone: JPG, PNG, WEBP (max 5MB)
                                </p>
                            </div>
                            
                            {isUploading && (
                                <div className="flex items-center space-x-2">
                                    <div className="spinner"></div>
                                    <span className="text-blue-400">Przesyłanie...</span>
                                </div>
                            )}
                        </div>
                        
                        {/* Info o zdjęciach */}
                        <div className="mt-2 text-sm text-gray-500">
                            Dodano: {(formData.imageUrls || []).length} zdjęć
                            {(formData.imageUrls || []).length === 0 && (
                                <span className="text-red-400 ml-2">- Wymagane minimum 1 zdjęcie</span>
                            )}
                        </div>
                    </div>

                    {/* Tagi */}
                    <div>
                        <label className="block text-gray-400 mb-2">Tagi</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {(formData.tags || []).map((tag, index) => (
                                <span key={index} className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center">
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTag(tag)}
                                        className="ml-2 text-blue-200 hover:text-white"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                placeholder="Dodaj tag (np. szybkie ładowanie)"
                                className="flex-1 p-2 border rounded bg-gray-700 border-gray-600 text-white"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                            />
                            <button
                                type="button"
                                onClick={handleAddTag}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Cechy produktu */}
                    <div>
                        <label className="block text-gray-400 mb-2">Cechy produktu</label>
                        <div className="space-y-2 mb-2">
                            {(formData.features || []).map((feature, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                                    <span className="text-white">{feature}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFeature(feature)}
                                        className="text-red-400 hover:text-red-300"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newFeature}
                                onChange={(e) => setNewFeature(e.target.value)}
                                placeholder="Dodaj cechę (np. Wodoodporność IP54)"
                                className="flex-1 p-2 border rounded bg-gray-700 border-gray-600 text-white"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                            />
                            <button
                                type="button"
                                onClick={handleAddFeature}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 mt-6">
                        <button type="button" onClick={onClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500">Anuluj</button>
                        <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-500">Zapisz</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setIsLoading(true);
            setOrders(await api.fetchOrders());
            setIsLoading(false);
        };
        fetch();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await api.updateOrderStatus(orderId, newStatus);
            setOrders(orders.map(o => o.id === orderId ? {...o, status: newStatus} : o));
        } catch (e) {
            console.error("Error updating status: ", e);
        }
    };

    if (isLoading) return <p>Ładowanie zamówień...</p>;

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Zamówienia</h2>
            <div className="overflow-x-auto bg-gray-800 rounded-lg">
                <table className="w-full text-left text-gray-300">
                    <thead className="bg-gray-700 text-sm text-gray-400 uppercase"><tr>
                        <th className="p-3">ID</th><th className="p-3">Klient</th><th className="p-3">Data</th><th className="p-3">Suma</th><th className="p-3">Status</th>
                    </tr></thead>
                    <tbody>{orders.map(order => (
                        <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                            <td className="p-3 font-medium text-white truncate max-w-xs">{order.id}</td>
                            <td className="p-3">{order.customer.email}</td>
                            <td className="p-3">{new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</td>
                            <td className="p-3">{order.total.toFixed(2)} zł</td>
                            <td className="p-3">
                                <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)} className="p-1 border rounded-md bg-gray-700 border-gray-600 text-white">
                                    <option>Nowe</option><option>W trakcie realizacji</option><option>Wysłane</option>
                                    <option>Zakończone</option><option>Anulowane</option>
                                </select>
                            </td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
        </div>
    );
};

// --- GŁÓWNY KOMPONENT APLIKACJI ---
export default function App() {
    const [page, setPage] = useState('home');
    const [pageData, setPageData] = useState(null);
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);
                // Waliduj czy to jest prawidłowa tablica
                if (Array.isArray(parsedCart)) {
                    return parsedCart;
                }
            }
            return [];
        } catch (error) {
            console.warn('Błąd odczytu koszyka z localStorage:', error);
            // Wyczyść uszkodzone dane
            localStorage.removeItem('cart');
            return [];
        }
    });
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [permissionError, setPermissionError] = useState(null);

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const [productsData, categoriesData] = await Promise.all([api.fetchProducts(), api.fetchCategories()]);
                setProducts(productsData);
                setCategories(categoriesData);
                setPermissionError(null);
            } catch (error) {
                if (error.code === 'permission-denied') {
                    setPermissionError("Nie można pobrać danych z Firebase z powodu niewystarczających uprawnień. Upewnij się, że poprawnie skonfigurowałeś reguły bezpieczeństwa w swojej bazie danych Firestore.");
                } else {
                    setPermissionError("Wystąpił nieoczekiwany błąd podczas ładowania danych.");
                }
                console.error("Błąd ładowania danych:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const tokenResult = await currentUser.getIdTokenResult();
                setUser(currentUser);
                // Automatyczne nadanie roli admina dla bartoszdomanski55@gmail.com
                if (currentUser.email === 'bartoszdomanski55@gmail.com') {
                    setUserRole('admin');
                } else {
                    setUserRole(tokenResult.claims.role || 'user');
                }
            } else {
                setUser(null);
                setUserRole(null);
            }
            await loadInitialData();
        });

        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        try {
            if (Array.isArray(cart)) {
                localStorage.setItem('cart', JSON.stringify(cart));
            }
        } catch (error) {
            console.warn('Błąd zapisu koszyka do localStorage:', error);
        }
    }, [cart]);

    const addNotification = (message, type = 'success') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 3000);
    };

    const navigate = (newPage, data = null) => {
        window.scrollTo(0, 0);
        setPage(newPage);
        setPageData(data);
        setIsMobileMenuOpen(false);
    };

    const addToCart = (product, quantity = 1) => {
        setCart(prevCart => {
            const existingProduct = prevCart.find(item => item.id === product.id);
            if (existingProduct) {
                return prevCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
                );
            }
            return [...prevCart, { ...product, quantity }];
        });
        addNotification(`Dodano do koszyka: ${product.name}`);
    };

    const updateCartQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            setCart(prevCart => prevCart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item));
        }
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

    const handleLogout = async () => {
        await signOut(auth);
        navigate('home');
    };
    
    const renderPage = () => {
        if (isLoading) return <LoadingScreen />;
        // The permissionError check is now handled at a higher level.
        switch (page) {
            case 'home': return <HomePage navigate={navigate} products={products} categories={categories} />;
            case 'category': return <CategoryPage navigate={navigate} products={products} categoryName={pageData} />;
            case 'product': return <ProductPage navigate={navigate} productId={pageData} />;
            case 'cart': return <CartPage navigate={navigate} />;
            case 'checkout': return user ? <CheckoutPage navigate={navigate} /> : <LoginPage navigate={navigate} addNotification={addNotification} />;
            case 'orderConfirmation': return <OrderConfirmationPage navigate={navigate} orderDetails={pageData} />;
            case 'admin': return userRole === 'admin' ? <AdminPanel navigate={navigate} /> : <AccessDenied navigate={navigate} />;
            case 'login': return <LoginPage navigate={navigate} addNotification={addNotification} />;
            case 'register': return <RegisterPage navigate={navigate} addNotification={addNotification} />;
            default: return <HomePage navigate={navigate} products={products} categories={categories} />;
        }
    };

    return (
        <AppContext.Provider value={{ cart, addToCart, updateCartQuantity, removeFromCart, clearCart, cartTotal, cartItemCount, user, userRole, handleLogout, navigate, products, categories, addNotification }}>
            <div className="bg-gray-900 text-gray-200 font-sans antialiased">
                {permissionError && <PermissionErrorDisplay message={permissionError} />}
                <NotificationCenter notifications={notifications} />
                {!permissionError && (
                    <>
                        <Header isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
                        <main className="pt-20 min-h-screen">
                            {renderPage()}
                        </main>
                        <Footer />
                    </>
                )}
            </div>
        </AppContext.Provider>
    );
}
