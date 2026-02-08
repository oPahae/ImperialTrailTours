import { useState, useEffect } from 'react';
import { ChevronRight, Calendar, Users, CheckCircle, User, Globe, Mail, Phone, MapPin, CreditCard, X, Repeat, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/router';
import { footerInfos } from '@/utils/constants';
import { verifyAuth } from "@/middlewares/auth";

import dynamic from 'next/dynamic';

const PaypalCheckout = dynamic(
  () => import('@/components/Paypal'),
  { ssr: false }
);

export default function ReserverDaily({ session }) {
  const router = useRouter();
  const { id, date } = router.query;
  const [step, setStep] = useState(1);
  const [percent, setPercent] = useState('');
  const [receiptImage, setReceiptImage] = useState(null);
  const [uploadMsg, setUploadMsg] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [numTravelers, setNumTravelers] = useState(1);
  const [showAccountNotification, setShowAccountNotification] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [showPayement, setShowPayement] = useState(false);
  const [reservationId, setReservationId] = useState(null);
  const [travelers, setTravelers] = useState([{
    prefix: '',
    firstName: session ? session.nom : '',
    lastName: session ? session.prenom : '',
    birthDate: '',
    phone: '',
    email: session ? session.email : '',
    nationality: '',
    passport: '',
    passportExpiry: '',
    country: '',
    city: '',
    address: '',
    province: '',
    postalCode: ''
  }]);
  const [tourData, setTourData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const prefixes = ['Mr.', 'Mrs.', 'Ms.', 'Dr.'];

  useEffect(() => {
    if (id && date) {
      const fetchData = async () => {
        try {
          const [tourResponse, percentResponse] = await Promise.all([
            fetch(`/api/tours/getOneClient?id=${id}`),
            fetch(`/api/payment/getPercent`),
          ]);
          const tourData = await tourResponse.json();
          const percentData = await percentResponse.json();

          // Vérifier que c'est bien un tour daily
          if (!tourData.tour.daily) {
            router.push(`/tour?id=${id}`);
            return;
          }

          setTourData(tourData.tour);
          setPercent(percentData.value);
          setSelectedDate(date);
        } catch (error) {
          console.error("Erreur lors de la récupération des données :", error);
        }
      };
      fetchData();
    }
  }, [id, date]);

  const updateTravelerCount = (count) => {
    if(tourData.maxSpots && count >= tourData.maxSpots) count = tourData.maxSpots;
    setNumTravelers(count);
    const newTravelers = [...travelers];
    if (count > travelers.length) {
      for (let i = travelers.length; i < count; i++) {
        newTravelers.push({
          prefix: '',
          firstName: '',
          lastName: '',
          birthDate: '',
          phone: '',
          email: '',
          nationality: '',
          passport: '',
          passportExpiry: '',
          country: '',
          city: '',
          address: '',
          province: '',
          postalCode: ''
        });
      }
    } else {
      newTravelers.splice(count);
    }
    setTravelers(newTravelers);
  };

  const updateTraveler = (index, field, value) => {
    const newTravelers = [...travelers];
    newTravelers[index][field] = value;
    setTravelers(newTravelers);
  };

  const validateStep1 = () => {
    const minSpots = tourData?.minSpots || 1;
    return true; // 7yydna dak lplan dial khas ykon > minSpots
  };

  const validateStep2 = () => {
    return travelers.every(t =>
      t.prefix && t.firstName && t.lastName &&
      t.birthDate && t.email && t.country && t.city
    );
  };

  const handleContinue = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  function addDays(dateStr, days) {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  const handleFinalBooking = async () => {
    try {
      const response = await fetch('/api/reservations/add-daily', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tourId: id,
          selectedDate: date,
          endDate: addDays(date, tourData.days),
          price: tourData.price,
          travelers: travelers.map(traveler => ({
            ...traveler,
            birthDate: new Date(traveler.birthDate).toISOString().split('T')[0],
            passportExpiry: traveler.passportExpiry ? new Date(traveler.passportExpiry).toISOString().split('T')[0] : null
          })),
          userID: session ? session.id : null
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setReservationId(result.reservationId);
        if (!session) {
          localStorage.setItem('localReservationId', result.reservationId);
        }
        sendMail();
        setMsg('Reservation successful! Now you have to proceed to payment.');
      } else {
        const errorData = await response.json();
        setMsg(errorData.message || 'Error during reservation');
        console.error("Erreur lors de la confirmation de la réservation");
      }
    } catch (error) {
      console.error("Erreur lors de la confirmation :", error);
      setMsg('Server error during reservation');
    }
  };

  const sendMail = async () => {
    const firstTraveler = travelers[0];
    const totalPrice = tourData.price * numTravelers;

    // Calculer la date de fin en ajoutant les jours du tour
    const startDate = new Date(selectedDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + tourData.days);

    const response = await fetch('/api/_mail/reservation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: firstTraveler.email,
        tour: {
          title: tourData.title,
          type: tourData.type,
          days: tourData.days,
          startDate: startDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
          endDate: endDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
          pricePerPerson: tourData.price,
          totalPrice: totalPrice,
          numTravelers: numTravelers,
          isDailyTour: true
        },
        travelers: travelers.map(traveler => ({
          prefix: traveler.prefix,
          firstName: traveler.firstName,
          lastName: traveler.lastName,
          birthDate: new Date(traveler.birthDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
          phone: traveler.phone,
          email: traveler.email,
          nationality: traveler.nationality,
          passport: traveler.passport,
          passportExpiry: traveler.passportExpiry ? new Date(traveler.passportExpiry).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : null,
          address: `${traveler.address}, ${traveler.city}, ${traveler.province} ${traveler.postalCode}, ${traveler.country}`,
        })),
      }),
    });

    if (!response.ok) {
      console.error("Erreur lors de l'envoi de l'email");
    }
  };

  const handleInsertImg = async () => {
    if (!receiptImage) {
      setUploadMsg('Please select an image first.');
      return;
    }

    if (!reservationId) {
      setUploadMsg('Reservation not found.');
      return;
    }

    try {
      setUploadLoading(true);
      setUploadMsg('');

      const toBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });

      const base64Data = await toBase64(receiptImage);
      const base64String = base64Data.split(',')[1];

      const res = await fetch('/api/payment/insertImg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservationId,
          image: base64String,
          amount: (tourData.price * numTravelers) * percent / 100
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setUploadMsg('Receipt uploaded successfully.');
        setReceiptImage(null);
      } else {
        setUploadMsg(data.message || 'Upload failed.');
      }

    } catch (error) {
      console.error(error);
      setUploadMsg('Server error while uploading image.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleBankPayment = () => {
    setPaymentMethod('bank');
    if (!session) {
      setShowAccountNotification(true);
    }
  };

  const handlePaypalSuccess = () => {
    setMsg("Payment successful!");
    if (!session) {
      setShowAccountNotification(true);
    }
  };

  if (!tourData || !selectedDate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading booking data...</p>
      </div>
    );
  }

  // Calculer la date de fin
  const startDate = new Date(selectedDate);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + tourData.days);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Notification pour création de compte */}
      {showAccountNotification && !session && (
        <div className="fixed top-6 right-6 z-50 animate-slideInRight">
          <div className="bg-white rounded-xl shadow-2xl border-l-4 border-green-500 p-6 max-w-md relative">
            <button
              onClick={() => setShowAccountNotification(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 mb-4">
              <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Create Your Account?
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Save time and track your travel history effortlessly.
                </p>
                <p className="text-xs text-amber-700 font-medium">
                  It only takes 30 seconds!
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push(`register?lastname=${travelers[0].lastName}&firstname=${travelers[0].firstName}&email=${travelers[0].email}`)}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-sm font-semibold py-2.5 rounded-lg transition-all transform hover:scale-105 shadow-md"
              >
                Yes, Let's Go!
              </button>
              <button
                onClick={() => setShowAccountNotification(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold py-2.5 rounded-lg transition-all"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.4s ease-out;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-amber-900">Book Your Daily Tour</h1>
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
              <Repeat size={18} className="animate-pulse" />
              Daily Departure
            </span>
          </div>
          <p className="text-lg text-gray-600">Experience the magic of Morocco with {footerInfos.entreprise}</p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-amber-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-amber-600 text-white' : 'bg-gray-200'}`}>
                <Calendar className="w-5 h-5" />
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Tour Details</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
            <div className={`flex items-center ${step >= 2 ? 'text-amber-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-amber-600 text-white' : 'bg-gray-200'}`}>
                <Users className="w-5 h-5" />
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Travelers Info</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
            <div className={`flex items-center ${step >= 3 ? 'text-amber-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-amber-600 text-white' : 'bg-gray-200'}`}>
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Confirmation</span>
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-amber-600">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Number of Travelers {tourData.maxSpots && `(Max: ${tourData.maxSpots})`}</h2>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Tour Information</h3>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-lg border-2 border-amber-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-gray-800 font-bold text-lg">{tourData.title}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                        {tourData.type} • {tourData.days} days
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                          <Repeat size={12} />
                          Daily
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg mt-4 border border-amber-200">
                    <p className="text-sm text-gray-600 mb-2">Selected departure date:</p>
                    <p className="font-semibold text-gray-900 text-lg">
                      {startDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Tour ends: {endDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-amber-200">
                    <span className="text-gray-700 font-medium">Price per person:</span>
                    <span className="text-2xl font-bold text-amber-700">${tourData.price}</span>
                  </div>
                </div>
              </div>

              {tourData.minSpots > 1 && <div className='w-full flex gap-2 justify-center items-center text-black font-bold rounded-xl underline md:px-16 py-2 mb-4'>
                <AlertCircle size={28} />
                Please note that this tour will not start until it reaches at least {tourData.minSpots} participants.
              </div>}

              <div className="flex justify-center items-center">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Number of Travelers
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => updateTravelerCount(numTravelers - 1)}
                      disabled={numTravelers <= 1}
                      className="w-12 h-12 bg-amber-100 text-amber-700 rounded-lg font-bold hover:bg-amber-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold text-gray-800 w-12 text-center">{numTravelers}</span>
                    <button
                      onClick={() => updateTravelerCount(numTravelers + 1)}
                      disabled={tourData.maxSpots && numTravelers >= tourData.maxSpots}
                      className="w-12 h-12 bg-amber-100 text-amber-700 rounded-lg font-bold hover:bg-amber-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleContinue}
                disabled={!validateStep1()}
                className="w-full mt-8 bg-amber-600 text-white py-4 rounded-lg font-semibold hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                Continue to Traveler Information
                <ChevronRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-6xl mx-auto">
            <button
              onClick={() => setStep(1)}
              className="mb-6 text-amber-600 hover:text-amber-700 font-medium flex items-center"
            >
              <ChevronRight className="w-5 h-5 rotate-180 mr-1" />
              Back to Tour Details
            </button>
            <div className="space-y-8">
              {travelers.map((traveler, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border-t-4 border-orange-500">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <User className="w-6 h-6 mr-2 text-orange-600" />
                    Traveler {index + 1}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prefix <span className='text-red-500'>*</span></label>
                      <select
                        required
                        value={traveler.prefix}
                        onChange={(e) => updateTraveler(index, 'prefix', e.target.value)}
                        className={`w-full px-4 py-2.5 border-2 ${traveler.prefix ? "border-green-500" : "border-red-500"} rounded-lg focus:border-amber-500 focus:outline-none transition-colors`}
                      >
                        <option value="">Select</option>
                        {prefixes.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className='text-red-500'>*</span></label>
                      <input
                        required
                        type="text"
                        value={traveler.firstName}
                        onChange={(e) => updateTraveler(index, 'firstName', e.target.value)}
                        className={`w-full px-4 py-2.5 border-2 ${traveler.firstName ? "border-green-500" : "border-red-500"} rounded-lg focus:border-amber-500 focus:outline-none transition-colors`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className='text-red-500'>*</span></label>
                      <input
                        required
                        type="text"
                        value={traveler.lastName}
                        onChange={(e) => updateTraveler(index, 'lastName', e.target.value)}
                        className={`w-full px-4 py-2.5 border-2 ${traveler.lastName ? "border-green-500" : "border-red-500"} rounded-lg focus:border-amber-500 focus:outline-none transition-colors`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth <span className='text-red-500'>*</span></label>
                      <input
                        required
                        type="date"
                        value={traveler.birthDate}
                        onChange={(e) => updateTraveler(index, 'birthDate', e.target.value)}
                        className={`w-full px-4 py-2.5 border-2 ${traveler.birthDate ? "border-green-500" : "border-red-500"} rounded-lg focus:border-amber-500 focus:outline-none transition-colors`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={traveler.phone}
                        onChange={(e) => updateTraveler(index, 'phone', e.target.value)}
                        className={`w-full px-4 py-2.5 border-2 ${traveler.phone ? "border-gray-500" : "border-gray-200"} rounded-lg focus:border-amber-500 focus:outline-none transition-colors`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        Email <span className='text-red-500'>*</span>
                      </label>
                      <input
                        required
                        type="email"
                        value={traveler.email}
                        onChange={(e) => updateTraveler(index, 'email', e.target.value)}
                        className={`w-full px-4 py-2.5 border-2 ${traveler.email ? "border-green-500" : "border-red-500"} rounded-lg focus:border-amber-500 focus:outline-none transition-colors`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        Nationality
                      </label>
                      <input
                        type="text"
                        value={traveler.nationality}
                        onChange={(e) => updateTraveler(index, 'nationality', e.target.value)}
                        className={`w-full px-4 py-2.5 border-2 ${traveler.nationality ? "border-gray-500" : "border-gray-200"} rounded-lg focus:border-amber-500 focus:outline-none transition-colors`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <CreditCard className="w-4 h-4 mr-1" />
                        Passport Number
                      </label>
                      <input
                        type="text"
                        value={traveler.passport}
                        onChange={(e) => updateTraveler(index, 'passport', e.target.value)}
                        className={`w-full px-4 py-2.5 border-2 ${traveler.passport ? "border-gray-500" : "border-gray-200"} rounded-lg focus:border-amber-500 focus:outline-none transition-colors`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Passport Expiry</label>
                      <input
                        type="date"
                        value={traveler.passportExpiry}
                        onChange={(e) => updateTraveler(index, 'passportExpiry', e.target.value)}
                        className={`w-full px-4 py-2.5 border-2 ${traveler.passportExpiry ? "border-gray-500" : "border-gray-200"} rounded-lg focus:border-amber-500 focus:outline-none transition-colors`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Country <span className='text-red-500'>*</span>
                      </label>
                      <input
                        required
                        type="text"
                        value={traveler.country}
                        onChange={(e) => updateTraveler(index, 'country', e.target.value)}
                        className={`w-full px-4 py-2.5 border-2 ${traveler.country ? "border-green-500" : "border-red-500"} rounded-lg focus:border-amber-500 focus:outline-none transition-colors`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City <span className='text-red-500'>*</span></label>
                      <input
                        required
                        type="text"
                        value={traveler.city}
                        onChange={(e) => updateTraveler(index, 'city', e.target.value)}
                        className={`w-full px-4 py-2.5 border-2 ${traveler.city ? "border-green-500" : "border-red-500"} rounded-lg focus:border-amber-500 focus:outline-none transition-colors`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Province/State</label>
                      <input
                        type="text"
                        value={traveler.province}
                        onChange={(e) => updateTraveler(index, 'province', e.target.value)}
                        className={`w-full px-4 py-2.5 border-2 ${traveler.province ? "border-gray-500" : "border-gray-200"} rounded-lg focus:border-amber-500 focus:outline-none transition-colors`}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        value={traveler.address}
                        onChange={(e) => updateTraveler(index, 'address', e.target.value)}
                        className={`w-full px-4 py-2.5 border-2 ${traveler.address ? "border-gray-500" : "border-gray-200"} rounded-lg focus:border-amber-500 focus:outline-none transition-colors`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                      <input
                        type="text"
                        value={traveler.postalCode}
                        onChange={(e) => updateTraveler(index, 'postalCode', e.target.value)}
                        className={`w-full px-4 py-2.5 border-2 ${traveler.postalCode ? "border-gray-500" : "border-gray-200"} rounded-lg focus:border-amber-500 focus:outline-none transition-colors`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleContinue}
              disabled={!validateStep2()}
              className="w-full max-w-md mx-auto block mt-8 bg-amber-600 text-white py-4 rounded-lg font-semibold hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              Review Booking
              <ChevronRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-4xl mx-auto px-4">
            <button
              onClick={() => setStep(2)}
              className="mb-6 text-amber-600 hover:text-amber-700 font-medium flex items-center transition-colors"
            >
              <ChevronRight className="w-5 h-5 rotate-180 mr-1" />
              Back to Edit Information
            </button>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Header with gradient */}
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 px-8 py-12 text-center">
                <div className="w-20 h-20 bg-white rounded-full mx-auto mb-5 flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">Reservation Confirmed</h2>
                <p className="text-amber-50 text-lg flex items-center justify-center gap-2">
                  Daily Tour Booking
                  <span className="inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm">
                    <Repeat size={14} />
                    Daily
                  </span>
                </p>
              </div>

              {/* Welcome message */}
              <div className="px-8 py-6 bg-gray-50 border-b border-gray-200">
                <p className="text-gray-800 text-base mb-3">
                  Hello,
                </p>
                <p className="text-gray-600 text-base leading-relaxed">
                  Your daily tour reservation has been successfully confirmed! Below you will find all the details of your trip.
                </p>
              </div>

              {/* Tour details */}
              <div className="px-8 py-6">
                <div className="mb-5">
                  <h3 className="text-2xl font-bold text-gray-800 inline-block border-b-4 border-amber-500 pb-3">
                    Tour Details
                  </h3>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border-2 border-amber-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Tour Name</p>
                      <p className="font-semibold text-gray-900 text-base">{tourData.title}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Tour Type</p>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 text-base">{tourData.type}</p>
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                          <Repeat size={12} />
                          Daily
                        </span>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Duration</p>
                      <p className="font-semibold text-gray-900 text-base">{tourData.days} Days</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Departure Date</p>
                      <p className="font-semibold text-gray-900 text-base">
                        {startDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Return Date</p>
                      <p className="font-semibold text-gray-900 text-base">
                        {endDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Travelers</p>
                      <p className="font-semibold text-gray-900 text-base">{numTravelers} {numTravelers === 1 ? 'Person' : 'People'}</p>
                    </div>
                    <div className="md:col-span-2 bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-lg shadow-md">
                      <p className="text-xs text-green-100 uppercase tracking-wider font-semibold mb-2">Total Price</p>
                      <p className="font-bold text-white text-xl">${tourData.price * numTravelers}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Travelers information */}
              <div className="px-8 py-6">
                <div className="mb-5">
                  <h3 className="text-2xl font-bold text-gray-800 inline-block border-b-4 border-amber-500 pb-3">
                    Travelers Information
                  </h3>
                </div>
                <div className="space-y-5">
                  {travelers.map((traveler, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                      <div className="px-6 py-5 border-b-2 border-amber-500">
                        <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-full text-sm mr-3">
                            {index + 1}
                          </span>
                          {traveler.prefix} {traveler.firstName} {traveler.lastName}
                        </h4>
                      </div>
                      <div className="px-6 py-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-500">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Date of Birth</p>
                            <p className="font-medium text-gray-900 text-sm">{new Date(traveler.birthDate).toLocaleDateString('en-US')}</p>
                          </div>
                          {traveler.nationality && (
                            <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-500">
                              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Nationality</p>
                              <p className="font-medium text-gray-900 text-sm">{traveler.nationality}</p>
                            </div>
                          )}
                          {traveler.phone && (
                            <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-500">
                              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Phone</p>
                              <p className="font-medium text-gray-900 text-sm">{traveler.phone}</p>
                            </div>
                          )}
                          <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-500">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Email</p>
                            <p className="font-medium text-gray-900 text-sm">{traveler.email}</p>
                          </div>
                          {traveler.passport && (
                            <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-500">
                              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Passport</p>
                              <p className="font-medium text-gray-900 text-sm">{traveler.passport}</p>
                            </div>
                          )}
                          {traveler.passportExpiry && (
                            <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-500">
                              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Passport Expiry</p>
                              <p className="font-medium text-gray-900 text-sm">{new Date(traveler.passportExpiry).toLocaleDateString('en-US')}</p>
                            </div>
                          )}
                          <div className="md:col-span-2 bg-amber-50 p-3 rounded-lg border-l-4 border-amber-500">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Address</p>
                            <p className="font-medium text-gray-900 text-sm">{traveler.address}, {traveler.city}, {traveler.province} {traveler.postalCode}, {traveler.country}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next steps */}
              <div className="px-8 py-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-l-4 border-blue-500">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Next Steps</h3>
                  <ul className="space-y-2 text-blue-900">
                    <li className="flex items-start">
                      <span className="mr-2 mt-1">•</span>
                      <span className="leading-relaxed">You will receive a confirmation email within 24 hours</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1">•</span>
                      <span className="leading-relaxed">Our team will contact you to finalize the details</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1">•</span>
                      <span className="leading-relaxed">Prepare your travel documents</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1">•</span>
                      <span className="leading-relaxed">Your tour departs on {startDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {tourData.minSpots > 1 && <div className='w-full flex gap-2 justify-center items-center text-black font-bold rounded-xl underline md:px-16 py-2 mb-4'>
                <AlertCircle size={28} />
                Please note that this tour will not start until it reaches at least {tourData.minSpots} participants.
              </div>}

              {/* Success msg */}
              {msg && (
                <div className='w-full flex justify-center items-center mb-5'>
                  <span className='font-bold text-green-600 bg-green-50 px-6 py-3 rounded-lg'>{msg}</span>
                </div>
              )}

              {/* Confirmation button */}
              <div className="px-8 pb-8">
                <button
                  onClick={() => {
                    if(tourData.maxSpots && numTravelers > tourData.maxSpots) {
                      setMsg('Traveler > Max Spots :/');
                      return;
                    }
                    else {
                      setShowPayement(true);
                      handleFinalBooking();
                    }
                  }}
                  disabled={reservationId !== null}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="mr-2 w-6 h-6" />
                  {reservationId ? 'Reservation Confirmed' : 'Proceed to Payment'}
                </button>
              </div>

              {showPayement && (
                <div className='w-full flex justify-center items-center gap-6 mb-10'>
                  <button onClick={handleBankPayment} className='bg-amber-500 hover:bg-amber-600 duration-200 shadow-xl py-2 px-4 rounded-xl text-white font-bold'>
                    Bank transfer
                  </button>
                  <button onClick={() => setPaymentMethod('paypal')} className='bg-blue-500 hover:bg-blue-600 duration-200 shadow-xl py-2 px-4 rounded-xl text-white font-bold'>
                    Paypal payment
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {paymentMethod === 'bank' && (
          <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col gap-6">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-gray-900">
                Bank Transfer
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Secure manual payment
              </p>
            </div>

            <div className="h-px bg-gray-200" />

            <div className="space-y-3">
              {footerInfos.bank.map((info, index) => (
                <div key={index} className="flex justify-between text-gray-700">
                  <span className="font-semibold">{info.title}</span>
                  <span className="font-mono tracking-wide">
                    {info.value}
                  </span>
                </div>
              ))}

              <div className="flex justify-between text-gray-700">
                <span className="font-semibold">Total amount</span>
                <span className="font-bold">
                  {(tourData.price * numTravelers).toFixed(2)} $
                </span>
              </div>

              <div className="flex justify-between text-green-700 bg-green-50 p-3 rounded-lg">
                <span className="font-semibold">
                  Advance ({percent}%)
                </span>
                <span className="font-bold">
                  {((tourData.price * numTravelers) * percent / 100).toFixed(2)} $
                </span>
              </div>

              <p className="text-xs text-gray-500">
                The remaining balance will be paid in person on the day of the tour.
              </p>
            </div>

            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment receipt (optional)
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setReceiptImage(e.target.files[0])}
                className="w-full text-sm border border-gray-300 rounded-lg p-2 bg-white"
              />

              <button
                onClick={handleInsertImg}
                disabled={uploadLoading}
                className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {uploadLoading ? 'Uploading...' : 'Send receipt'}
              </button>

              {uploadMsg && (
                <p className="text-xs mt-3 text-gray-600 text-center">
                  {uploadMsg}
                </p>
              )}

              <p className="text-xs text-gray-500 mt-4 text-center">
                You can upload the receipt later from your profile → Reservations.
              </p>
            </div>
          </div>
        )}

        {paymentMethod === 'paypal' && (
          <div className="max-w-md mx-auto mt-6 p-6 bg-white rounded-xl shadow-xl">
            <div className='mb-6'>
              <h2 className="text-xl font-bold mb-2">Paypal Transfer Details</h2>
              <p className="text-gray-700">
                <span className="font-semibold">Total to pay:</span> {(tourData.price * numTravelers).toFixed(2)} $
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Advance payment ({percent}%):</span> {((tourData.price * numTravelers) * percent / 100).toFixed(2)} $
              </p>
              <p className="text-sm text-gray-500 mt-2">
                The remaining amount should be paid in person when you come for the tour.
              </p>
            </div>
            <PaypalCheckout
              amount={(tourData.price * numTravelers) * percent / 100}
              reservationId={reservationId}
              onSuccess={handlePaypalSuccess}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  const user = verifyAuth(req, res);

  if (user && user.id) return {
    props: { session: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email } },
  };

  else return {
    props: { session: null },
  };
}