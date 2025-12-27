'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ReviewsMarquee = ({ entreprise }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const [duplicatedReviews, setDuplicatedReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('/api/general/getReviews');
        if (!res.ok) throw new Error(`Erreur serveur: ${res.status}`);
        const data = await res.json();
        const validReviews = Array.isArray(data) ? data : [];
        setReviews(validReviews);
        setDuplicatedReviews([...validReviews, ...validReviews]);
        setError('');
      } catch (err) {
        console.error('Erreur lors du chargement des avis:', err);
        setError("Impossible de charger les avis pour le moment.");
      }
    };
    fetchReviews();
  }, []);

  const StarIcon = ({ filled }) => (
    <svg
      className={`w-4 h-4 ${filled ? 'text-[#D4AF37]' : 'text-gray-300'}`}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );

  return (
    <section id="reviews" className="relative w-full bg-gradient-to-b from-[#F4EFEA] via-white to-[#F4EFEA] py-20 overflow-hidden comp">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C0392B' fill-opacity='1'%3E%3Cpath d='M30 0l5 10h10l-8 8 3 11-10-6-10 6 3-11-8-8h10z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 mb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#C0392B] mb-3 font-serif">
            Avis de nos Voyageurs
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#C0392B] via-[#D4AF37] to-[#C0392B] mx-auto mb-4 rounded-full" />
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez les expériences authentiques de ceux qui ont exploré le Maroc avec {entreprise}
          </p>
        </motion.div>
      </div>

      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <motion.div
          className="flex gap-6 px-6"
          animate={{
            x: [0, -2400],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: isPaused ? 60 : 40,
              ease: "linear",
            },
          }}
        >
          {duplicatedReviews.map((review, index) => (
            <motion.div
              key={`${review.id}-${index}`}
              className="flex-shrink-0 w-[380px]"
              whileHover={{
                scale: 1.03,
                y: -8,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
            >
              <div className="relative h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C0392B] via-[#D4AF37] to-[#C0392B]" />

                <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                  <svg viewBox="0 0 100 100" className="text-[#C0392B]">
                    <path
                      d="M0,0 L100,0 L100,100 Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>

                <div className="relative p-6 flex flex-col h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#C0392B] rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-[#C0392B] text-lg mb-1">
                        {review.name}
                      </h3>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon key={i} filled={i < review.rating} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 mb-4">
                    <p className="text-gray-700 leading-relaxed italic relative">
                      <span className="text-3xl text-[#D4AF37] opacity-30 absolute -left-1 -top-2">"</span>
                      <span className="relative z-10">{review.text}</span>
                      <span className="text-3xl text-[#D4AF37] opacity-30 absolute -right-1 -bottom-4">"</span>
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(review.date).toLocaleDateString('FR-fr')}
                    </p>
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#F4EFEA] to-transparent pointer-events-none z-10" />
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#F4EFEA] to-transparent pointer-events-none z-10" />
      </div>
    </section>
  );
};

export default ReviewsMarquee;