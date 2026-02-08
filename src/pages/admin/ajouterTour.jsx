import { useEffect, useState } from 'react';
import { Plus, Trash2, Save, Upload, MapPin, Calendar, Users, Star, Image as ImageIcon } from 'lucide-react';
import { types } from '@/utils/constants';
import { verifyAuth } from "@/middlewares/adminAuth";

const AddTourPage = () => {
  const [error, setError] = useState("");
  const [tourData, setTourData] = useState({
    title: '',
    description: '',
    type: types[0],
    days: 1,
    minSpots: 2,
    maxSpots: null,
    daily: false,
    dailyStartDate: '',
    dailyPrice: 0,
    mainImage: null,
    gallery: [],
    places: [],
    program: [
      {
        day: 1,
        title: '',
        description: '',
        places: [],
        included: []
      }
    ],
    highlights: [],
    availableDates: []
  });

  const handleInputChange = (field, value) => {
    setTourData(prev => ({ ...prev, [field]: value }));
  };

  const handleMainImageUpload = (e) => {
    const file = e.target.files[0];
    if (file.size > 1048576) {
      alert("Img very big");
      return;
    }
    else
      if (file) {
        setTourData(prev => ({ ...prev, mainImage: file }));
      }
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.some(f => f.size > 1048576)) {
      alert("Img very big");
      return;
    }
    else
      setTourData(prev => ({ ...prev, gallery: [...prev.gallery, ...files] }));
  };

  const removeGalleryImage = (index) => {
    setTourData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  const addPlace = () => {
    setTourData(prev => ({ ...prev, places: [...prev.places, ''] }));
  };

  const updatePlace = (index, value) => {
    setTourData(prev => ({
      ...prev,
      places: prev.places.map((place, i) => i === index ? value : place)
    }));
  };

  const removePlace = (index) => {
    setTourData(prev => ({
      ...prev,
      places: prev.places.filter((_, i) => i !== index)
    }));
  };

  const addProgramDay = () => {
    setTourData(prev => ({
      ...prev,
      program: [...prev.program, {
        day: prev.program.length + 1,
        title: '',
        description: '',
        places: [''],
        included: ['']
      }]
    }));
  };

  const updateProgramDay = (dayIndex, field, value) => {
    setTourData(prev => ({
      ...prev,
      program: prev.program.map((day, i) =>
        i === dayIndex ? { ...day, [field]: value } : day
      )
    }));
  };

  const addProgramPlace = (dayIndex) => {
    setTourData(prev => ({
      ...prev,
      program: prev.program.map((day, i) =>
        i === dayIndex ? { ...day, places: [...day.places, ''] } : day
      )
    }));
  };

  const updateProgramPlace = (dayIndex, placeIndex, value) => {
    setTourData(prev => ({
      ...prev,
      program: prev.program.map((day, i) =>
        i === dayIndex ? {
          ...day,
          places: day.places.map((place, pi) => pi === placeIndex ? value : place)
        } : day
      )
    }));
  };

  const removeProgramPlace = (dayIndex, placeIndex) => {
    setTourData(prev => ({
      ...prev,
      program: prev.program.map((day, i) =>
        i === dayIndex ? {
          ...day,
          places: day.places.filter((_, pi) => pi !== placeIndex)
        } : day
      )
    }));
  };

  const addProgramIncluded = (dayIndex) => {
    setTourData(prev => ({
      ...prev,
      program: prev.program.map((day, i) =>
        i === dayIndex ? { ...day, included: [...day.included, ''] } : day
      )
    }));
  };

  const updateProgramIncluded = (dayIndex, includedIndex, value) => {
    setTourData(prev => ({
      ...prev,
      program: prev.program.map((day, i) =>
        i === dayIndex ? {
          ...day,
          included: day.included.map((item, ii) => ii === includedIndex ? value : item)
        } : day
      )
    }));
  };

  const removeProgramIncluded = (dayIndex, includedIndex) => {
    setTourData(prev => ({
      ...prev,
      program: prev.program.map((day, i) =>
        i === dayIndex ? {
          ...day,
          included: day.included.filter((_, ii) => ii !== includedIndex)
        } : day
      )
    }));
  };

  const removeProgramDay = (dayIndex) => {
    setTourData(prev => ({
      ...prev,
      program: prev.program.filter((_, i) => i !== dayIndex).map((day, i) => ({
        ...day,
        day: i + 1
      }))
    }));
  };

  const addHighlight = () => {
    setTourData(prev => ({ ...prev, highlights: [...prev.highlights, ''] }));
  };

  const updateHighlight = (index, value) => {
    setTourData(prev => ({
      ...prev,
      highlights: prev.highlights.map((highlight, i) => i === index ? value : highlight)
    }));
  };

  const removeHighlight = (index) => {
    setTourData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  const addAvailableDate = () => {
    setTourData(prev => ({
      ...prev,
      availableDates: [...prev.availableDates, { startDate: '', endDate: '', price: 0, spots: 0 }]
    }));
  };

  const updateAvailableDate = (index, field, value) => {
    setTourData(prev => ({
      ...prev,
      availableDates: prev.availableDates.map((date, i) =>
        i === index ? { ...date, [field]: value } : date
      )
    }));
  };

  const removeAvailableDate = (index) => {
    setTourData(prev => ({
      ...prev,
      availableDates: prev.availableDates.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const convertToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = (error) => reject(error);
      });
    };

    try {
      const mainImageBase64 = tourData.mainImage ? await convertToBase64(tourData.mainImage) : null;

      const galleryBase64 = await Promise.all(
        tourData.gallery.map(async (file) => ({
          name: file.name,
          data: await convertToBase64(file),
        }))
      );

      const formData = {
        ...tourData,
        mainImage: mainImageBase64,
        gallery: galleryBase64,
      };

      console.log(formData)

      const response = await fetch('/api/tours/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        alert('Tour added succesfully !');
        window.location.href = '/admin/tours';
      } else {
        const error = await response.json();
        if (error.message !== 'All fields must be filled') alert(`Error : ${error.message}`);
        else {
          setError('All fields must be filled');
          setTimeout(() => {
            setError('');
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Error :', error);
      alert('A connexion error happened.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">Add New Tour</h1>
          <p className="text-base sm:text-lg text-gray-600">Create an unforgettable Moroccan experience</p>
        </div>

        <form className="space-y-6 sm:space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Star className="text-amber-600" size={20} />
              </div>
              Basic Information
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tour Title <span className='text-red-600 font-bold'>*</span></label>
                <input
                  type="text"
                  value={tourData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="Discover the Imperial Medina"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tour Type <span className='text-red-600 font-bold'>*</span></label>
                <select
                  value={tourData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  required
                >
                  {types.map(type => (<option key={type} value={type}>{type}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Travelers</label>
                <input
                  type="number"
                  min="1"
                  value={tourData.minSpots}
                  onChange={(e) => handleInputChange('minSpots', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Days <span className='text-red-600 font-bold'>*</span></label>
                <input
                  type="number"
                  min="1"
                  value={tourData.days}
                  onChange={(e) => handleInputChange('days', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description <span className='text-red-600 font-bold'>*</span></label>
                <textarea
                  value={tourData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                  placeholder="Immerse yourself in the captivating atmosphere of Morocco..."
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="text-amber-600" size={20} />
              </div>
              Images
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Main Image <span className='text-red-600 font-bold'>*</span></label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center hover:border-amber-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageUpload}
                    className="hidden"
                    id="mainImage"
                    required
                  />
                  <label htmlFor="mainImage" className="cursor-pointer">
                    <Upload className="mx-auto text-gray-400 mb-3" size={40} />
                    <p className="text-sm text-gray-600 mb-1">Click to upload main tour image</p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                    {tourData.mainImage && (
                      <p className="text-sm text-amber-600 font-medium mt-3">{tourData.mainImage.name}</p>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gallery Images</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center hover:border-amber-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleGalleryUpload}
                    className="hidden"
                    id="gallery"
                    multiple
                  />
                  <label htmlFor="gallery" className="cursor-pointer">
                    <Upload className="mx-auto text-gray-400 mb-3" size={40} />
                    <p className="text-sm text-gray-600 mb-1">Click to upload gallery images</p>
                    <p className="text-xs text-gray-500">Multiple images allowed</p>
                  </label>
                </div>
                {tourData.gallery.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {tourData.gallery.map((file, idx) => (
                      <div key={idx} className="relative group">
                        <div className="w-fit h-fit bg-gray-100 rounded-lg overflow-hidden ml-8">
                          <p className="text-xs text-gray-600 p-2 break-all">{file.name}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(idx)}
                          className="absolute top-1 left-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <MapPin className="text-amber-600" size={20} />
              </div>
              Destinations
            </h2>

            <div className="space-y-3">
              {tourData.places.map((place, idx) => (
                <div key={idx} className="flex gap-3">
                  <input
                    type="text"
                    value={place}
                    onChange={(e) => updatePlace(idx, e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Jemaa el-Fna Square"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removePlace(idx)}
                    disabled={tourData.places.length === 1}
                    className="-translate-x-12 md:translate-x-0 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addPlace}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-amber-500 hover:text-amber-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add Destination
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-amber-600" size={20} />
              </div>
              Daily Program
            </h2>

            <div className="space-y-6">
              {tourData.program.map((day, dayIdx) => (
                <div key={dayIdx} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-4 flex justify-between items-center">
                    <h3 className="text-lg font-bold">Day {day.day}</h3>
                    <button
                      type="button"
                      onClick={() => removeProgramDay(dayIdx)}
                      disabled={tourData.program.length === 1}
                      className="text-white hover:text-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Day Title</label>
                      <input
                        type="text"
                        value={day.title}
                        onChange={(e) => updateProgramDay(dayIdx, 'title', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        placeholder="Arrival and Medina Exploration"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                      <textarea
                        value={day.description}
                        onChange={(e) => updateProgramDay(dayIdx, 'description', e.target.value)}
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                        placeholder="Begin your journey in the heart of Marrakech..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Places to Visit</label>
                      <div className="space-y-2">
                        {day.places.map((place, placeIdx) => (
                          <div key={placeIdx} className="flex gap-2">
                            <input
                              type="text"
                              value={place}
                              onChange={(e) => updateProgramPlace(dayIdx, placeIdx, e.target.value)}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                              placeholder="Jemaa el-Fna Square"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => removeProgramPlace(dayIdx, placeIdx)}
                              disabled={day.places.length === 1}
                              className="-translate-x-16 md:translate-x-0 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addProgramPlace(dayIdx)}
                          className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                        >
                          <Plus size={16} />
                          Add Place
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Included Services</label>
                      <div className="space-y-2">
                        {day.included.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex gap-2">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => updateProgramIncluded(dayIdx, itemIdx, e.target.value)}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                              placeholder="Breakfast"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => removeProgramIncluded(dayIdx, itemIdx)}
                              disabled={day.included.length === 1}
                              className="-translate-x-16 md:translate-x-0 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addProgramIncluded(dayIdx)}
                          className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                        >
                          <Plus size={16} />
                          Add Service
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addProgramDay}
                className="w-full px-4 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-amber-500 hover:text-amber-600 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Plus size={20} />
                Add Day
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Star className="text-amber-600" size={20} />
              </div>
              Tour Highlights
            </h2>

            <div className="space-y-3">
              {tourData.highlights.map((highlight, idx) => (
                <div key={idx} className="flex gap-3">
                  <input
                    type="text"
                    value={highlight}
                    onChange={(e) => updateHighlight(idx, e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Expert local guide with deep knowledge"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeHighlight(idx)}
                    disabled={tourData.highlights.length === 1}
                    className="-translate-x-12 md:translate-x-0 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addHighlight}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-amber-500 hover:text-amber-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add Highlight
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={tourData.daily}
                    onChange={(e) => handleInputChange('daily', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-gray-300 rounded-full peer-checked:bg-amber-500 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                </div>
                <div>
                  <span className="text-lg font-bold text-gray-900 block">Daily Tour</span>
                  <span className="text-sm text-gray-600">This tour runs daily with fixed pricing</span>
                </div>
              </label>
            </div>

            {tourData.daily ? (
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Calendar className="text-amber-600" size={20} />
                  </div>
                  Daily Tour Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={tourData.dailyStartDate}
                      onChange={(e) => handleInputChange('dailyStartDate', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price (USD)</label>
                    <input
                      type="number"
                      min="0"
                      value={tourData.dailyPrice}
                      onChange={(e) => handleInputChange('dailyPrice', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      placeholder="500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Maximum Travelers (Optional)</label>
                    <input
                      type="number"
                      min="1"
                      value={tourData.maxSpots}
                      onChange={(e) => handleInputChange('maxSpots', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Users className="text-amber-600" size={20} />
                  </div>
                  Available Dates
                </h2>

                <div className="space-y-4">
                  {tourData.availableDates.length > 0 && tourData.availableDates.map((date, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-xl p-4 sm:p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-900">Date Option {idx + 1}</h3>
                        <button
                          type="button"
                          onClick={() => removeAvailableDate(idx)}
                          disabled={tourData.availableDates.length === 1}
                          className="text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                          <input
                            type="date"
                            value={date.startDate}
                            onChange={(e) => updateAvailableDate(idx, 'startDate', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                          <input
                            type="date"
                            value={date.endDate}
                            onChange={(e) => updateAvailableDate(idx, 'endDate', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Price (USD)</label>
                          <input
                            type="number"
                            min="0"
                            value={date.price}
                            onChange={(e) => updateAvailableDate(idx, 'price', parseFloat(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                            placeholder="1200"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Available Spots</label>
                          <input
                            type="number"
                            min="1"
                            value={date.spots}
                            onChange={(e) => updateAvailableDate(idx, 'spots', parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                            placeholder="12"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addAvailableDate}
                    className="w-full px-4 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-amber-500 hover:text-amber-600 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <Plus size={20} />
                    Add Date Option
                  </button>
                </div>
              </div>
            )}
          </div>

          {error &&
            <div className='w-full flex justify-center items-center'>
              <p className='text-red-600 font-bold'>{error}</p>
            </div>
          }

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3"
            >
              <Save size={24} />
              Save Tour
            </button>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex-1 sm:flex-initial px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTourPage;

export async function getServerSideProps({ req, res }) {
  const admin = verifyAuth(req, res);

  if (!admin) {
    return {
      redirect: {
        destination: "login",
        permanent: false,
      },
    };
  }

  return {
    props: { session: { connected: true } },
  };
}