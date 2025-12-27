import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { travelTypes } from "@/utils/constants";

export default function TravelSlider({ entreprise }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const currentTravel = travelTypes[currentIndex];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % travelTypes.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + travelTypes.length) % travelTypes.length);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart(e.clientX);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setDragStart(e.touches[0].clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setDragOffset(e.clientX - dragStart);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    setDragOffset(e.touches[0].clientX - dragStart);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    
    if (dragOffset > 100) {
      prevSlide();
    } else if (dragOffset < -100) {
      nextSlide();
    }
    
    setIsDragging(false);
    setDragOffset(0);
    setDragStart(0);
  };

  return (
    <section id="styles" className="min-h-screen bg-gradient-to-br from-amber-600/20 via-amber-500/20 to-orange-300 py-12 px-4 sm:py-16 sm:px-6 lg:px-8 comp">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-amber-700 via-orange-600 to-red-700 bg-clip-text text-transparent">
            {entreprise}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez nos différents types de voyages
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Text Content */}
          <div className="order-2 lg:order-1 space-y-6">
            <div className="inline-block">
              <div 
                className="h-1 w-16 rounded-full mb-4"
                style={{ backgroundColor: currentTravel.color }}
              />
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 transition-all duration-500">
              {currentTravel.title}
            </h2>
            
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed transition-all duration-500">
              {currentTravel.description}
            </p>

            {/* Navigation Controls */}
            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={prevSlide}
                className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-gray-100"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              
              <div className="flex gap-2">
                {travelTypes.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className="transition-all duration-300"
                    aria-label={`Go to slide ${index + 1}`}
                  >
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentIndex ? 'w-8' : 'w-2 opacity-40'
                      }`}
                      style={{
                        backgroundColor: index === currentIndex ? currentTravel.color : '#9CA3AF'
                      }}
                    />
                  </button>
                ))}
              </div>
              
              <button
                onClick={nextSlide}
                className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-gray-100"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Stacked Cards Slider */}
          <div 
            className="order-1 lg:order-2 relative h-[400px] sm:h-[500px] lg:h-[600px] cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleDragEnd}
          >
            {/* Decorative Moroccan Pattern */}
            <div className="absolute -top-8 -right-8 w-24 h-24 opacity-10 pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-full h-full" fill="currentColor" style={{ color: currentTravel.color }}>
                <path d="M50 10 L60 30 L80 30 L65 45 L70 65 L50 50 L30 65 L35 45 L20 30 L40 30 Z" />
              </svg>
            </div>

            {travelTypes.map((travel, index) => {
              const offset = index - currentIndex;
              const isActive = index === currentIndex;
              
              return (
                <div
                  key={travel.id}
                  className="absolute inset-0 transition-all duration-500 ease-out"
                  style={{
                    transform: `
                      translateX(${offset * 20 + (isActive ? dragOffset * 0.5 : 0)}px)
                      translateY(${Math.abs(offset) * 15}px)
                      scale(${1 - Math.abs(offset) * 0.08})
                      rotateY(${offset * -8}deg)
                    `,
                    zIndex: travelTypes.length - Math.abs(offset),
                    opacity: Math.abs(offset) > 2 ? 0 : 1 - Math.abs(offset) * 0.3,
                    pointerEvents: isActive ? 'auto' : 'none',
                    filter: `brightness(${1 - Math.abs(offset) * 0.15})`
                  }}
                >
                  <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
                    {/* Image */}
                    <img
                      src={travel.image}
                      alt={travel.title}
                      className="w-full h-full object-cover"
                      draggable="false"
                    />
                    
                    {/* Gradient Overlay */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
                    />
                    
                    {/* Moroccan Border Pattern */}
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: `linear-gradient(to right, ${travel.color}20 1px, transparent 1px),
                                   linear-gradient(to bottom, ${travel.color}20 1px, transparent 1px)`,
                        backgroundSize: '20px 20px',
                        opacity: 0.3
                      }}
                    />
                    
                    {/* Top Border Accent */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ backgroundColor: travel.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Navigation Hint */}
        <div className="text-center mt-8 lg:hidden">
          <p className="text-sm text-gray-500">
            Glissez pour naviguer entre les types de voyages
          </p>
        </div>
      </div>
    </section>
  );
}