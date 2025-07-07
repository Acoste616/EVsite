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

// --- API SERWIS (LIVE) ---
// Funkcje do interakcji z Firebase
const api = {
  fetchProducts: async () => {
    const productsCol = collection(db, 'products');
    const snapshot = await getDocs(productsCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
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
    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  },
  // Funkcje dla admina
  addProduct: async (product) => addDoc(collection(db, 'products'), product),
  updateProduct: async (id, product) => updateDoc(doc(db, 'products', id), product),
  deleteProduct: async (id) => deleteDoc(doc(db, 'products', id)),
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
        {notifications.map(n => (
            <div key={n.id} className={`flex items-center p-4 rounded-lg shadow-lg animate-fade-in-right ${n.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                {n.type === 'success' ? <CheckCircle className="mr-2" /> : <AlertCircle className="mr-2" />}
                {n.message}
            </div>
        ))}
    </div>
);

const LoadingScreen = () => (
    <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-[100]">
        <div className="flex items-center space-x-3">
            <Zap className="h-12 w-12 text-blue-500 animate-pulse" />
            <span className="text-3xl font-bold text-white">EV Akcesoria</span>
        </div>
        <p className="text-gray-400 mt-4">Ładowanie przyszłości...</p>
    </div>
);

const Header = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
    const { navigate, cartItemCount, user, userRole, handleLogout, categories } = useContext(AppContext);
    const navLinks = (
        <>
            <a onClick={() => navigate('home')} className="cursor-pointer hover:text-blue-400 transition-colors">Strona główna</a>
            <a onClick={() => navigate('category', 'Wszystkie')} className="cursor-pointer hover:text-blue-400 transition-colors">Produkty</a>
            {categories.slice(0, 3).map(cat => (
                 <a key={cat.name} onClick={() => navigate('category', cat.name)} className="cursor-pointer hover:text-blue-400 transition-colors">{cat.name}</a>
            ))}
        </>
    );

    return (
        <header className="bg-gray-900/70 backdrop-blur-lg border-b border-gray-700/50 fixed top-0 left-0 right-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex-shrink-0">
                        <a onClick={() => navigate('home')} className="flex items-center space-x-2 cursor-pointer">
                            <Zap className="h-8 w-8 text-blue-500" />
                            <span className="text-2xl font-bold text-white">EV Akcesoria</span>
                        </a>
                    </div>
                    <nav className="hidden md:flex md:space-x-8 items-center text-lg font-medium text-gray-300">
                        {navLinks}
                    </nav>
                    <div className="flex items-center space-x-4">
                        <a onClick={() => navigate('cart')} className="relative cursor-pointer group">
                            <ShoppingCart className="h-7 w-7 text-gray-400 group-hover:text-blue-400 transition-colors" />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">{cartItemCount}</span>
                            )}
                        </a>
                        <div className="relative group">
                             <a onClick={() => user ? null : navigate('login')} className="cursor-pointer">
                                <User className="h-7 w-7 text-gray-400 group-hover:text-blue-400 transition-colors" />
                            </a>
                            {user ? (
                                <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <p className="px-4 py-2 text-sm text-gray-400 border-b border-gray-700">Zalogowano jako:</p>
                                    <p className="px-4 pt-1 pb-2 text-sm text-white truncate">{user.email}</p>
                                    {userRole === 'admin' && <a onClick={() => navigate('admin')} className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer"><Settings className="w-4 h-4 mr-2" />Panel Admina</a>}
                                    <a onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer"><LogOut className="w-4 h-4 mr-2" />Wyloguj</a>
                                </div>
                            ) : (
                                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <a onClick={() => navigate('login')} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer">Zaloguj się</a>
                                    <a onClick={() => navigate('register')} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer">Zarejestruj się</a>
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
                <div className="md:hidden bg-gray-900 shadow-lg border-t border-gray-700">
                    <nav className="flex flex-col space-y-4 p-4 text-center text-gray-300">
                        {navLinks}
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
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden group transition-all duration-300 hover:shadow-blue-500/20 hover:border-blue-800/50 transform hover:-translate-y-2">
            <div className="relative">
                <img src={product.imageUrls && product.imageUrls[0] ? product.imageUrls[0] : 'https://placehold.co/600x600/111827/ffffff?text=Brak+zdjęcia'} alt={product.name} className="w-full h-64 object-cover" />
                <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 m-2 rounded-full text-sm font-semibold">
                    {product.category}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center space-x-2">
                    <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-500 flex-1">Do koszyka</button>
                    <button onClick={() => navigate('product', product.id)} className="bg-gray-200/80 text-gray-900 font-bold p-2 rounded-full hover:bg-white"><Eye /></button>
                </div>
            </div>
            <div className="p-4 cursor-pointer" onClick={() => navigate('product', product.id)}>
                <h3 className="text-lg font-semibold truncate text-white">{product.name}</h3>
                <div className="flex items-center justify-between mt-2">
                    <p className="text-xl font-bold text-blue-400">{product.price.toFixed(2)} zł</p>
                    <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
                        <span className="text-gray-400 ml-1">{product.rating || 'Brak'}</span>
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
            <section className="relative h-[85vh] text-white flex items-center justify-center overflow-hidden">
                <video autoPlay loop muted playsInline className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover">
                    <source src="https://assets.mixkit.co/videos/preview/mixkit-electric-car-charging-at-a-modern-charging-station-43304-large.mp4" type="video/mp4" />
                    [Film przedstawiający ładowanie samochodu elektrycznego]
                </video>
                <div className="absolute inset-0 bg-black/60 z-10"></div>
                <div className="relative z-20 text-center p-4 animate-fade-in-up">
                    <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-4">Przyszłość jest Elektryczna.</h1>
                    <p className="text-lg md:text-2xl max-w-3xl mx-auto mb-8 text-gray-300">Wyposaż swój samochód w najlepsze akcesoria na rynku.</p>
                    <button onClick={() => navigate('category', 'Wszystkie')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-10 rounded-full text-xl transition-all transform hover:scale-105 shadow-lg shadow-blue-600/30 flex items-center justify-center mx-auto">
                        Odkryj produkty <ArrowRight className="ml-3 h-6 w-6" />
                    </button>
                </div>
            </section>

            <section className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">Przeglądaj Kategorie</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8">
                    {categories.map(category => (
                        <div key={category.name} onClick={() => navigate('category', category.name)} className="group cursor-pointer text-center transform transition-all duration-300 hover:!scale-105 hover:z-10">
                            <div className="relative rounded-lg overflow-hidden shadow-lg mb-4 aspect-w-4 aspect-h-3">
                                <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-200">{category.name}</h3>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-gray-900 py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">Nasze Bestsellery</h2>
                     {bestsellers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {bestsellers.map(product => (
                                <ProductCard key={product.id} product={product} navigate={navigate} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-400">Brak bestsellerów do wyświetlenia. Dodaj produkty w panelu admina.</p>
                    )}
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

    if (isLoading || !product) return <LoadingScreen />;
    
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
                        {cart.map(item => (
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
    const { addNotification } = useContext(AppContext);

    useEffect(() => {
        const fetch = async () => {
            setIsLoading(true);
            setProducts(await api.fetchProducts());
            setIsLoading(false);
        };
        fetch();
    }, []);

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
    
    if (isLoading) return <p>Ładowanie produktów...</p>;
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Produkty</h2>
                <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-500">Dodaj produkt</button>
            </div>
             <div className="overflow-x-auto bg-gray-800 rounded-lg">
                <table className="w-full text-left text-gray-300">
                    <thead className="bg-gray-700 text-sm text-gray-400 uppercase"><tr>
                        <th className="p-3">Nazwa</th><th className="p-3">Kategoria</th><th className="p-3">Cena</th><th className="p-3">Akcje</th>
                    </tr></thead>
                    <tbody>{products.map(p => (
                        <tr key={p.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                            <td className="p-3 font-medium text-white">{p.name}</td><td className="p-3">{p.category}</td><td className="p-3">{p.price.toFixed(2)} zł</td>
                            <td className="p-3 space-x-2">
                                <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="text-blue-400 hover:underline">Edytuj</button>
                                <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:underline">Usuń</button>
                            </td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
            {isModalOpen && <ProductEditModal product={editingProduct} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

const ProductEditModal = ({ product, onSave, onClose }) => {
    const [formData, setFormData] = useState(
        product || { name: '', price: 0, category: 'Ładowarki', brand: '', description: '', imageUrls: [], bestseller: false, rating: 0 }
    );
    const [isUploading, setIsUploading] = useState(false);
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
        if (!file) return;
        setIsUploading(true);
        try {
            const url = await api.uploadImage(file);
            setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, url] }));
            addNotification('Zdjęcie dodane.');
        } catch (error) {
            addNotification('Błąd uploadu zdjęcia.', 'error');
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-white">{product ? 'Edytuj produkt' : 'Dodaj produkt'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Nazwa produktu" className="w-full p-2 border rounded bg-gray-700 border-gray-600 text-white" required />
                    <input name="price" type="number" step="0.01" value={formData.price} onChange={handlePriceChange} placeholder="Cena" className="w-full p-2 border rounded bg-gray-700 border-gray-600 text-white" required />
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded bg-gray-700 border-gray-600 text-white">
                        {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                    <input name="brand" value={formData.brand} onChange={handleChange} placeholder="Marka" className="w-full p-2 border rounded bg-gray-700 border-gray-600 text-white" />
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Opis" className="w-full p-2 border rounded h-32 bg-gray-700 border-gray-600 text-white"></textarea>
                    <div className="flex items-center">
                        <input type="checkbox" id="bestseller" name="bestseller" checked={formData.bestseller} onChange={handleChange} className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded" />
                        <label htmlFor="bestseller" className="ml-2 text-white">Bestseller</label>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2">Zdjęcia</label>
                        <div className="grid grid-cols-4 gap-2 mb-2">
                            {formData.imageUrls.map(url => <img key={url} src={url} className="w-full h-16 object-cover rounded" />)}
                        </div>
                        <input type="file" onChange={handleImageUpload} className="text-white" />
                        {isUploading && <p className="text-blue-400">Przesyłanie...</p>}
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
    const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart')) || []);
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
                
                // Tymczasowe rozwiązanie: dodaj swój email tutaj, aby mieć uprawnienia admina
                const adminEmails = ['admin@evshop.com']; // Dodaj swój email tutaj
                setUserRole(adminEmails.includes(currentUser.email) ? 'admin' : (tokenResult.claims.role || 'user'));
            } else {
                setUser(null);
                setUserRole(null);
            }
            await loadInitialData();
        });

        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
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
