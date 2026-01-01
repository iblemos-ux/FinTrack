
import React, { useEffect, useState } from 'react';

interface AvatarProps {
    user: 'italo' | 'edna' | 'user';
    size?: number | string; // pixels or tailwind class strings if you prefer, but number is safer for style
    className?: string; // allow tailwind classes
    showBorder?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ user, size = '100%', className = '', showBorder = false }) => {
    const [imageSrc, setImageSrc] = useState<string>('');

    useEffect(() => {
        // Attempt to load from localStorage
        const storedImage = localStorage.getItem(`avatar_${user}`);
        if (storedImage) {
            setImageSrc(storedImage);
        } else {
            // Fallback defaults
            if (user === 'italo') setImageSrc('https://picsum.photos/seed/italo/200');
            else if (user === 'edna') setImageSrc('https://picsum.photos/seed/edna/200');
            else setImageSrc('https://picsum.photos/seed/user/200');
        }

        // Listen to custom event for updates
        const handleAvatarUpdate = (e: any) => {
            if (e.detail?.user === user) {
                const newImage = localStorage.getItem(`avatar_${user}`);
                if (newImage) setImageSrc(newImage);
            }
        };

        window.addEventListener('avatar-update', handleAvatarUpdate as any);
        return () => window.removeEventListener('avatar-update', handleAvatarUpdate as any);

    }, [user]);

    // If size is a number, treat as px. If string, pass through (though simpler to just rely on parent container or className)
    // We'll use a div with background image for consistent centering/covering like existing code

    return (
        <div
            className={`bg-cover bg-center rounded-full flex-shrink-0 ${showBorder ? 'border border-[#f0f1f4]' : ''} ${className}`}
            style={{
                backgroundImage: `url(${imageSrc})`,
                width: size,
                height: size
            }}
        />
    );
};

export default Avatar;
