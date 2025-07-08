import React, { memo } from 'react';

const Footer = () => (
  <footer className="bg-gray-900 text-gray-400 py-12">
    <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-4">
      <div>
        <h3 className="font-bold text-white mb-4">EV-Shop</h3>
        <p>Twoje źródło energii dla mobilności.</p>
      </div>
      <div>
        <h3 className="font-bold text-white mb-4">Produkty</h3>
        <ul className="space-y-2">
          <li>
            <a href="#" className="hover:text-white transition-colors">
              Ładowarki
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-white transition-colors">
              Adaptery
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-white transition-colors">
              Akcesoria
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-white transition-colors">
              Baterie
            </a>
          </li>
        </ul>
      </div>
      <div>
        <h3 className="font-bold text-white mb-4">Wsparcie</h3>
        <ul className="space-y-2">
          <li>
            <a href="#" className="hover:text-white transition-colors">
              Kontakt
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-white transition-colors">
              FAQ
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-white transition-colors">
              Dostawa
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-white transition-colors">
              Zwroty
            </a>
          </li>
        </ul>
      </div>
      <div>
        <h3 className="font-bold text-white mb-4">Firma</h3>
        <ul className="space-y-2">
          <li>
            <a href="#" className="hover:text-white transition-colors">
              O nas
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-white transition-colors">
              Kariera
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-white transition-colors">
              Prasa
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-white transition-colors">
              Partnerzy
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div className="border-t border-gray-700 mt-8 pt-8 text-center">
      <p>&copy; 2024 EV-Shop. Wszystkie prawa zastrzeżone.</p>
    </div>
  </footer>
);

export default memo(Footer);
