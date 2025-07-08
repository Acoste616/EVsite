import { lazy } from 'react';

// Lazy load heavy components for better performance
export const LazyAdminPanel = lazy(() =>
  import('./AdminPanel').catch(() => ({
    default: () => <div>Error loading Admin Panel</div>,
  }))
);

export const LazyProductPage = lazy(() =>
  import('./ProductPage').catch(() => ({
    default: () => <div>Error loading Product Page</div>,
  }))
);

export const LazyCheckoutPage = lazy(() =>
  import('./CheckoutPage').catch(() => ({
    default: () => <div>Error loading Checkout</div>,
  }))
);

// Loading component for suspense fallback
export const PageLoadingSpinner = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400"></div>
      <p className="text-white mt-4 text-lg">Ładowanie strony...</p>
    </div>
  </div>
);
