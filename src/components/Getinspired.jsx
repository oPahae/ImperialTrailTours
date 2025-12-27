import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { inspirations } from "@/utils/constants";

export default function GetInspired({ entreprise }) {
  const [activeCard, setActiveCard] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 comp">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-orange-100 mb-6">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-600">Discover Your Perfect Journey</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Get Inspired
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Find your perfect Moroccan adventure with {entreprise}
          </p>
        </div>

        {/* Decorative Pattern */}
        <div className="flex justify-center my-8">
          <svg width="120" height="8" viewBox="0 0 120 8" className="opacity-30">
            <pattern id="moroccan-pattern" x="0" y="0" width="20" height="8" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="1.5" fill="#f97316"/>
              <circle cx="16" cy="4" r="1.5" fill="#f97316"/>
            </pattern>
            <rect width="120" height="8" fill="url(#moroccan-pattern)"/>
          </svg>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inspirations.map((item, index) => (
            <div
              key={item.id}
              className="group relative"
              onMouseEnter={() => setActiveCard(item.id)}
              onMouseLeave={() => setActiveCard(null)}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <div className={`
                relative overflow-hidden rounded-2xl bg-white shadow-lg
                transition-all duration-500 ease-out
                ${activeCard === item.id ? 'scale-105 shadow-2xl' : 'hover:scale-102'}
              `}>
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className={`
                      w-full h-full object-cover
                      transition-transform duration-700 ease-out
                      ${activeCard === item.id ? 'scale-110' : 'group-hover:scale-105'}
                    `}
                  />
                  
                  {/* Gradient Overlay */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-t ${item.color} opacity-20
                    transition-opacity duration-500
                    ${activeCard === item.id ? 'opacity-30' : ''}
                  `} />
                  
                  {/* Decorative Corner */}
                  <div className="absolute top-0 right-0 w-16 h-16">
                    <svg viewBox="0 0 100 100" className="w-full h-full opacity-60">
                      <polygon points="0,0 100,0 100,100" fill="white"/>
                      <path d="M20,20 L80,20 L80,80 Z" fill="none" stroke="#f97316" strokeWidth="2"/>
                    </svg>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    {item.title}
                    <span className={`
                      inline-block w-2 h-2 rounded-full bg-gradient-to-r ${item.color}
                      transition-transform duration-500
                      ${activeCard === item.id ? 'scale-150' : ''}
                    `} />
                  </h3>
                  
                  <p className={`
                    text-gray-600 leading-relaxed
                    transition-all duration-500
                    ${activeCard === item.id ? 'text-gray-900' : ''}
                  `}>
                    {item.description}
                  </p>

                  {/* Bottom Accent */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className={`
                      h-1 rounded-full bg-gradient-to-r ${item.color}
                      transition-all duration-500 ease-out
                      ${activeCard === item.id ? 'w-full' : 'w-12 group-hover:w-20'}
                    `} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}