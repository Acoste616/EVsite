import React, { useContext } from 'react';
import { ShoppingCart, User, Menu, X, Settings, LogOut, Zap } from 'lucide-react';
import { AppContext } from '../../context/AppContext';

const Header = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
    const { navigate, cartItemCount, user, userRole, handleLogout, categories } = useContext(AppContext);
    
    const navLinks = (
        <>
            <a onClick={() => navigate('home')} className="cursor-pointer hover:text-blue-400 transition-colors">
                Strona główna
            </a>
            <a onClick={() => navigate('category', 'Wszystkie')} className="cursor-pointer hover:text-blue-400 transition-colors">
                Produkty
            </a>
            {categories.slice(0, 3).map(cat => (
                 <a key={cat.name} onClick={() => navigate('category', cat.name)} className="cursor-pointer hover:text-blue-400 transition-colors">
                     {cat.name}
                 </a>
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
                                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                                    {cartItemCount}
                                </span>
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
                                    {userRole === 'admin' && 
                                        <a onClick={() => navigate('admin')} className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer">
                                            <Settings className="w-4 h-4 mr-2" />Panel Admina
                                        </a>
                                    }
                                    <a onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer">
                                        <LogOut className="w-4 h-4 mr-2" />Wyloguj
                                    </a>
                                </div>
                            ) : (
                                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <a onClick={() => navigate('login')} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer">
                                        Zaloguj się
                                    </a>
                                    <a onClick={() => navigate('register')} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer">
                                        Zarejestruj się
                                    </a>
                                </div>
                            )}
                        </div>
                        
                        <div className="md:hidden">
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                                {isMobileMenuOpen ? 
                                    <X className="h-7 w-7 text-gray-300" /> : 
                                    <Menu className="h-7 w-7 text-gray-300" />
                                }
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

export default Header;