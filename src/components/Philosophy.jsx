import { motion, useAnimation } from 'framer-motion';
import { useEffect, useRef } from 'react';

export default function TravelPhilosophy() {
  const controls = useAnimation();
  const sectionRef = useRef(null);

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          controls.start('visible');
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [controls]);

  return (
    <section ref={sectionRef} className="relative bg-white py-24 overflow-hidden comp">
      {/* Motif marocain subtil en arrière-plan */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 border-l-4 border-t-4 border-amber-600"></div>
        <div className="absolute top-0 right-0 w-64 h-64 border-r-4 border-t-4 border-red-700"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 border-l-4 border-b-4 border-emerald-700"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 border-r-4 border-b-4 border-amber-600"></div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={controls}
        className="max-w-7xl mx-auto px-6 lg:px-8"
      >
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Colonne de texte */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Accent décoratif */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-0.5 bg-gradient-to-r from-amber-600 to-red-700"></div>
              <div className="w-3 h-3 bg-amber-600 transform rotate-45"></div>
            </div>
            <h2 className="text-5xl font-light text-gray-900 mb-8 tracking-tight">
              Travel <span className="font-semibold text-amber-700">Philosophy</span>
            </h2>
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p className="text-lg">
                <span className="font-semibold text-amber-800">Experience Morocco</span> is in the business of changing perspectives.
                We create experiences that open minds and invite guests to build a lasting connection with our home. In this way travel can be
                more than tourism, it can be a unifying experience that makes the global feel a bit more local.
              </p>
              <p className="text-lg">
                As a leading provider of curated and authentic travels across Morocco and with a diverse team of travel professionals, we have
                the experience and know-how to design memorable trips custom-built around your objectives. We understand that the difference
                between a good trip and a great trip is attention to detail, so we work to give all our travelers the highest-level of
                personalized service and flawless execution.
              </p>
            </div>
            {/* Élément décoratif bas */}
            <div className="flex items-center gap-3 mt-12">
              <div className="w-2 h-2 bg-red-700 rounded-full"></div>
              <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
              <div className="w-2 h-2 bg-emerald-700 rounded-full"></div>
            </div>
          </motion.div>

          {/* Colonne image */}
          <motion.div variants={itemVariants} className="relative group">
            {/* Bordure décorative */}
            <div className="absolute -inset-4 bg-gradient-to-br from-amber-100 via-red-50 to-emerald-50 rounded-lg transform rotate-3 group-hover:rotate-6 transition-transform duration-500"></div>

            {/* Container image avec effet */}
            <div className="relative overflow-hidden rounded-lg shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 to-transparent z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800&h=1000&fit=crop"
                alt="Moroccan landscape"
                className="w-full h-[600px] object-cover transform group-hover:scale-105 transition-transform duration-700"
              />

              {/* Accent décoratif sur l'image */}
              <div className="absolute top-6 right-6 z-20">
                <div className="w-16 h-16 border-4 border-white/80 transform rotate-45"></div>
              </div>
              <div className="absolute bottom-6 left-6 z-20">
                <div className="flex gap-2">
                  <div className="w-3 h-12 bg-amber-600/80"></div>
                  <div className="w-3 h-12 bg-red-700/80"></div>
                  <div className="w-3 h-12 bg-emerald-700/80"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}