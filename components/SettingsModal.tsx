
import React, { useRef, useState, useEffect } from 'react';
import { X, Upload, Save, Check } from 'lucide-react';
import Avatar from './Avatar';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const [italoPreview, setItaloPreview] = useState<string | null>(null);
    const [ednaPreview, setEdnaPreview] = useState<string | null>(null);
    const [userPreview, setUserPreview] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState('');

    // Refs for file inputs
    const italoInputRef = useRef<HTMLInputElement>(null);
    const ednaInputRef = useRef<HTMLInputElement>(null);
    const userInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            // Load current images on open
            setItaloPreview(localStorage.getItem('avatar_italo') || null);
            setEdnaPreview(localStorage.getItem('avatar_edna') || null);
            setUserPreview(localStorage.getItem('avatar_user') || null);
            setSuccessMsg('');
        }
    }, [isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, user: 'italo' | 'edna' | 'user') => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB limit check
                alert('A imagem é muito grande! Tente uma menor que 1MB para não encher a memória do navegador.');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                if (user === 'italo') setItaloPreview(base64String);
                else if (user === 'edna') setEdnaPreview(base64String);
                else setUserPreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        try {
            if (italoPreview) localStorage.setItem('avatar_italo', italoPreview);
            if (ednaPreview) localStorage.setItem('avatar_edna', ednaPreview);
            if (userPreview) localStorage.setItem('avatar_user', userPreview);

            // Dispatch events to update Avatars instantly
            if (italoPreview) window.dispatchEvent(new CustomEvent('avatar-update', { detail: { user: 'italo' } }));
            if (ednaPreview) window.dispatchEvent(new CustomEvent('avatar-update', { detail: { user: 'edna' } }));
            if (userPreview) window.dispatchEvent(new CustomEvent('avatar-update', { detail: { user: 'user' } }));

            setSuccessMsg('Alterações salvas com sucesso!');
            setTimeout(() => {
                setSuccessMsg('');
                onClose();
            }, 1500);
        } catch (error: any) {
            console.error("Erro ao salvar avatar:", error);
            if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
                alert('Erro: Espaço insuficiente! A imagem é muito pesada para salvar no navegador. Tente uma imagem menor (KB).');
            } else {
                alert('Erro ao salvar imagem. Tente novamente.');
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                <div className="flex justify-between items-center p-6 border-b border-[#f0f1f4]">
                    <h2 className="text-xl font-black text-[#111318]">Configurações</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    <div className="text-center">
                        <p className="text-sm text-gray-500 font-medium mb-6">Personalize as fotos de perfil</p>
                    </div>

                    {/* Italo Upload */}
                    <div className="flex items-center gap-6">
                        <div className="relative group cursor-pointer" onClick={() => italoInputRef.current?.click()}>
                            <div className="size-20 rounded-full overflow-hidden border-4 border-gray-100 group-hover:border-primary transition-colors">
                                {italoPreview ?
                                    <img src={italoPreview} className="w-full h-full object-cover" alt="Preview Italo" /> :
                                    <Avatar user="italo" size="100%" />
                                }
                            </div>
                            <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload className="text-white" size={24} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[#111318]">Italo</h3>
                            <input type="file" ref={italoInputRef} onChange={(e) => handleFileChange(e, 'italo')} accept="image/*" className="hidden" />
                            <button onClick={() => italoInputRef.current?.click()} className="text-sm font-bold text-primary hover:underline">Alterar foto</button>
                        </div>
                    </div>

                    {/* Edna Upload */}
                    <div className="flex items-center gap-6">
                        <div className="relative group cursor-pointer" onClick={() => ednaInputRef.current?.click()}>
                            <div className="size-20 rounded-full overflow-hidden border-4 border-gray-100 group-hover:border-purple-500 transition-colors">
                                {ednaPreview ?
                                    <img src={ednaPreview} className="w-full h-full object-cover" alt="Preview Edna" /> :
                                    <Avatar user="edna" size="100%" />
                                }
                            </div>
                            <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload className="text-white" size={24} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[#111318]">Edna</h3>
                            <input type="file" ref={ednaInputRef} onChange={(e) => handleFileChange(e, 'edna')} accept="image/*" className="hidden" />
                            <button onClick={() => ednaInputRef.current?.click()} className="text-sm font-bold text-primary hover:underline">Alterar foto</button>
                        </div>
                    </div>

                    {/* General (User) Upload */}
                    <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
                        <div className="relative group cursor-pointer" onClick={() => userInputRef.current?.click()}>
                            <div className="size-20 rounded-full overflow-hidden border-4 border-gray-100 group-hover:border-gray-800 transition-colors">
                                {userPreview ?
                                    <img src={userPreview} className="w-full h-full object-cover" alt="Preview Geral" /> :
                                    <Avatar user="user" size="100%" />
                                }
                            </div>
                            <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload className="text-white" size={24} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[#111318]">Foto Geral (Menu)</h3>
                            <input type="file" ref={userInputRef} onChange={(e) => handleFileChange(e, 'user')} accept="image/*" className="hidden" />
                            <button onClick={() => userInputRef.current?.click()} className="text-sm font-bold text-primary hover:underline">Alterar foto</button>
                        </div>
                    </div>

                    {successMsg && (
                        <div className="p-3 bg-green-50 text-green-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2 animate-in fade-in">
                            <Check size={18} /> {successMsg}
                        </div>
                    )}
                </div>

                <div className="p-6 bg-gray-50 border-t border-[#f0f1f4] flex justify-end">
                    <button onClick={handleSave} className="h-12 px-8 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
                        <Save size={18} /> Salvar Alterações
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SettingsModal;
