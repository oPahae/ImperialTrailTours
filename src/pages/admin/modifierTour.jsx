import { useState, useRef, useEffect } from 'react';
import { Save, Plus, Trash2, X, Edit2, Image, Calendar, MapPin, Star, Clock, CheckCircle, Users } from 'lucide-react';
import { useRouter } from 'next/router';
import { types } from '@/utils/constants';
import { verifyAuth } from "@/middlewares/adminAuth";

const TourAdminPanel = () => {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;
  const [tourData, setTourData] = useState({
    id: null,
    code: '',
    title: '',
    type: 'Cultural',
    days: 1,
    minSpots: 10,
    daily: false,
    dailyStartDate: '',
    dailyPrice: 0,
    price: 0,
    date: '',
    image: '',
    places: [],
    rating: 0,
    reviews: 0,
    description: '',
    gallery: [],
    program: [],
    highlights: [],
    availableDates: []
  });

  const fileInputRef = useRef(null);
  const galleryFileInputRefs = useRef([]);

  useEffect(() => {
    if (id) {
      const fetchTour = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/tours/getOneAdmin?id=${id}`);
          const data = await response.json();
          setTourData(data.tour);
          console.log(data)
        } catch (error) {
          console.error("Erreur lors de la récupération du tour :", error);
        } finally {
          setLoading(false);
        }
      };
      fetchTour();
    }
  }, [id]);

  const addDay = () => {
    const newDayNumber = tourData.program.length + 1;
    setTourData(prev => ({
      ...prev,
      program: [
        ...prev.program,
        {
          day: newDayNumber,
          title: `Day ${newDayNumber}`,
          places: [],
          description: '',
          included: []
        }
      ],
      days: newDayNumber
    }));
  };

  const removeDay = (dayIndex) => {
    const newProgram = [...tourData.program];
    newProgram.splice(dayIndex, 1);
    const updatedProgram = newProgram.map((day, index) => ({
      ...day,
      day: index + 1
    }));
    setTourData(prev => ({
      ...prev,
      program: updatedProgram,
      days: updatedProgram.length
    }));
  };

  const moveDay = (dayIndex, direction) => {
    const newProgram = [...tourData.program];
    const dayToMove = newProgram[dayIndex];
    if (direction === 'up' && dayIndex > 0) {
      newProgram[dayIndex] = newProgram[dayIndex - 1];
      newProgram[dayIndex - 1] = dayToMove;
    } else if (direction === 'down' && dayIndex < newProgram.length - 1) {
      newProgram[dayIndex] = newProgram[dayIndex + 1];
      newProgram[dayIndex + 1] = dayToMove;
    }
    const updatedProgram = newProgram.map((day, index) => ({
      ...day,
      day: index + 1
    }));
    setTourData(prev => ({
      ...prev,
      program: updatedProgram
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/tours/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tourData),
      });
      if (response.ok) {
        setEditMode(false);
        alert('Changes saved successfully!');
      } else {
        console.error("Erreur lors de la sauvegarde des modifications");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error);
    }
  };

  const updateField = (field, value) => {
    setTourData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e, isMainImage = true, index = null) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (isMainImage) {
          updateField('image', event.target.result);
        } else {
          updateGalleryImage(index, event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addPlace = () => {
    setTourData(prev => ({ ...prev, places: [...prev.places, ''] }));
  };

  const updatePlace = (index, value) => {
    const newPlaces = [...tourData.places];
    newPlaces[index] = value;
    setTourData(prev => ({ ...prev, places: newPlaces }));
  };

  const removePlace = (index) => {
    setTourData(prev => ({ ...prev, places: prev.places.filter((_, i) => i !== index) }));
  };

  const addGalleryImage = () => {
    setTourData(prev => ({ ...prev, gallery: [...prev.gallery, ''] }));
  };

  const updateGalleryImage = (index, value) => {
    const newGallery = [...tourData.gallery];
    newGallery[index] = value;
    setTourData(prev => ({ ...prev, gallery: newGallery }));
  };

  const removeGalleryImage = (index) => {
    setTourData(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== index) }));
  };

  const updateProgram = (dayIndex, field, value) => {
    const newProgram = [...tourData.program];
    newProgram[dayIndex] = { ...newProgram[dayIndex], [field]: value };
    setTourData(prev => ({ ...prev, program: newProgram }));
  };

  const updateProgramPlace = (dayIndex, placeIndex, value) => {
    const newProgram = [...tourData.program];
    const newPlaces = [...newProgram[dayIndex].places];
    newPlaces[placeIndex] = value;
    newProgram[dayIndex] = { ...newProgram[dayIndex], places: newPlaces };
    setTourData(prev => ({ ...prev, program: newProgram }));
  };

  const addProgramPlace = (dayIndex) => {
    const newProgram = [...tourData.program];
    newProgram[dayIndex].places.push('');
    setTourData(prev => ({ ...prev, program: newProgram }));
  };

  const removeProgramPlace = (dayIndex, placeIndex) => {
    const newProgram = [...tourData.program];
    newProgram[dayIndex].places = newProgram[dayIndex].places.filter((_, i) => i !== placeIndex);
    setTourData(prev => ({ ...prev, program: newProgram }));
  };

  const updateProgramIncluded = (dayIndex, includedIndex, value) => {
    const newProgram = [...tourData.program];
    const newIncluded = [...newProgram[dayIndex].included];
    newIncluded[includedIndex] = value;
    newProgram[dayIndex] = { ...newProgram[dayIndex], included: newIncluded };
    setTourData(prev => ({ ...prev, program: newProgram }));
  };

  const addProgramIncluded = (dayIndex) => {
    const newProgram = [...tourData.program];
    newProgram[dayIndex].included.push('');
    setTourData(prev => ({ ...prev, program: newProgram }));
  };

  const removeProgramIncluded = (dayIndex, includedIndex) => {
    const newProgram = [...tourData.program];
    newProgram[dayIndex].included = newProgram[dayIndex].included.filter((_, i) => i !== includedIndex);
    setTourData(prev => ({ ...prev, program: newProgram }));
  };

  const addHighlight = () => {
    setTourData(prev => ({ ...prev, highlights: [...prev.highlights, ''] }));
  };

  const updateHighlight = (index, value) => {
    const newHighlights = [...tourData.highlights];
    newHighlights[index] = value;
    setTourData(prev => ({ ...prev, highlights: newHighlights }));
  };

  const removeHighlight = (index) => {
    setTourData(prev => ({ ...prev, highlights: prev.highlights.filter((_, i) => i !== index) }));
  };

  const addDate = () => {
    const newId = Math.max(...tourData.availableDates.map(d => d.id), 0) + 1;
    setTourData(prev => ({
      ...prev,
      availableDates: [...prev.availableDates, {
        id: newId,
        startDate: '',
        endDate: '',
        price: tourData.price,
        spots: 10
      }]
    }));
  };

  const updateDate = (index, field, value) => {
    const newDates = [...tourData.availableDates];
    newDates[index] = { ...newDates[index], [field]: value };
    setTourData(prev => ({ ...prev, availableDates: newDates }));
  };

  const removeDate = (index) => {
    setTourData(prev => ({
      ...prev,
      availableDates: prev.availableDates.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading tour data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Tour Administration</h1>
            <div className="flex gap-3">
              {editMode ? (
                <>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors flex items-center gap-2"
                  >
                    <Save size={20} />
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-6 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors flex items-center gap-2"
                >
                  <Edit2 size={20} />
                  Edit Tour
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tour Code</label>
              {editMode ? (
                <input
                  type="text"
                  value={tourData.code}
                  onChange={(e) => updateField('code', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              ) : (
                <p className="text-gray-900">{tourData.code}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tour Type</label>
              {editMode ? (
                <select
                  value={tourData.type}
                  onChange={(e) => updateField('type', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  {types.map(type => (<option key={type} value={type}>{type}</option>))}
                </select>
              ) : (
                <p className="text-gray-900">{tourData.type}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
              {editMode ? (
                <input
                  type="text"
                  value={tourData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              ) : (
                <p className="text-gray-900">{tourData.title}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Travelers</label>
              {editMode ? (
                <input
                  type="number"
                  min="1"
                  value={tourData.minSpots}
                  onChange={(e) => updateField('minSpots', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              ) : (
                <p className="text-gray-900">{tourData.minSpots} travelers</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (Days)</label>
              {editMode ? (
                <input
                  type="number"
                  value={tourData.days}
                  onChange={(e) => updateField('days', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  min="1"
                />
              ) : (
                <p className="text-gray-900">{tourData.days} Days</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tour Schedule Type</label>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${tourData.daily ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                  {tourData.daily ? 'Daily Tour' : 'Scheduled Dates'}
                </span>
                <span className="text-xs text-gray-500">(Cannot be changed)</span>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Main Image</label>
              {editMode ? (
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleImageChange(e, true)}
                    accept="image/*"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                  {tourData.image && (
                    <img src={tourData.image} alt="Tour" className="w-32 h-20 object-cover rounded" />
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <img src={tourData.image} alt="Tour" className="w-32 h-20 object-cover rounded" />
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              {editMode ? (
                <textarea
                  value={tourData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  rows="4"
                />
              ) : (
                <p className="text-gray-900">{tourData.description}</p>
              )}
            </div>
          </div>
          {/* Non-editable calculated fields */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Calculated Fields (Read-only)</h3>
            <div className="grid md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Number of Destinations</p>
                <p className="text-lg font-semibold text-gray-900">{tourData.places.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Rating</p>
                <p className="text-lg font-semibold text-gray-900 flex items-center gap-1">
                  <Star size={18} className="text-amber-500" fill="currentColor" />
                  {Number(tourData.rating).toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Reviews</p>
                <p className="text-lg font-semibold text-gray-900">{tourData.reviews}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Destinations */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Destinations</h2>
            {editMode && (
              <button
                onClick={addPlace}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 flex items-center gap-2"
              >
                <Plus size={16} />
                Add Place
              </button>
            )}
          </div>
          <div className="space-y-3">
            {tourData.places.map((place, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <MapPin size={20} className="text-amber-600 flex-shrink-0" />
                {editMode ? (
                  <>
                    <input
                      type="text"
                      value={place}
                      onChange={(e) => updatePlace(idx, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      onClick={() => removePlace(idx)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                ) : (
                  <p className="text-gray-900">{place}</p>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Gallery */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Gallery</h2>
            {editMode && (
              <button
                onClick={addGalleryImage}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 flex items-center gap-2"
              >
                <Plus size={16} />
                Add Image
              </button>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {tourData.gallery.map((img, idx) => (
              <div key={idx} className="space-y-2">
                {editMode ? (
                  <>
                    <input
                      type="file"
                      ref={el => galleryFileInputRefs.current[idx] = el}
                      onChange={(e) => handleImageChange(e, false, idx)}
                      accept="image/*"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                    {img && <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-40 object-cover rounded-lg" />}
                    <button
                      onClick={() => removeGalleryImage(idx)}
                      className="w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </>
                ) : (
                  <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-40 object-cover rounded-lg" />
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Daily Program */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Daily Program</h2>
            {editMode && (
              <button
                onClick={addDay}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 flex items-center gap-2"
              >
                <Plus size={16} />
                Add Day
              </button>
            )}
          </div>
          <div className="space-y-6">
            {tourData.program.map((day, dayIdx) => (
              <div key={day.day} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-amber-600 text-white px-6 py-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold">Day {dayIdx+1}</h3>
                  {editMode && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => moveDay(dayIdx, 'up')}
                        disabled={dayIdx === 0}
                        className="p-1 text-white hover:bg-amber-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveDay(dayIdx, 'down')}
                        disabled={dayIdx === tourData.program.length - 1}
                        className="p-1 text-white hover:bg-amber-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removeDay(dayIdx)}
                        className="p-1 text-white hover:bg-red-600 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Day Title</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={day.title}
                        onChange={(e) => updateProgram(dayIdx, 'title', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      />
                    ) : (
                      <p className="text-gray-900">{day.title}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    {editMode ? (
                      <textarea
                        value={day.description}
                        onChange={(e) => updateProgram(dayIdx, 'description', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                        rows="3"
                      />
                    ) : (
                      <p className="text-gray-700">{day.description}</p>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-700">Destinations</label>
                      {editMode && (
                        <button
                          onClick={() => addProgramPlace(dayIdx)}
                          className="text-amber-600 text-sm font-semibold hover:text-amber-700 flex items-center gap-1"
                        >
                          <Plus size={14} />
                          Add
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {day.places.map((place, placeIdx) => (
                        <div key={placeIdx} className="flex items-center gap-2">
                          {editMode ? (
                            <>
                              <input
                                type="text"
                                value={place}
                                onChange={(e) => updateProgramPlace(dayIdx, placeIdx, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                              />
                              <button
                                onClick={() => removeProgramPlace(dayIdx, placeIdx)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{place}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-700">Included Services</label>
                      {editMode && (
                        <button
                          onClick={() => addProgramIncluded(dayIdx)}
                          className="text-amber-600 text-sm font-semibold hover:text-amber-700 flex items-center gap-1"
                        >
                          <Plus size={14} />
                          Add
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {day.included.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-center gap-2">
                          {editMode ? (
                            <>
                              <input
                                type="text"
                                value={item}
                                onChange={(e) => updateProgramIncluded(dayIdx, itemIdx, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                              />
                              <button
                                onClick={() => removeProgramIncluded(dayIdx, itemIdx)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                              <CheckCircle size={14} />
                              {item}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Tour Highlights */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Tour Highlights</h2>
            {editMode && (
              <button
                onClick={addHighlight}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 flex items-center gap-2"
              >
                <Plus size={16} />
                Add Highlight
              </button>
            )}
          </div>
          <div className="space-y-3">
            {tourData.highlights.map((highlight, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle size={20} className="text-amber-600 flex-shrink-0 mt-1" />
                {editMode ? (
                  <>
                    <input
                      type="text"
                      value={highlight}
                      onChange={(e) => updateHighlight(idx, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      onClick={() => removeHighlight(idx)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                ) : (
                  <p className="text-gray-700">{highlight}</p>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Pricing Section - Daily vs Scheduled */}
        {tourData.daily ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Calendar className="text-amber-600" size={24} />
              Daily Tour Pricing
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                {editMode ? (
                  <input
                    type="date"
                    value={tourData.dailyStartDate}
                    onChange={(e) => updateField('dailyStartDate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                ) : (
                  <p className="text-gray-900">{tourData.dailyStartDate}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (USD)</label>
                {editMode ? (
                  <input
                    type="number"
                    min="0"
                    value={tourData.dailyPrice}
                    onChange={(e) => updateField('dailyPrice', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                ) : (
                  <p className="text-gray-900">${tourData.dailyPrice}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Available Dates</h2>
              {editMode && (
                <button
                  onClick={addDate}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Date
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-200">Start Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-200">End Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-200">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-200">Available Spots</th>
                    {editMode && <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border border-gray-200">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {tourData.availableDates.map((date, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 border border-gray-200">
                        {editMode ? (
                          <input
                            type="date"
                            value={date.startDate}
                            onChange={(e) => updateDate(idx, 'startDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                          />
                        ) : (
                          <span className="text-gray-900">{date.startDate}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 border border-gray-200">
                        {editMode ? (
                          <input
                            type="date"
                            value={date.endDate}
                            onChange={(e) => updateDate(idx, 'endDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                          />
                        ) : (
                          <span className="text-gray-900">{date.endDate}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 border border-gray-200">
                        {editMode ? (
                          <input
                            type="number"
                            value={date.price}
                            onChange={(e) => updateDate(idx, 'price', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                            min="0"
                          />
                        ) : (
                          <span className="text-gray-900">${date.price}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 border border-gray-200">
                        {editMode ? (
                          <input
                            type="number"
                            value={date.spots}
                            onChange={(e) => updateDate(idx, 'spots', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                            min="0"
                          />
                        ) : (
                          <span className="text-gray-900">{date.spots} spots</span>
                        )}
                      </td>
                      {editMode && (
                        <td className="px-4 py-3 border border-gray-200 text-center">
                          <button
                            onClick={() => removeDate(idx)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg inline-flex items-center justify-center"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TourAdminPanel;

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