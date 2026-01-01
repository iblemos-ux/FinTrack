import React, { useState } from 'react';
import { Settings, Bell, Receipt, LogOut } from 'lucide-react';
import SettingsModal from './SettingsModal';
import NotificationDropdown from './NotificationDropdown';
import Avatar from './Avatar';

interface NavbarProps {
    currentPage: 'dashboard' | 'lancamento' | 'relatorios';
    onNavigate: (page: 'dashboard' | 'lancamento' | 'relatorios') => void;
    onResetEdit?: () => void;
    notifications: any[];
    onMarkAsRead: () => void;
    onClearNotifications: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, onResetEdit, notifications, onMarkAsRead, onClearNotifications }) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <>
            <header className="bg-white border-b border-[#f0f1f4] sticky top-0 z-50">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                <Receipt size={20} />
                            </div>
                            <h2 className="text-[#111318] text-lg font-bold tracking-tight">FinTrack</h2>
                        </div>

                        <nav className="hidden md:flex flex-1 justify-center gap-8">
                            <button
                                onClick={() => {
                                    if (onResetEdit) onResetEdit();
                                    onNavigate('lancamento');
                                }}
                                className={`text-sm font-bold transition-colors ${currentPage === 'lancamento' ? 'text-primary' : 'text-[#64748b] hover:text-primary'}`}
                            >
                                Lançamentos
                            </button>
                            <button
                                onClick={() => onNavigate('relatorios')}
                                className={`text-sm font-bold transition-colors ${currentPage === 'relatorios' ? 'text-primary' : 'text-[#64748b] hover:text-primary'}`}
                            >
                                Relatórios
                            </button>
                            <button
                                onClick={() => onNavigate('dashboard')}
                                className={`text-sm font-bold transition-colors ${currentPage === 'dashboard' ? 'text-primary' : 'text-[#64748b] hover:text-primary'}`}
                            >
                                Dashboard
                            </button>
                        </nav>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <button
                                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                    className="p-2 rounded-xl bg-[#f0f1f4] text-[#111318] hover:bg-gray-200 transition-colors relative"
                                >
                                    <Bell size={20} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 size-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                                    )}
                                </button>
                                {isNotificationsOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                                        <NotificationDropdown
                                            notifications={notifications}
                                            onClose={() => setIsNotificationsOpen(false)}
                                            onMarkAsRead={onMarkAsRead}
                                            onClearNotifications={onClearNotifications}
                                        />
                                    </>
                                )}
                            </div>
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="p-2 rounded-xl bg-[#f0f1f4] text-[#111318] hover:bg-gray-200 transition-colors"
                                title="Configurações (Alterar Fotos)"
                            >
                                <Settings size={20} />
                            </button>
                            <button
                                onClick={async () => {
                                    const { supabase } = await import('../lib/supabaseClient');
                                    await supabase.auth.signOut();
                                }}
                                className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                title="Sair"
                            >
                                <LogOut size={20} />
                            </button>
                            <div className="ml-2 w-10 h-10">
                                <Avatar user="user" size="100%" className="shadow-sm border border-[#f0f1f4]" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </>
    );
};

export default Navbar;
