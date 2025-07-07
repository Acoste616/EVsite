import React from 'react';

const Footer = () => (
    <footer className="relative bg-gray-900 border-t border-gray-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-blue-400">EV Akcesoria</h3>
                    <p className="text-gray-400">
                        Napędzamy rewolucję. Najlepsze akcesoria dla Twojego EV, dostępne od ręki.
                    </p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-4">Informacje</h3>
                    <ul className="space-y-2">
                        <li><a href="#" className="text-gray-400 hover:text-white">O nas</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Kontakt</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Polityka prywatności</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Regulamin</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-4">Obsługa klienta</h3>
                    <ul className="space-y-2">
                         <li><a href="#" className="text-gray-400 hover:text-white">Dostawa i płatności</a></li>
                         <li><a href="#" className="text-gray-400 hover:text-white">Zwroty i reklamacje</a></li>
                         <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-4">Kontakt</h3>
                    <p className="text-gray-400">ul. Elektryczna 1, Warszawa</p>
                    <p className="text-gray-400">kontakt@ev-akcesoria.pl</p>
                    <p className="text-gray-400">+48 123 456 789</p>
                </div>
            </div>
            <div className="mt-8 border-t border-gray-700 pt-8 text-center text-gray-500">
                <p>
                    &copy; {new Date().getFullYear()} EV Akcesoria. Wszelkie prawa zastrzeżone. 
                    Stworzone z pasji do elektromobilności.
                </p>
            </div>
        </div>
    </footer>
);

export default Footer;