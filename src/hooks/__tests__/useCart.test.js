import { renderHook, act } from '@testing-library/react';
import { useCart } from '../useCart';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useCart Hook', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('should initialize with empty cart', () => {
    const { result } = renderHook(() => useCart());

    expect(result.current.cart).toEqual([]);
    expect(result.current.cartItemCount).toBe(0);
  });

  it('should load cart from localStorage on initialization', () => {
    const savedCart = [
      { id: '1', name: 'Product 1', price: 100, quantity: 2 },
      { id: '2', name: 'Product 2', price: 200, quantity: 1 },
    ];
    localStorageMock.setItem('cart', JSON.stringify(savedCart));

    const { result } = renderHook(() => useCart());

    expect(result.current.cart).toEqual(savedCart);
    expect(result.current.cartItemCount).toBe(3);
  });

  it('should handle invalid localStorage data gracefully', () => {
    localStorageMock.setItem('cart', 'invalid-json');

    const { result } = renderHook(() => useCart());

    expect(result.current.cart).toEqual([]);
    expect(result.current.cartItemCount).toBe(0);
  });

  describe('addToCart', () => {
    it('should add new product to cart', () => {
      const { result } = renderHook(() => useCart());
      const product = { id: '1', name: 'Product 1', price: 100 };

      act(() => {
        result.current.addToCart(product);
      });

      expect(result.current.cart).toEqual([{ ...product, quantity: 1 }]);
      expect(result.current.cartItemCount).toBe(1);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cart',
        JSON.stringify([{ ...product, quantity: 1 }])
      );
    });

    it('should add specified quantity of product to cart', () => {
      const { result } = renderHook(() => useCart());
      const product = { id: '1', name: 'Product 1', price: 100 };

      act(() => {
        result.current.addToCart(product, 3);
      });

      expect(result.current.cart).toEqual([{ ...product, quantity: 3 }]);
      expect(result.current.cartItemCount).toBe(3);
    });

    it('should increase quantity if product already exists in cart', () => {
      const { result } = renderHook(() => useCart());
      const product = { id: '1', name: 'Product 1', price: 100 };

      act(() => {
        result.current.addToCart(product, 2);
      });

      act(() => {
        result.current.addToCart(product, 1);
      });

      expect(result.current.cart).toEqual([{ ...product, quantity: 3 }]);
      expect(result.current.cartItemCount).toBe(3);
    });
  });

  describe('updateCartQuantity', () => {
    it('should update product quantity', () => {
      const { result } = renderHook(() => useCart());
      const product = { id: '1', name: 'Product 1', price: 100 };

      act(() => {
        result.current.addToCart(product, 2);
      });

      act(() => {
        result.current.updateCartQuantity('1', 5);
      });

      expect(result.current.cart[0].quantity).toBe(5);
      expect(result.current.cartItemCount).toBe(5);
    });

    it('should remove product if quantity is set to 0', () => {
      const { result } = renderHook(() => useCart());
      const product = { id: '1', name: 'Product 1', price: 100 };

      act(() => {
        result.current.addToCart(product, 2);
      });

      act(() => {
        result.current.updateCartQuantity('1', 0);
      });

      expect(result.current.cart).toEqual([]);
      expect(result.current.cartItemCount).toBe(0);
    });

    it('should remove product if quantity is negative', () => {
      const { result } = renderHook(() => useCart());
      const product = { id: '1', name: 'Product 1', price: 100 };

      act(() => {
        result.current.addToCart(product, 2);
      });

      act(() => {
        result.current.updateCartQuantity('1', -1);
      });

      expect(result.current.cart).toEqual([]);
      expect(result.current.cartItemCount).toBe(0);
    });

    it('should not update if product does not exist', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.updateCartQuantity('nonexistent', 5);
      });

      expect(result.current.cart).toEqual([]);
      expect(result.current.cartItemCount).toBe(0);
    });
  });

  describe('removeFromCart', () => {
    it('should remove product from cart', () => {
      const { result } = renderHook(() => useCart());
      const product1 = { id: '1', name: 'Product 1', price: 100 };
      const product2 = { id: '2', name: 'Product 2', price: 200 };

      act(() => {
        result.current.addToCart(product1);
        result.current.addToCart(product2);
      });

      act(() => {
        result.current.removeFromCart('1');
      });

      expect(result.current.cart).toEqual([{ ...product2, quantity: 1 }]);
      expect(result.current.cartItemCount).toBe(1);
    });

    it('should not affect cart if product does not exist', () => {
      const { result } = renderHook(() => useCart());
      const product = { id: '1', name: 'Product 1', price: 100 };

      act(() => {
        result.current.addToCart(product);
      });

      act(() => {
        result.current.removeFromCart('nonexistent');
      });

      expect(result.current.cart).toEqual([{ ...product, quantity: 1 }]);
      expect(result.current.cartItemCount).toBe(1);
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', () => {
      const { result } = renderHook(() => useCart());
      const product1 = { id: '1', name: 'Product 1', price: 100 };
      const product2 = { id: '2', name: 'Product 2', price: 200 };

      act(() => {
        result.current.addToCart(product1);
        result.current.addToCart(product2);
      });

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.cart).toEqual([]);
      expect(result.current.cartItemCount).toBe(0);
      expect(localStorageMock.setItem).toHaveBeenLastCalledWith(
        'cart',
        JSON.stringify([])
      );
    });
  });

  describe('cartItemCount', () => {
    it('should calculate total quantity of all items', () => {
      const { result } = renderHook(() => useCart());
      const product1 = { id: '1', name: 'Product 1', price: 100 };
      const product2 = { id: '2', name: 'Product 2', price: 200 };

      act(() => {
        result.current.addToCart(product1, 3);
        result.current.addToCart(product2, 2);
      });

      expect(result.current.cartItemCount).toBe(5);
    });

    it('should return 0 for empty cart', () => {
      const { result } = renderHook(() => useCart());

      expect(result.current.cartItemCount).toBe(0);
    });
  });
});
