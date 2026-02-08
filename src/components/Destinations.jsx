import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import { destinations } from '@/utils/constants';

const Destinations = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const scrollContainerRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  const scrollToSlide = (index) => {
    if (scrollContainerRef.current) {
      const slideWidth = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollTo({
        left: slideWidth * index,
        behavior: 'smooth'
      });
      setCurrentSlide(index);
    }
  };

  const nextSlide = () => {
    const newIndex = (currentSlide + 1) % destinations.length;
    scrollToSlide(newIndex);
  };

  const prevSlide = () => {
    const newIndex = currentSlide === 0 ? destinations.length - 1 : currentSlide - 1;
    scrollToSlide(newIndex);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    const slideWidth = scrollContainerRef.current.offsetWidth;
    const newIndex = Math.round(scrollContainerRef.current.scrollLeft / slideWidth);
    scrollToSlide(newIndex);
  };

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].pageX);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    const x = e.touches[0].pageX;
    const walk = (startX - x) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft + walk;
  };

  const handleTouchEnd = () => {
    const slideWidth = scrollContainerRef.current.offsetWidth;
    const newIndex = Math.round(scrollContainerRef.current.scrollLeft / slideWidth);
    scrollToSlide(newIndex);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current && !isDragging) {
        const slideWidth = scrollContainerRef.current.offsetWidth;
        const newIndex = Math.round(scrollContainerRef.current.scrollLeft / slideWidth);
        setCurrentSlide(newIndex);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [isDragging]);

  return (
    <div
      ref={sectionRef}
      className={`w-full bg-gradient-to-b from-white to-amber-50/30 py-16 comp transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 px-4">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
            <MapPin className="w-5 h-5 text-red-600" />
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Destinations
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the beauty and diversity of Morocco through our carefully selected destinations.
          </p>
        </div>

        <div className="relative">
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110 border border-amber-200"
          >
            <ChevronLeft className="w-6 h-6 text-red-600" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110 border border-amber-200"
          >
            <ChevronRight className="w-6 h-6 text-red-600" />
          </button>

          <div
            ref={scrollContainerRef}
            className="overflow-x-hidden cursor-grab active:cursor-grabbing scroll-smooth"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex">
              {destinations.map((destination) => (
                <div key={destination.id} className="min-w-full px-4 md:px-8">
                  <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-amber-100 group">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-amber-500 to-green-600"></div>
                    <div className="grid md:grid-cols-2 gap-0">
                      <div className="relative h-64 md:h-96 overflow-hidden">
                        <img
                          src={destination.image}
                          alt={destination.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          draggable="false"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        <div className="absolute top-4 right-4">
                          <div className="w-16 h-16 border-t-2 border-r-2 border-amber-400 opacity-60"></div>
                        </div>
                      </div>
                      <div className="p-8 md:p-12 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-1 h-12 bg-gradient-to-b from-red-600 to-amber-500"></div>
                          <div>
                            <h3 className="text-3xl md:text-4xl font-bold text-gray-900">
                              {destination.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <MapPin className="w-4 h-4 text-red-600" />
                              <span className="text-sm text-gray-500">Maroc</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600 text-lg leading-relaxed mb-8">
                          {destination.description}
                        </p>
                        <Link href={`destinations?key=${destination.name}`} className="self-start px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 border border-red-700">
                          Découvrir
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {destinations.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  currentSlide === index
                    ? 'w-8 h-2 bg-gradient-to-r from-red-600 to-amber-500'
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Destinations;