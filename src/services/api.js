import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  onSnapshot,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from './firebase';
import { sampleTeslaProducts, categoriesData } from '../constants/sampleData';

// API Service for Firebase operations
export const api = {
  fetchProducts: async () => {
    try {
      const productsCol = collection(db, 'products');
      const snapshot = await getDocs(productsCol);
      const firebaseProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // If database is empty, return sample Tesla products
      if (firebaseProducts.length === 0) {
        return sampleTeslaProducts;
      }

      // Combine Firebase products with sample Tesla products
      const allProducts = [...firebaseProducts, ...sampleTeslaProducts];
      // Remove duplicates based on ID
      const uniqueProducts = allProducts.filter(
        (product, index, self) =>
          index === self.findIndex(p => p.id === product.id)
      );

      return uniqueProducts;
    } catch (error) {
      console.error('Error fetching products:', error);
      // In case of error, return sample Tesla products
      return sampleTeslaProducts;
    }
  },

  fetchCategories: async () => {
    try {
      const categoriesCol = collection(db, 'categories');
      const snapshot = await getDocs(categoriesCol);
      const firebaseCategories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Return sample categories if Firebase is empty
      return firebaseCategories.length > 0
        ? firebaseCategories
        : categoriesData;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return categoriesData;
    }
  },

  fetchProduct: async id => {
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },

  getReviews: (productId, callback) => {
    try {
      const reviewsQuery = query(
        collection(db, `products/${productId}/reviews`)
      );
      return onSnapshot(reviewsQuery, snapshot => {
        const reviews = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(reviews);
      });
    } catch (error) {
      console.error('Error getting reviews:', error);
      callback([]);
    }
  },

  addReview: async (productId, review) => {
    try {
      await addDoc(collection(db, `products/${productId}/reviews`), review);
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  },

  uploadImage: async file => {
    try {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      return getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  deleteImage: async imageUrl => {
    // Prevent trying to delete sample images from Unsplash
    if (imageUrl.includes('unsplash.com')) {
      console.log('Attempting to delete sample image - operation ignored.');
      return;
    }
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      if (error.code === 'storage/object-not-found') {
        console.warn(
          'Attempted to delete image that does not exist in Firebase Storage:',
          imageUrl
        );
      } else {
        throw error;
      }
    }
  },

  // Admin functions
  addProduct: async product => {
    try {
      return await addDoc(collection(db, 'products'), product);
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  },

  updateProduct: async (id, product) => {
    try {
      await updateDoc(doc(db, 'products', id), product);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  deleteProduct: async id => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status });
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  fetchUsers: async () => {
    try {
      const usersCol = collection(db, 'users');
      const snapshot = await getDocs(usersCol);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  fetchOrders: async () => {
    try {
      const ordersCol = collection(db, 'orders');
      const snapshot = await getDocs(ordersCol);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },
};
