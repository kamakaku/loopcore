import React, { useRef } from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
  onChange?: (file: File) => void;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-24 h-24'
};

export default function Avatar({ 
  src, 
  alt, 
  size = 'md', 
  editable = false,
  onChange 
}: AvatarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (editable && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onChange) {
      onChange(file);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div 
      className={`relative rounded-full overflow-hidden bg-gray-100 ${sizeClasses[size]} ${
        editable ? 'cursor-pointer group' : ''
      }`}
      onClick={handleClick}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Wenn das Bild nicht geladen werden kann, zeigen wir die Initialen
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement?.classList.add('fallback-active');
          }}
        />
      ) : null}
      <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 ${src ? 'hidden' : ''}`}>
        <span className={`font-medium ${
          size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-xl'
        } text-gray-700`}>
          {getInitials(alt)}
        </span>
      </div>

      {editable && (
        <>
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  );
}