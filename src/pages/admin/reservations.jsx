import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, History, Trash2, User, Calendar, Users, Mail, Phone, MapPin, Globe, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';
import { types } from '@/utils/constants';
import { verifyAuth } from "@/middlewares/adminAuth";

export default function AdminReservations() {
  const [activeTab, setActiveTab] = useState('pending');
  const [displayImg, setDisplayImg] = useState(null);
  const [reservations, setReservations] = useState({
    pending: [],
    history: [],
    bin: []
  });
  const [expandedReservation, setExpandedReservation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [paymentPercent, setPaymentPercent] = useState(20);
  const [updatingPercent, setUpdatingPercent] = useState(false);

  useEffect(() => {
    fetchReservations();
    fetchPaymentPercent();
  }, []);

  const fetchPaymentPercent = async () => {
    try {
      const response = await fetch('/api/payment/getPercent');
      const data = await response.json();
      if (data.value) {
        setPaymentPercent(data.value);
      }
    } catch (error) {
      console.error("Error fetching payment percent:", error);
    }
  };

  const handleUpdatePercent = async () => {
    try {
      setUpdatingPercent(true);
      const response = await fetch('/api/payment/updatePercent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: parseInt(paymentPercent) }),
      });

      if (response.ok) {
        alert('Payment percentage updated successfully!');
      } else {
        alert('Failed to update payment percentage.');
      }
    } catch (error) {
      console.error("Error updating payment percent:", error);
      alert('Error updating payment percentage.');
    } finally {
      setUpdatingPercent(false);
    }
  };

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reservations/get');
      const data = await response.json();
      console.log(data)

      const organized = {
        pending: data.filter(r => r.status === 'pending'),
        history: data.filter(r => r.status === 'approved'),
        bin: data.filter(r => r.status === 'rejected')
      };

      setReservations(organized);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reservationId) => {
    try {
      const response = await fetch('/api/reservations/confirmer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: reservationId }),
      });

      if (response.ok) {
        const reservation = reservations.pending.find(r => r.id === reservationId);
        setReservations({
          ...reservations,
          pending: reservations.pending.filter(r => r.id !== reservationId),
          history: [...reservations.history, { ...reservation, status: 'approved' }]
        });
        sendMail('approve', reservation);
        alert('Reservation approved successfully!');
      }
    } catch (error) {
      console.error("Error approving reservation:", error);
    }
  };

  const handleReject = async (reservationId) => {
    try {
      const response = await fetch('/api/reservations/rejeter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: reservationId }),
      });

      if (response.ok) {
        const reservation = reservations.pending.find(r => r.id === reservationId);
        setReservations({
          ...reservations,
          pending: reservations.pending.filter(r => r.id !== reservationId),
          bin: [...reservations.bin, { ...reservation, status: 'rejected' }]
        });
        sendMail('reject', reservation);
        alert('Reservation rejected and moved to bin.');
      }
    } catch (error) {
      console.error("Error rejecting reservation:", error);
    }
  };

  const sendMail = async (type, reservation) => {
    try {
      const endpoint = type === 'approve' ? '/api/_mail/approve' : '/api/_mail/reject';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: reservation.travelers[0].email,
          tour: reservation.tourTitle,
          travelers: reservation.travelers,
          bookingRef: reservation.bookingRef,
          startDate: reservation.startDate,
          endDate: reservation.endDate,
          totalPrice: reservation.totalPrice,
        }),
      });
      if (!response.ok) {
        console.error(`Failed to send ${type} email`);
      }
    } catch (error) {
      console.error(`Error sending ${type} email:`, error);
    }
  };

  const toggleExpanded = (id) => {
    setExpandedReservation(expandedReservation === id ? null : id);
  };

  const filteredReservations = reservations[activeTab].filter(reservation => {
    const matchesSearch =
      reservation.bookingRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.tourTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.travelers.some(t =>
        `${t.firstName} ${t.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesFilter = filterType === 'all' || reservation.tourType === filterType;

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' }
    };

    const badge = badges[status];
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading reservations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {displayImg &&
        <div onClick={() => setDisplayImg('')} className='w-full h-screen fixed inset-0 z-50 cursor-pointer bg-black/20 backdrop-blur-2xl flex items-center justify-center'>
          <div className='w-full md:w-2/3 overflow-y-scroll'>
            <img src={displayImg} className='w-full' />
          </div>
        </div>
      }
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4">Reservations Management</h1>
          <p className="text-lg text-gray-600">Review, approve, or reject booking requests</p>
        </div>

        {/* Payment Percentage Configuration */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Advance Payment Percentage</h3>
              <p className="text-sm text-gray-600">Set the required upfront payment percentage for reservations</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={paymentPercent}
                  onChange={(e) => setPaymentPercent(e.target.value)}
                  className="w-24 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none text-center font-semibold text-lg"
                />
                <span className="text-2xl font-bold text-gray-700">%</span>
              </div>
              <button
                onClick={handleUpdatePercent}
                disabled={updatingPercent}
                className="bg-amber-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-amber-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {updatingPercent ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 p-2 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 min-w-[150px] py-4 px-6 rounded-lg font-semibold transition-all flex items-center justify-center ${activeTab === 'pending'
              ? 'bg-amber-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <Clock className="w-5 h-5 mr-2" />
            Pending ({reservations.pending.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 min-w-[150px] py-4 px-6 rounded-lg font-semibold transition-all flex items-center justify-center ${activeTab === 'history'
              ? 'bg-amber-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <History className="w-5 h-5 mr-2" />
            History ({reservations.history.length})
          </button>
          <button
            onClick={() => setActiveTab('bin')}
            className={`flex-1 min-w-[150px] py-4 px-6 rounded-lg font-semibold transition-all flex items-center justify-center ${activeTab === 'bin'
              ? 'bg-amber-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Bin ({reservations.bin.length})
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by booking ref, tour name, or traveler..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none transition-colors"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none transition-colors appearance-none"
              >
                <option value="all">All Tour Types</option>
                {types.map(type => (<option value={type}>{type}</option>))}
              </select>
            </div>
          </div>
        </div>

        {/* Reservations List */}
        <div className="space-y-6">
          {filteredReservations.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <p className="text-gray-500 text-lg">No reservations found in this category.</p>
            </div>
          ) : (
            filteredReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white rounded-2xl shadow-lg border-t-4 border-amber-600 overflow-hidden transition-all hover:shadow-xl"
              >
                {/* Reservation Header */}
                <div className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        {/* <h3 className="text-2xl font-bold text-gray-800">{reservation.bookingRef}</h3> */}
                        {getStatusBadge(reservation.status)}
                      </div>
                      <p className="text-lg font-semibold text-amber-700">{reservation.tourTitle}</p>
                      <p className="text-sm text-gray-600">{reservation.tourType} • {reservation.days} Days</p>

                      {reservation.payment_method === 'paypal' &&
                        <div className='mt-4 flex justify-center items-center gap-2 font-bold'>
                          <CheckCircle size={18} className='text-blue-500' />
                          <span className='text-blue-500'>Paypal</span>
                          <span>({reservation.paid_amount} {reservation.currency})</span>
                        </div>
                      }
                      
                      {reservation.img &&
                        <div className='mt-4 flex justify-center items-center gap-2 font-bold'>
                          <CheckCircle size={18} className='text-green-500' />
                          <span className='text-green-500'>Bank</span>
                          <span>({reservation.paid_amount || "0 MAD"})</span>
                          <button onClick={() => setDisplayImg(reservation.img)} className='underline'>See photo</button>
                        </div>
                      }
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Booking Date</p>
                      <p className="font-semibold text-gray-800">{new Date(reservation.bookingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Tour Dates
                      </p>
                      <p className="font-semibold text-gray-800 text-sm">
                        {new Date(reservation.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(reservation.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1 flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        Travelers
                      </p>
                      <p className="font-semibold text-gray-800">{reservation.numTravelers} {reservation.numTravelers === 1 ? 'Person' : 'People'}</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total Price</p>
                      <p className="font-semibold text-gray-800 text-lg">${reservation.totalPrice}</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Lead Traveler</p>
                      <p className="font-semibold text-gray-800 text-sm">{reservation.travelers[0].firstName} {reservation.travelers[0].lastName}</p>
                    </div>
                  </div>

                  {/* Expand/Collapse Button */}
                  <button
                    onClick={() => toggleExpanded(reservation.id)}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-colors flex items-center justify-center"
                  >
                    {expandedReservation === reservation.id ? (
                      <>
                        <ChevronUp className="w-5 h-5 mr-2" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-5 h-5 mr-2" />
                        View Full Details
                      </>
                    )}
                  </button>

                  {/* Expanded Details */}
                  {expandedReservation === reservation.id && (
                    <div className="mt-6 pt-6 border-t space-y-6">
                      <h4 className="text-xl font-bold text-gray-800 mb-4">Travelers Information</h4>
                      {reservation.travelers.map((traveler, index) => (
                        <div key={index} className="bg-gray-50 p-6 rounded-lg">
                          <h5 className="font-bold text-gray-800 mb-4 text-lg flex items-center">
                            <User className="w-5 h-5 mr-2 text-amber-600" />
                            Traveler {index + 1}: {traveler.prefix} {traveler.firstName} {traveler.lastName}
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600 flex items-center mb-1">
                                <Mail className="w-4 h-4 mr-1" />
                                Email
                              </p>
                              <p className="font-medium text-gray-800">{traveler.email}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 flex items-center mb-1">
                                <Phone className="w-4 h-4 mr-1" />
                                Phone
                              </p>
                              <p className="font-medium text-gray-800">{traveler.phone || 'N/A'}</p>
                            </div>
                            {traveler.nationality &&
                              <div>
                                <p className="text-gray-600 flex items-center mb-1">
                                  <Globe className="w-4 h-4 mr-1" />
                                  Nationality
                                </p>
                                <p className="font-medium text-gray-800">{traveler.nationality}</p>
                              </div>
                            }
                            <div>
                              <p className="text-gray-600 mb-1">Date of Birth</p>
                              <p className="font-medium text-gray-800">{new Date(traveler.birthDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <div className="md:col-span-2">
                              <p className="text-gray-600 flex items-center mb-1">
                                <MapPin className="w-4 h-4 mr-1" />
                                Address
                              </p>
                              <p className="font-medium text-gray-800">
                                {traveler.address ? `${traveler.address}, ` : ''} {traveler.city}, {traveler.province} {traveler.postalCode ? `${traveler.postalCode}, ` : ''} {traveler.country}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons (Only for Pending) */}
                  {activeTab === 'pending' && (
                    <div className="mt-6 flex flex-wrap gap-4">
                      <button
                        onClick={() => handleApprove(reservation.id)}
                        className="flex-1 min-w-[200px] bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Approve Reservation
                      </button>
                      <button
                        onClick={() => handleReject(reservation.id)}
                        className="flex-1 min-w-[200px] bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center"
                      >
                        <XCircle className="w-5 h-5 mr-2" />
                        Reject Reservation
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

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