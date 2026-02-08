import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const TourGallery = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gallery, setGallery] = useState([]);
  const [tourTitle, setTourTitle] = useState('');

  useEffect(() => {
    if (id) {
      fetchGallery();
    }
  }, [id]);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tours/getGallery?id=${id}`);
      const data = await response.json();
      
      if (data.success) {
        setGallery(data.gallery);
        setTourTitle(data.title);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la galerie:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  };

  const handleClose = () => {
    router.push(`/tour?id=${id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gallery.length]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
          <p className="text-white text-lg">Chargement de la galerie...</p>
        </div>
      </div>
    );
  }

  if (gallery.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-6">Aucune image dans la galerie</p>
          <button
            onClick={handleClose}
            className="px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors"
          >
            Retour au tour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-white">
            <h1 className="text-2xl font-bold">{tourTitle}</h1>
            <p className="text-sm text-gray-300 mt-1">
              Image {currentIndex + 1} / {gallery.length}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors group"
            aria-label="Fermer"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div className="relative w-full h-full flex items-center justify-center p-6 pt-24 pb-24">
        <img
          src={gallery[currentIndex]}
          alt={`${tourTitle} - Image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />
      </div>

      {/* Navigation Buttons */}
      {gallery.length > 1 && (
        <>
          {/* Left Button */}
          <button
            onClick={handlePrevious}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-black/50 hover:bg-black/70 rounded-full transition-all group z-10"
            aria-label="Image précédente"
          >
            <ChevronLeft className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
          </button>

          {/* Right Button */}
          <button
            onClick={handleNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-black/50 hover:bg-black/70 rounded-full transition-all group z-10"
            aria-label="Image suivante"
          >
            <ChevronRight className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
          </button>
        </>
      )}

      {/* Thumbnail Strip */}
      {gallery.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === currentIndex
                      ? 'border-amber-500 scale-110 shadow-lg'
                      : 'border-white/30 hover:border-white/60 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Miniature ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Navigation Hint */}
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 text-white/60 text-sm hidden md:block">
        Use arrows ← → to navigate • Esc for exit
      </div>
    </div>
  );
};

export default TourGallery;