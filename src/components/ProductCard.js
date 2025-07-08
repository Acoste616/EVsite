import React, { memo } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { defaultProductImageUrl } from '../constants/sampleData';

const ProductCard = ({ product, navigate, addToCart }) => {
  const imageUrl = product.imageUrls?.[0] || defaultProductImageUrl;

  return (
    <motion.div
      className="bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer group hover:shadow-2xl transition-all duration-300"
      whileHover={{ scale: 1.02 }}
      onClick={() => navigate('product', product.id)}
    >
      <div className="relative overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
          onError={e => {
            e.target.src = defaultProductImageUrl;
          }}
        />
        {product.bestseller && (
          <span className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-sm font-bold">
            Bestseller
          </span>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-blue-400 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < Math.floor(product.rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-400'
              }`}
            />
          ))}
          <span className="ml-2 text-gray-400 text-sm">({product.rating})</span>
        </div>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-blue-400">
            {product.price.toLocaleString('pl-PL')} zł
          </span>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            onClick={e => {
              e.stopPropagation();
              addToCart(product);
            }}
          >
            Dodaj do koszyka
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default memo(ProductCard);
