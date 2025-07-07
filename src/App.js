import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './services/firebase';
import { api } from './services/api';
import { AppContext } from './context/AppContext';

// UI Components
import LoadingScreen from './components/UI/LoadingScreen';
import NotificationCenter from './components/UI/NotificationCenter';
import PermissionErrorDisplay from './components/UI/PermissionErrorDisplay';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

// Icons
import { useState as useStateIcon, useEffect as useEffectIcon, createContext, useContext, useRef } from 'react';
import { ShoppingCart, User, Star, Menu, X, Trash2, Plus, Minus, Truck, CreditCard, ShieldCheck, Search, Filter, LogOut, Settings, ArrowRight, Eye, Zap, ImagePlus, AlertCircle, CheckCircle, BarChart } from 'lucide-react';

// Temporary inline components (będą przeniesione do osobnych plików)
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

// Simplified other pages for now
const CategoryPage = () => <div className="container mx-auto px-4 py-8 text-white"><h1 className="text-4xl font-bold">Kategorie - W trakcie implementacji</h1></div>;
const ProductPage = () => <div className="container mx-auto px-4 py-8 text-white"><h1 className="text-4xl font-bold">Szczegóły produktu - W trakcie implementacji</h1></div>;
const CartPage = () => <div className="container mx-auto px-4 py-8 text-white"><h1 className="text-4xl font-bold">Koszyk - W trakcie implementacji</h1></div>;
const CheckoutPage = () => <div className="container mx-auto px-4 py-8 text-white"><h1 className="text-4xl font-bold">Zamówienie - W trakcie implementacji</h1></div>;
const LoginPage = () => <div className="container mx-auto px-4 py-8 text-white"><h1 className="text-4xl font-bold">Logowanie - W trakcie implementacji</h1></div>;
const RegisterPage = () => <div className="container mx-auto px-4 py-8 text-white"><h1 className="text-4xl font-bold">Rejestracja - W trakcie implementacji</h1></div>;
const AdminPanel = () => <div className="container mx-auto px-4 py-8 text-white"><h1 className="text-4xl font-bold">Panel Admin - W trakcie implementacji</h1></div>;
const AccessDenied = () => <div className="container mx-auto px-4 py-8 text-white"><h1 className="text-4xl font-bold">Brak dostępu</h1></div>;

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
                setUserRole(tokenResult.claims.role || 'user');
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
        
        switch (page) {
            case 'home': return <HomePage navigate={navigate} products={products} categories={categories} />;
            case 'category': return <CategoryPage navigate={navigate} products={products} categoryName={pageData} />;
            case 'product': return <ProductPage navigate={navigate} productId={pageData} />;
            case 'cart': return <CartPage navigate={navigate} />;
            case 'checkout': return user ? <CheckoutPage navigate={navigate} /> : <LoginPage navigate={navigate} addNotification={addNotification} />;
            case 'admin': return userRole === 'admin' ? <AdminPanel navigate={navigate} /> : <AccessDenied navigate={navigate} />;
            case 'login': return <LoginPage navigate={navigate} addNotification={addNotification} />;
            case 'register': return <RegisterPage navigate={navigate} addNotification={addNotification} />;
            default: return <HomePage navigate={navigate} products={products} categories={categories} />;
        }
    };

    return (
        <AppContext.Provider value={{ 
            cart, addToCart, updateCartQuantity, removeFromCart, clearCart, cartTotal, cartItemCount, 
            user, userRole, handleLogout, navigate, products, categories, addNotification 
        }}>
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
