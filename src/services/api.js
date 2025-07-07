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
  onSnapshot 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

export const api = {
  // Produkty
  fetchProducts: async () => {
    const productsCol = collection(db, 'products');
    const snapshot = await getDocs(productsCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  fetchCategories: async () => {
    const products = await api.fetchProducts();
    const categoryNames = [...new Set(products.map(p => p.category))];
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

  // Opinie
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

  // Upload obrazów
  uploadImage: async (file) => {
    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  },

  // Admin funkcje
  addProduct: async (product) => addDoc(collection(db, 'products'), product),
  updateProduct: async (id, product) => updateDoc(doc(db, 'products', id), product),
  deleteProduct: async (id) => deleteDoc(doc(db, 'products', id)),

  // Zamówienia
  fetchOrders: async () => {
    const ordersCol = collection(db, 'orders');
    const snapshot = await getDocs(ordersCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  updateOrderStatus: async (id, status) => updateDoc(doc(db, 'orders', id), { status }),
};