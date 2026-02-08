import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { MapPin, Users, Star, Clock, CheckCircle, X, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Repeat, AlertCircle, ChevronLeftSquare } from 'lucide-react';
import Link from 'next/link';
import { verifyAuth } from "@/middlewares/auth";

const TourPage = ({ setShowNotification }) => {
  const router = useRouter();
  const { id } = router.query;
  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 5,
    comment: ""
  });
  const [reviews, setReviews] = useState([]);
  const [tourData, setTourData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const bookingSectionRef = useRef(null);

  useEffect(() => {
    if (id) {
      const fetchTourData = async () => {
        setLoading(true);
        try {
          const [tourResponse, reviewsResponse] = await Promise.all([
            fetch(`/api/tours/getOneClient?id=${id}`),
            fetch(`/api/tours/getReviews?id=${id}`)
          ]);
          const tourData = await tourResponse.json();
          const reviewsData = await reviewsResponse.json();
          setTourData(tourData.tour);
          console.log(tourData)
          setReviews(reviewsData.reviews);
        } catch (error) {
          console.error("Erreur lors de la récupération des données :", error);
        } finally {
          setLoading(false);
        }
      };
      fetchTourData();
    }
  }, [id]);

  const avgRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.comment) return;

    try {
      const response = await fetch('/api/tours/addReview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tourId: id,
          name: reviewForm.name,
          rating: parseInt(reviewForm.rating),
          comment: reviewForm.comment
        }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        console.error("Erreur lors de l'ajout de l'avis");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'avis :", error);
    }
  };

  const handleBookNowClick = () => {
    if (bookingSectionRef.current) {
      bookingSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        setShowNotification(true);
      }, 800);
    }
  };

  const getGoogleMapsUrl = (places) => {
    if (!places || places.length === 0) return "";

    const origin = encodeURIComponent(`${places[0]}, ${places[0]}, Morocco`);
    const dest = encodeURIComponent(`${places[places.length - 1]}, ${places[places.length - 1]}, Morocco`);
    const waypoints = places.slice(1, -1).map(p => encodeURIComponent(`${p}, ${p}, Morocco`)).join('|');
    return `https://www.google.com/maps/embed/v1/directions?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&origin=${origin}&destination=${dest}${waypoints ? '&waypoints=' + waypoints : ''}&mode=driving`;
  };

  // Calendar functions for daily tours
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const isDateSelectable = (date) => {
    if (!tourData || !tourData.daily) return false;
    const startDate = new Date(tourData.dateStart);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    return date >= startDate && date >= today;
  };

  const handleDateSelect = (date) => {
    if (isDateSelectable(date)) {
      setSelectedDate(date);
    }
  };

  const handleBookDaily = () => {
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      router.push(`/reserver-daily?id=${id}&date=${formattedDate}`);
    }
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const days = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelectable = isDateSelectable(date);
      const isSelected = selectedDate &&
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear();

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(date)}
          disabled={!isSelectable}
          className={`h-12 rounded-lg font-medium transition-all ${isSelected
              ? 'bg-amber-600 text-white shadow-md scale-105'
              : isSelectable
                ? 'bg-white hover:bg-amber-50 hover:border-amber-300 border border-gray-200 text-gray-900'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">{monthName}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days}
        </div>

        {selectedDate && (
          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-800 font-medium">Selected Date</p>
                <p className="text-lg font-bold text-amber-900">
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <button
                onClick={handleBookDaily}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm"
              >
                Book Now
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-start gap-2 text-sm text-gray-600">
          <CalendarIcon size={16} className="mt-0.5 flex-shrink-0" />
          <p>
            Select your preferred departure date.
            {tourData?.dateStart && ` Available from ${new Date(tourData.dateStart).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`}
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading tour data...</p>
      </div>
    );
  }

  if (!tourData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-lg text-gray-600">Tour not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white comp">
      <div className="relative h-[60vh] md:h-[70vh]">
        <img src={tourData.image} alt={tourData.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-block bg-amber-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                {tourData.type}
              </span>
              {(tourData.daily === true || tourData.daily === 1) && (
                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                  <Repeat size={16} className="animate-pulse" />
                  Daily Tour
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">{tourData.title}</h1>
            <div className="flex flex-wrap items-center gap-6 text-white">
              <div className="flex items-center gap-2">
                <Clock size={20} />
                <span>{tourData.days} Days</span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={20} fill="currentColor" />
                <span>{avgRating.toFixed(1)} ({reviews.length} reviews)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={20} />
                <span>{tourData.places.length} Destinations</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-9">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {tourData.minSpots > 1 && <div className='w-full flex gap-2 justify-center items-center text-black font-bold rounded-xl underline md:px-16 py mb-4'>
              <AlertCircle size={28} />
              Please note that this tour will not start until it reaches at least {tourData.minSpots} participants.
            </div>}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Overview</h2>
              <p className="text-gray-600 leading-relaxed text-lg">{tourData.description}</p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tourData.gallery.slice(0, 4).map((img, idx) => (
                  <img key={idx} src={img} alt={`Gallery ${idx + 1}`} className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer" />
                ))}
              </div>
              <Link href={`tourGallery?id=${id}`} className='flex gap-2 justify-center items-center text-amber-500 mt-4 hover:underline'>
                See more
                <ChevronRight />
              </Link>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Tour Map</h2>
              <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <iframe
                  src={getGoogleMapsUrl(tourData.places)}
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  className="w-full"
                ></iframe>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {tourData.places.map((place, idx) => (
                  <span key={idx} className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 px-4 py-2 rounded-full text-sm border border-amber-200">
                    <MapPin size={16} />
                    {place}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Daily Program</h2>
              <div className="space-y-6">
                {tourData.program.map((day, idx) => (
                  <div key={day.day} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-amber-600 text-white px-6 py-4">
                      <h3 className="text-xl font-bold">Day {idx + 1}: {day.title}</h3>
                    </div>
                    <div className="p-6 bg-white">
                      <div className="mb-4">
                        <p className="text-gray-700 leading-relaxed">{day.description}</p>
                      </div>
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Destinations</h4>
                        <div className="flex flex-wrap gap-2">
                          {day.places.map((place, idx) => (
                            <span key={idx} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                              {place}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Included</h4>
                        <div className="flex flex-wrap gap-3">
                          {day.included.map((item, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                              <CheckCircle size={14} />
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Tour Highlights</h2>
              <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
                <ul className="space-y-3">
                  {tourData.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-amber-600 flex-shrink-0 mt-1" />
                      <span className="text-gray-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="text-center mb-6">
                  <p className="text-gray-600 text-sm mb-2">Starting from</p>
                  <p className="text-4xl font-bold text-amber-600">${tourData.price}</p>
                  <p className="text-gray-500 text-sm">per person</p>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-semibold text-gray-900">{tourData.days} Days</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Tour Code</span>
                    <span className="font-semibold text-gray-900">{tourData.code}</span>
                  </div>
                  {(tourData.daily === true || tourData.daily === 1) && (
                    <div className="flex items-center justify-between py-3">
                      <span className="text-gray-600">Type</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-green-700">
                        <Repeat size={16} />
                        Daily Departures
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleBookNowClick}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
                >
                  Book Now
                </button>
              </div>
              <div className="bg-amber-600 text-white rounded-lg p-6">
                <h3 className="font-bold text-xl mb-2">Need Help?</h3>
                <p className="text-amber-100 text-sm mb-4">Contact our travel experts for personalized assistance</p>
                <div className="flex justify-center w-full bg-white text-amber-600 py-3 rounded-lg font-semibold hover:bg-amber-50 transition-colors">
                  <Link href="contact">Contact Us</Link>
                </div>
              </div>
              {/* --- Review Form Section --- */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Leave a Review</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      name="name"
                      value={reviewForm.name}
                      onChange={handleReviewChange}
                      placeholder="Your Name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 text-sm font-medium mb-1 block">
                      Rating
                    </label>
                    <select
                      name="rating"
                      value={reviewForm.rating}
                      onChange={handleReviewChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n} ★
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <textarea
                      name="comment"
                      value={reviewForm.comment}
                      onChange={handleReviewChange}
                      placeholder="Write your review..."
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-amber-600 text-white py-2 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
                  >
                    Submit Review
                  </button>
                </form>
                {reviews.length > 0 && (
                  <div className="mt-6 border-t border-gray-200 pt-4 space-y-3">
                    <h4 className="text-lg font-semibold text-gray-900">Recent Reviews</h4>
                    {reviews.slice(0, 3).map((r, i) => (
                      <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p className="font-semibold text-amber-700">{r.name}</p>
                        <p className="text-sm text-gray-600">{'★'.repeat(r.rating)}</p>
                        <p className="text-gray-700 text-sm mt-1">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Booking Section - Different for Daily vs Non-Daily Tours */}
        <div className="mt-16" ref={bookingSectionRef}>
          {tourData.daily ? (
            <div>
              <div className="flex items-center gap-3 mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Select Your Departure Date</h2>
                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
                  <Repeat size={16} />
                  Daily Departures Available
                </span>
              </div>
              {renderCalendar()}
            </div>
          ) : (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Available Dates</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-6 py-4 text-left font-semibold text-gray-900 border border-gray-200">Start Date</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900 border border-gray-200">End Date</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900 border border-gray-200">Price</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900 border border-gray-200">Availability</th>
                      <th className="px-6 py-4 text-center font-semibold text-gray-900 border border-gray-200">Book Now</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tourData.availableDates.map((date, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 border border-gray-200 text-gray-700">{date.startDate}</td>
                        <td className="px-6 py-4 border border-gray-200 text-gray-700">{date.endDate}</td>
                        <td className="px-6 py-4 border border-gray-200">
                          <span className="text-xl font-bold text-amber-600">${date.price}</span>
                        </td>
                        <td className="px-6 py-4 border border-gray-200">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${date.spots > 5 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                            <Users size={14} />
                            {date.spots} available
                          </span>
                        </td>
                        <td className="px-6 py-4 border border-gray-200 text-center">
                          <button
                            onClick={() => {
                              if (date.spots > 0 || new Date(date.startDate) <= new Date())
                                router.push(`reserver?id=${id}&date=${date.id}`)
                            }}
                            className={`${(date.spots > 0 && new Date(date.startDate) <= new Date()) ? "bg-amber-600 hover:bg-amber-700" : "bg-gray-600 cursor-not-allowed"} text-white px-6 py-2 rounded-lg font-semibold transition-colors`}
                          >
                            Book
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16">
          {/* Rating Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-amber-700 to-amber-900 text-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-6">Ratings</h3>
              <div className="text-center">
                <div className="text-6xl font-bold mb-2">{avgRating.toFixed(1)}</div>
                <div className="flex justify-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-6 h-6 ${i < Math.floor(avgRating) ? 'fill-white text-white' : 'text-white opacity-30'}`} />
                  ))}
                </div>
                <p className="text-amber-50">Based on {reviews.length} reviews</p>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Traveler Reviews</h3>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{review.name}</h4>
                      <p className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourPage;

export async function getServerSideProps({ req, res }) {
  const user = verifyAuth(req, res);

  if (user && user.id) return {
    props: { session: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email } },
  };

  else return {
    props: { session: null },
  };

}

