import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { whatwedoinfos } from "@/utils/constants"

export default function WhatWeDo() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-amber-50 via-white to-orange-50 overflow-hidden comp"
    >
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="moroccan-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M50 0 L60 20 L80 20 L65 32 L70 52 L50 40 L30 52 L35 32 L20 20 L40 20 Z" fill="#D97706" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#moroccan-pattern)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
          }`}
        >
          <div className="inline-block relative">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              What We Do
            </h2>
            <div className="flex justify-center items-center gap-2 mt-4">
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-amber-600"></div>
              <div className="w-3 h-3 rotate-45 bg-amber-600"></div>
              <div className="w-24 h-0.5 bg-amber-600"></div>
              <div className="w-3 h-3 rotate-45 bg-amber-600"></div>
              <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-amber-600"></div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div
            className={`space-y-6 transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
          >
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed text-lg">
                Our goal is to have a lasting positive impact on Morocco and the world through the travel industry...
              </p>
              <p className="text-gray-700 leading-relaxed text-lg">
                We are committed to hiring the best local talent and collaborating with partners...
              </p>
              <Link href='#reviews' className="text-gray-800 font-semibold text-lg mt-8 hover:underline">
                Want to know more? Hear what our guests and partners have to say!
              </Link>
            </div>

            <div className="pt-4">
              <Link href="destinations" className="group relative px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <span className="relative z-10">Find a destination now !</span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </div>
          </div>

          <div
            className={`relative transition-all duration-1000 delay-500 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl transform rotate-3 group-hover:rotate-6 transition-transform duration-300"></div>
                <div className="relative overflow-hidden rounded-2xl shadow-2xl transform -rotate-2 group-hover:rotate-0 transition-transform duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=600&h=800&fit=crop"
                    alt="Happy travelers in Morocco"
                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>
              </div>

              <div className="hidden md:block relative group mt-12">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-amber-600 rounded-2xl transform -rotate-3 group-hover:-rotate-6 transition-transform duration-300"></div>
                <div className="relative overflow-hidden rounded-2xl shadow-2xl transform rotate-2 group-hover:rotate-0 transition-transform duration-300">
                  <img
                    src="/whatwedo.png"
                    alt="Local Moroccan guide"
                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 w-32 h-32 opacity-20">
              <svg viewBox="0 0 100 100" className="w-full h-full text-amber-600">
                <path d="M50 10 L60 30 L80 30 L65 45 L70 65 L50 50 L30 65 L35 45 L20 30 L40 30 Z" fill="currentColor" />
              </svg>
            </div>
          </div>
        </div>

        <div
          className={`mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-1000 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {whatwedoinfos.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="inline-block relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300 opacity-50"></div>
                <div className="relative">
                  <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    {stat.number}
                  </p>
                  <p className="text-gray-600 font-medium mt-2">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}