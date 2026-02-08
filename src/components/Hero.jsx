import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Landing({ session, entreprise }) {
  return (
    <div className="relative w-full h-screen overflow-hidden comp">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source
          src="/hero.mp4"
          type="video/mp4"
        />
      </video>

      {/* Overlay with Moroccan Pattern */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/40 via-black/20 to-black/50"></div>

      {/* Hero Content */}
      <div className="relative z-10 flex items-center justify-center h-full px-6">
        <div className="text-center max-w-4xl mx-auto">
          {/* Decorative Line */}
          <div className="flex items-center justify-center mb-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
            <div className="mx-4 w-2 h-2 bg-amber-400 rounded-full"></div>
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight">
            Welcome to{' '}
            <span className="text-orange-400">
              {entreprise}
            </span>
          </h1>

          <p className="text-lg md:text-xl lg:text-2xl text-white/90 font-light leading-relaxed max-w-2xl mx-auto">
            Discover the authentic beauty of Morocco through carefully curated journeys
          </p>

          {!session &&
            <div className='w-full flex justify-center items-center mt-8'>
              <button onClick={() => window.location.href = 'register'} className='w-fit px-4 py-2 rounded-lg bg-gradient-to-bl from-amber-500 to-amber-600 text-white font-semibold shadow-2xl'>
                Create account
              </button>
            </div>
          }

          {/* Decorative Line Bottom */}
          <div className="flex items-center justify-center mt-12">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
}