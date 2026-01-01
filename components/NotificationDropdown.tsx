import React from 'react';
import { Bell, X, CheckCircle, Trash2 } from 'lucide-react';

export interface Notification {
    id: string;
    message: string;
    timestamp: Date;
    read: boolean;
}

interface NotificationDropdownProps {
    notifications: Notification[];
    onClose: () => void;
    onMarkAsRead: () => void;
    onClearNotifications: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ notifications, onClose, onMarkAsRead, onClearNotifications }) => {
    return (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
            <div className="flex items-center justify-between p-4 border-b border-gray-50 bg-gray-50/50">
                <h3 className="font-bold text-[#111318] text-sm flex items-center gap-2">
                    <Bell size={14} className="text-primary" />
                    Notificações
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X size={14} />
                </button>
            </div>

            <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-xs font-medium">
                        Nenhuma nova notificação.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {notifications.map((notif) => (
                            <div key={notif.id} className="p-4 hover:bg-gray-50 transition-colors flex gap-3">
                                <div className="mt-1">
                                    <CheckCircle size={16} className="text-green-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-800 leading-relaxed">
                                        {notif.message}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-medium mt-1">
                                        {notif.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {notifications.length > 0 && (
                <div className="p-2 border-t border-gray-50 bg-gray-50/30 flex justify-between items-center px-4">
                    <button
                        onClick={onClearNotifications}
                        className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
                        title="Limpar todas"
                    >
                        <Trash2 size={12} />
                        Limpar
                    </button>
                    <button
                        onClick={onMarkAsRead}
                        className="text-[10px] font-bold text-primary hover:underline"
                    >
                        Marcar como lidas
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
