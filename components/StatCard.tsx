import React from 'react';
import { LucideIcon } from 'lucide-react';
import Avatar from './Avatar';

interface StatCardProps {
    icon: LucideIcon;
    iconColorClass: string;
    iconBgClass: string;
    title: string;
    value: string;
    subtitle?: string;
    progress?: {
        value: number;
        colorClass: string;
        textClass: string;
    };
    image?: string;
    user?: 'italo' | 'edna';
}

const StatCard: React.FC<StatCardProps> = ({
    icon: Icon,
    iconColorClass,
    iconBgClass,
    title,
    value,
    subtitle,
    progress,
    image,
    user
}) => {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0f1f4] relative overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
                {user ? (
                    <div className="size-8">
                        <Avatar user={user} size="100%" className="shadow-md border-2 border-white" />
                    </div>
                ) : image ? (
                    <div className="size-8 rounded-full bg-cover bg-center border-2 border-white shadow-md" style={{ backgroundImage: `url(${image})` }} />
                ) : (
                    <div className={`p-2 rounded-lg ${iconBgClass} ${iconColorClass}`}>
                        <Icon size={20} />
                    </div>
                )}
                <p className="text-[#64748b] text-xs font-bold uppercase tracking-wider">{title}</p>
            </div>

            <p className="text-[#111318] text-2xl font-black">{value}</p>

            {subtitle && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 mt-2">
                    <span>{subtitle}</span>
                </div>
            )}

            {progress && (
                <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${progress.colorClass}`} style={{ width: `${progress.value}%` }}></div>
                    </div>
                    <span className={`text-[10px] font-black ${progress.textClass}`}>{progress.value}%</span>
                </div>
            )}
        </div>
    );
};

export default StatCard;
