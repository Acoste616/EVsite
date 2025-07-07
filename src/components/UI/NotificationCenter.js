import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

const NotificationCenter = ({ notifications }) => (
    <div className="fixed top-24 right-4 z-[100] space-y-2">
        {notifications.map(n => (
            <div key={n.id} className={`flex items-center p-4 rounded-lg shadow-lg animate-fade-in-right ${n.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                {n.type === 'success' ? <CheckCircle className="mr-2" /> : <AlertCircle className="mr-2" />}
                {n.message}
            </div>
        ))}
    </div>
);

export default NotificationCenter;