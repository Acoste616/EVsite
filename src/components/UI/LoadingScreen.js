import React from 'react';
import { Zap } from 'lucide-react';

const LoadingScreen = () => (
    <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-[100]">
        <div className="flex items-center space-x-3">
            <Zap className="h-12 w-12 text-blue-500 animate-pulse" />
            <span className="text-3xl font-bold text-white">EV Akcesoria</span>
        </div>
        <p className="text-gray-400 mt-4">Ładowanie przyszłości...</p>
    </div>
);

export default LoadingScreen;