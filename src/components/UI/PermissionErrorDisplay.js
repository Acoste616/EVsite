import React from 'react';
import { AlertCircle } from 'lucide-react';

const PermissionErrorDisplay = ({ message }) => (
    <div className="fixed inset-0 bg-gray-900/95 flex items-center justify-center z-[100] p-8 text-center">
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-8 max-w-2xl">
            <AlertCircle className="h-16 w-16 mx-auto text-red-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Błąd Konfiguracji Firebase</h2>
            <p className="text-red-200">{message}</p>
            <p className="text-gray-400 mt-4 text-sm">
                Wygląda na to, że Twoja baza danych Firestore ma nieprawidłowe reguły bezpieczeństwa. 
                Przejdź do panelu Firebase, wybierz bazę Firestore, przejdź do zakładki "Reguły" (Rules) 
                i wklej reguły podane w dokumentacji projektu.
            </p>
        </div>
    </div>
);

export default PermissionErrorDisplay;