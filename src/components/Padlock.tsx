import React from 'react';

interface PadlockProps {
  unlocked: boolean;
}

export const Padlock: React.FC<PadlockProps> = ({ unlocked }) => {
  return (
    <div className="relative w-24 h-32 mb-4">
      {/* Shackle */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-16 h-12 border-8 rounded-t-full transition-all duration-500 ${
        unlocked ? 'border-green-400 rotate-45 translate-x-6 -translate-y-2' : 'border-gray-600'
      }`} style={{ borderBottom: 'none' }} />

      {/* Lock body */}
      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-24 rounded-lg shadow-lg transition-colors duration-500 ${
        unlocked ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-gray-600 to-gray-800'
      }`}>
        {/* Keyhole */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className={`w-3 h-3 rounded-full transition-colors duration-500 ${
            unlocked ? 'bg-green-200' : 'bg-gray-900'
          }`} />
          <div className={`w-2 h-4 mx-auto transition-colors duration-500 ${
            unlocked ? 'bg-green-200' : 'bg-gray-900'
          }`} style={{ clipPath: 'polygon(0 0, 100% 0, 70% 100%, 30% 100%)' }} />
        </div>

        {/* Shine effect */}
        <div className="absolute top-2 right-2 w-2 h-4 bg-white opacity-30 rounded-full blur-sm" />
      </div>
    </div>
  );
};
