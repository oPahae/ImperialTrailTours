import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TeamSlider = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const scrollRef = useRef(null);
  
  const teamMembers = [
    {
      id: 1,
      name: "Amina Bennani",
      role: "Directrice Générale",
      description: "Passionnée par l'hospitalité marocaine, Amina orchestre chaque voyage comme une symphonie de découvertes authentiques.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop"
    },
    {
      id: 2,
      name: "Youssef Alami",
      role: "Expert Circuits Sahara",
      description: "Guide chevronné du désert, Youssef transforme chaque dune en une histoire millénaire à partager sous les étoiles.",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop"
    },
    {
      id: 3,
      name: "Leila Fassi",
      role: "Responsable Relations Clients",
      description: "Avec son sourire chaleureux et son attention aux détails, Leila veille à ce que chaque moment soit mémorable.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop"
    },
    {
      id: 4,
      name: "Karim Idrissi",
      role: "Chef de Projet Événementiel",
      description: "Architecte d'expériences uniques, Karim conçoit des voyages sur mesure qui dépassent toutes les attentes.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop"
    },
    {
      id: 5,
      name: "Sofia Tazi",
      role: "Coordinatrice Culturelle",
      description: "Gardienne des traditions, Sofia tisse des liens authentiques entre nos voyageurs et l'âme profonde du Maroc.",
      image: "https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?w=400&h=500&fit=crop"
    }
  ];

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative w-full py-20 bg-gradient-to-br from-[#F4EFEA] via-white to-[#F4EFEA] overflow-hidden comp">
      {/* Motifs marocains subtils en arrière-plan */}
      <div className="absolute inset-0 opacity-[0.08]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C0392B' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M30 30l15-15-15-15-15 15zM30 30l15 15-15 15-15-15z'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px'
      }}></div>

      {/* En-tête */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-16 px-4"
      >
        <div className="inline-block mb-4">
          <motion.div 
            className="w-16 h-1 bg-gradient-to-r from-[#C0392B] via-[#D4AF37] to-[#C0392B] mx-auto rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 64 }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
        <h2 className="text-5xl font-bold text-amber-600 mb-4 tracking-tight">Notre Équipe</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Des passionnés dévoués à créer des expériences inoubliables à travers tout le Maroc
        </p>
      </motion.div>

      {/* Slider Container */}
      <div className="relative max-w-7xl mx-auto px-4">
        {/* Bouton gauche */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-[#C0392B] hover:bg-[#C0392B] hover:text-white transition-all duration-300 hover:scale-110 border border-[#D4AF37]/20"
          aria-label="Précédent"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Bouton droit */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-[#C0392B] hover:bg-[#C0392B] hover:text-white transition-all duration-300 hover:scale-110 border border-[#D4AF37]/20"
          aria-label="Suivant"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Cartes défilantes */}
        <div
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth px-8 py-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 50, rotateY: -15 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className="flex-shrink-0 w-80 group"
              style={{
                transform: index % 2 === 0 ? 'translateY(-12px)' : 'translateY(12px)'
              }}
            >
              <div
                className="relative h-[480px] rounded-3xl overflow-hidden cursor-pointer"
                onMouseEnter={() => setHoveredCard(member.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Image de fond */}
                <div className="absolute inset-0">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-600/80 via-amber-600/25 to-transparent"></div>
                </div>

                {/* Bordure dorée animée */}
                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: hoveredCard === member.id ? 1 : 0,
                    boxShadow: hoveredCard === member.id 
                      ? '0 0 0 2px rgba(212, 175, 55, 0.6)' 
                      : '0 0 0 0px rgba(212, 175, 55, 0)'
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Motif marocain coin supérieur */}
                <div className="absolute top-4 right-4 w-16 h-16 opacity-20">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-[#D4AF37]">
                    <path fill="currentColor" d="M50,10 L60,40 L90,40 L67,57 L77,87 L50,70 L23,87 L33,57 L10,40 L40,40 Z"/>
                  </svg>
                </div>

                {/* Contenu de la carte */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  {/* Nom et rôle - toujours visibles */}
                  <motion.div
                    initial={{ y: 0 }}
                    animate={{ y: hoveredCard === member.id ? -20 : 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    <h3 className="text-2xl font-bold text-white mb-2 tracking-wide">
                      {member.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-px flex-grow bg-gradient-to-r from-[#D4AF37] to-transparent"></div>
                      <p className="text-white text-sm font-medium uppercase tracking-wider">
                        {member.role}
                      </p>
                    </div>
                  </motion.div>

                  {/* Description - apparaît au hover */}
                  <AnimatePresence>
                    {hoveredCard === member.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: 10, height: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-xl">
                          <p className="text-white/95 text-sm leading-relaxed italic">
                            "{member.description}"
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Effet de brillance au hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-white/0"
                  initial={{ x: '-100%', opacity: 0 }}
                  animate={{ 
                    x: hoveredCard === member.id ? '100%' : '-100%',
                    opacity: hoveredCard === member.id ? 1 : 0
                  }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />

                {/* Shadow effet */}
                <div className="absolute inset-0 rounded-3xl shadow-2xl ring-1 ring-black/5 group-hover:shadow-[0_20px_60px_-15px_rgba(192,57,43,0.3)] transition-shadow duration-500"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Indicateurs de scroll (optionnel) */}
      <div className="flex justify-center gap-2 mt-12">
        {teamMembers.map((_, index) => (
          <div
            key={index}
            className="w-2 h-2 rounded-full bg-[#D4AF37]/30 hover:bg-[#D4AF37] transition-colors duration-300 cursor-pointer"
          />
        ))}
      </div>

      {/* CSS pour cacher la scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default TeamSlider;