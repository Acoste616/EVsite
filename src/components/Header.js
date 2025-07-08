import React, { memo } from 'react';
import { ShoppingCart, User, Menu, X, LogOut, Settings } from 'lucide-react';
import { logoUrl } from '../constants/sampleData';

const Header = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  user,
  userRole,
  cartItemCount,
  navigate,
  handleLogout,
}) => {
  return (
    <header className="bg-gray-900 bg-opacity-80 text-white p-4 flex items-center justify-between fixed top-0 left-0 right-0 z-40 backdrop-blur-sm">
      <div className="flex items-center space-x-6">
        <a onClick={() => navigate('home')} className="cursor-pointer">
          <img src={logoUrl} alt="EV-Shop Logo" className="h-10" />
        </a>
        <nav
          className="hidden md:flex items-center space-x-6"
          role="navigation"
          aria-label="Główna nawigacja"
        >
          <a
            onClick={() => navigate('category', 'Ładowarki')}
            className="hover:text-blue-400 transition-colors cursor-pointer"
          >
            Ładowarki
          </a>
          <a
            onClick={() => navigate('category', 'Adaptery')}
            className="hover:text-blue-400 transition-colors cursor-pointer"
          >
            Adaptery
          </a>
          <a
            onClick={() => navigate('category', 'Akcesoria')}
            className="hover:text-blue-400 transition-colors cursor-pointer"
          >
            Akcesoria
          </a>
          <a
            onClick={() => navigate('category', 'Baterie')}
            className="hover:text-blue-400 transition-colors cursor-pointer"
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

export default memo(Header);
