import { api } from '../api';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(),
}));

// Mock Firebase database
jest.mock('../firebase', () => ({
  db: {},
}));

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
  });

  describe('fetchProducts', () => {
    it('should fetch products successfully', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', price: 100 },
        { id: '2', name: 'Product 2', price: 200 },
      ];

      getDocs.mockResolvedValue({
        docs: mockProducts.map(product => ({
          id: product.id,
          data: () => ({ name: product.name, price: product.price }),
        })),
      });

      const result = await api.fetchProducts();

      expect(collection).toHaveBeenCalledWith({}, 'products');
      expect(getDocs).toHaveBeenCalled();
      expect(result).toEqual(mockProducts);
    });

    it('should handle fetch products error', async () => {
      const error = new Error('Fetch failed');
      getDocs.mockRejectedValue(error);

      const result = await api.fetchProducts();

      expect(console.error).toHaveBeenCalledWith(
        'Error fetching products:',
        error
      );
      expect(result).toEqual([]);
    });
  });

  describe('fetchProduct', () => {
    it('should fetch single product successfully', async () => {
      const mockProduct = { id: '1', name: 'Product 1', price: 100 };

      getDoc.mockResolvedValue({
        exists: () => true,
        id: mockProduct.id,
        data: () => ({ name: mockProduct.name, price: mockProduct.price }),
      });

      const result = await api.fetchProduct('1');

      expect(doc).toHaveBeenCalledWith({}, 'products', '1');
      expect(getDoc).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });

    it('should return null for non-existent product', async () => {
      getDoc.mockResolvedValue({
        exists: () => false,
      });

      const result = await api.fetchProduct('999');

      expect(result).toBeNull();
    });

    it('should handle fetch product error', async () => {
      const error = new Error('Fetch failed');
      getDoc.mockRejectedValue(error);

      const result = await api.fetchProduct('1');

      expect(console.error).toHaveBeenCalledWith(
        'Error fetching product:',
        error
      );
      expect(result).toBeNull();
    });
  });

  describe('addProduct', () => {
    it('should add product successfully', async () => {
      const mockProduct = { name: 'New Product', price: 150 };
      const mockDocRef = { id: 'new-id' };

      addDoc.mockResolvedValue(mockDocRef);

      const result = await api.addProduct(mockProduct);

      expect(collection).toHaveBeenCalledWith({}, 'products');
      expect(addDoc).toHaveBeenCalledWith(undefined, mockProduct);
      expect(result).toBe('new-id');
    });

    it('should handle add product error', async () => {
      const error = new Error('Add failed');
      addDoc.mockRejectedValue(error);

      const result = await api.addProduct({ name: 'Test' });

      expect(console.error).toHaveBeenCalledWith(
        'Error adding product:',
        error
      );
      expect(result).toBeNull();
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      const updates = { name: 'Updated Product', price: 200 };

      updateDoc.mockResolvedValue();

      const result = await api.updateProduct('1', updates);

      expect(doc).toHaveBeenCalledWith({}, 'products', '1');
      expect(updateDoc).toHaveBeenCalledWith(undefined, updates);
      expect(result).toBe(true);
    });

    it('should handle update product error', async () => {
      const error = new Error('Update failed');
      updateDoc.mockRejectedValue(error);

      const result = await api.updateProduct('1', { name: 'Test' });

      expect(console.error).toHaveBeenCalledWith(
        'Error updating product:',
        error
      );
      expect(result).toBe(false);
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      deleteDoc.mockResolvedValue();

      const result = await api.deleteProduct('1');

      expect(doc).toHaveBeenCalledWith({}, 'products', '1');
      expect(deleteDoc).toHaveBeenCalledWith(undefined);
      expect(result).toBe(true);
    });

    it('should handle delete product error', async () => {
      const error = new Error('Delete failed');
      deleteDoc.mockRejectedValue(error);

      const result = await api.deleteProduct('1');

      expect(console.error).toHaveBeenCalledWith(
        'Error deleting product:',
        error
      );
      expect(result).toBe(false);
    });
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      const mockOrder = { userId: 'user1', items: [], total: 100 };
      const mockDocRef = { id: 'order-id' };

      addDoc.mockResolvedValue(mockDocRef);

      const result = await api.createOrder(mockOrder);

      expect(collection).toHaveBeenCalledWith({}, 'orders');
      expect(addDoc).toHaveBeenCalledWith(undefined, {
        ...mockOrder,
        createdAt: expect.any(Date),
        status: 'pending',
      });
      expect(result).toBe('order-id');
    });

    it('should handle create order error', async () => {
      const error = new Error('Create failed');
      addDoc.mockRejectedValue(error);

      const result = await api.createOrder({ userId: 'user1' });

      expect(console.error).toHaveBeenCalledWith(
        'Error creating order:',
        error
      );
      expect(result).toBeNull();
    });
  });

  describe('fetchUserOrders', () => {
    it('should fetch user orders successfully', async () => {
      const mockOrders = [
        { id: '1', userId: 'user1', total: 100 },
        { id: '2', userId: 'user1', total: 200 },
      ];

      getDocs.mockResolvedValue({
        docs: mockOrders.map(order => ({
          id: order.id,
          data: () => ({ userId: order.userId, total: order.total }),
        })),
      });

      const result = await api.fetchUserOrders('user1');

      expect(collection).toHaveBeenCalledWith({}, 'orders');
      expect(query).toHaveBeenCalled();
      expect(where).toHaveBeenCalledWith('userId', '==', 'user1');
      expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(result).toEqual(mockOrders);
    });
  });

  describe('getReviews', () => {
    it('should set up reviews listener', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();

      onSnapshot.mockReturnValue(mockUnsubscribe);

      const unsubscribe = api.getReviews('product1', mockCallback);

      expect(collection).toHaveBeenCalledWith({}, 'reviews');
      expect(query).toHaveBeenCalled();
      expect(where).toHaveBeenCalledWith('productId', '==', 'product1');
      expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(onSnapshot).toHaveBeenCalled();
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('should handle reviews listener error', () => {
      const mockCallback = jest.fn();
      const error = new Error('Listener failed');

      onSnapshot.mockImplementation((query, callback, errorCallback) => {
        errorCallback(error);
        return jest.fn();
      });

      api.getReviews('product1', mockCallback);

      expect(console.error).toHaveBeenCalledWith(
        'Error fetching reviews:',
        error
      );
    });
  });

  describe('addReview', () => {
    it('should add review successfully', async () => {
      const mockReview = { productId: 'product1', rating: 5, text: 'Great!' };
      const mockDocRef = { id: 'review-id' };

      addDoc.mockResolvedValue(mockDocRef);

      const result = await api.addReview('product1', mockReview);

      expect(collection).toHaveBeenCalledWith({}, 'reviews');
      expect(addDoc).toHaveBeenCalledWith(undefined, {
        ...mockReview,
        productId: 'product1',
      });
      expect(result).toBe('review-id');
    });
  });
});
