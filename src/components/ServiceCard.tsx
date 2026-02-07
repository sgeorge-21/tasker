import React from 'react';

interface ServiceCardProps {
  name: string;
  icon: string;
  onClick: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ name, icon, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col items-center gap-3 hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 border border-gray-100 w-full"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-coral-50 p-2 sm:p-3">
        <img src={icon} alt={name} className="w-full h-full object-contain" />
      </div>
      <h3 className="font-semibold text-gray-800 text-sm sm:text-lg text-center">{name}</h3>
      {/* price intentionally removed from public listing per requirements */}
    </button>
  );
};
