import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Calendar, MapPin, Users, User, Clock, CheckCircle, AlertCircle, XCircle, LogOut, DollarSign, Upload, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { verifyAuth } from "@/middlewares/auth";
import { footerInfos } from "@/utils/constants";

export default function Me({ session }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [receiptImage, setReceiptImage] = useState(null);
  const [uploadMsg, setUploadMsg] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [percent, setPercent] = useState(20);
  const cardRefs = useRef([]);

  useEffect(() => {
    const fetchPercent = async () => {
      const res = await fetch("/api/payment/getPercent");
      const data = await res.json();
      setPercent(data.value)
    }
    fetchPercent();
  })

  useEffect(() => {
    cardRefs.current.forEach((card, index) => {
      gsap.fromTo(
        card,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, delay: index * 0.1, ease: "power3.out" }
      );
    });
  }, [reservations]);

  useEffect(() => {
    const fetchAllReservations = async () => {
      try {
        let allReservations = [];

        if (session?.id) {
          const res = await fetch(`/api/reservations/getMe?id=${session.id}`);
          const data = await res.json();
          if (!res.ok)
            throw new Error(data.message || "Impossible de récupérer vos réservations.");
          allReservations = data.reservations || [];
        }

        const storedId = localStorage.getItem("localReservationId");
        if (storedId) {
          const resLocal = await fetch(`/api/reservations/getID?id=${storedId}`);
          const dataLocal = await resLocal.json();
          if (resLocal.ok && dataLocal.reservations?.length)
            allReservations.push(dataLocal.reservations[0]);
        }

        setReservations(allReservations);
        console.log(allReservations);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllReservations();
  }, [session?.id]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "approved":
        return { icon: <CheckCircle className="w-5 h-5" />, color: "text-green-500", text: "Approved" };
      case "pending":
        return { icon: <Clock className="w-5 h-5" />, color: "text-yellow-500", text: "pending" };
      case "rejected":
        return { icon: <XCircle className="w-5 h-5" />, color: "text-red-500", text: "rejected" };
      default:
        return { icon: <AlertCircle className="w-5 h-5" />, color: "text-gray-500", text: "Unknown" };
    }
  };

  const handleLogout = () => {
    fetch('/api/_auth/logout').then(res => res.json()).then(data => {
      if (data.message === 'success')
        window.location.href = 'destinations';
      else
        alert(data.message)
    }).catch(err => alert(err))
  }

  const handleInsertImg = async (reservationId, amount) => {
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
          amount
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setUploadMsg('Receipt uploaded successfully.');
        setReceiptImage(null);
        setTimeout(() => {
          window.location.reload();
        }, 500);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {session && (
            <div className="mb-8 flex flex-col justify-center items-center">
              <div className="w-20 h-20 bg-white rounded-full mx-auto mb-5 flex items-center justify-center shadow-lg">
                <User className="w-10 h-10 text-amber-600" />
              </div>
              <h1 className="text-4xl font-bold text-black mb-3 tracking-tight">
                Hello, {session.prenom} {session.nom}
              </h1>
              <p className="text-amber-900 text-lg">Welcome to your profile</p>
            </div>
          )}

          {/* En-tête */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 px-8 py-12 text-center">
            <div className="w-20 h-20 bg-white rounded-full mx-auto mb-5 flex items-center justify-center shadow-lg">
              <Calendar className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">My Bookings</h2>
            <p className="text-amber-50 text-lg">Your bookings history</p>
          </div>

          {/* Contenu */}
          <div className="px-8 py-8">
            <div className="w-full flex justify-end mb-8">
              <button onClick={handleLogout} className="bg-amber-600 hover:bg-amber-700 duration-200 px-4 py-2 rounded-lg shadow-xl text-white font-bold flex gap-2">
                <LogOut />
                Logout
              </button>
            </div>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {reservations.length === 0 ?
                  <div className="text-center py-12">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">You have no bookings yet</h3>
                    <div className="mt-6">
                      <Link
                        href="destinations"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      >
                        Discover
                      </Link>
                    </div>
                  </div>
                  :
                  reservations.map((reservation, index) => (
                    <div
                      key={reservation.id}
                      ref={(el) => (cardRefs.current[index] = el)}
                      className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{reservation.titre}</h3>
                            <p className="mt-1 text-sm text-gray-500">{reservation.descr}</p>
                          </div>
                          <div className={`flex items-center ${getStatusInfo(reservation.status).color}`}>
                            {getStatusInfo(reservation.status).icon}
                            <span className="ml-1 text-sm font-medium">{getStatusInfo(reservation.status).text}</span>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="mr-2 h-4 w-4 text-amber-500" />
                            <span>
                              Du {formatDate(reservation.dateDeb)} au {formatDate(reservation.dateFin)}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="mr-2 h-4 w-4 text-amber-500" />
                            <span>{reservation.places}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="mr-2 h-4 w-4 text-amber-500" />
                            <span>{reservation.voyageurs.length} voyageur(s)</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <DollarSign className="mr-2 h-4 w-4 text-amber-500" />
                            <span>{reservation.prix} $</span>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Payment</h4>
                          {reservation.paid ?
                            <div className="w-full">
                              <div className="text-green-500 font-bold flex gap-2 items-center justify-start">
                                <CheckCircle size={18} />
                                <p>You paid</p>
                              </div>
                              <div>
                                <span className="font-bold text-black">Paid Amount : {' '}</span> {reservation.paid_amount} {reservation.currency || ''}
                              </div>
                              <div>
                                <span className="font-bold text-black">Payment Method : {' '}</span> {reservation.payment_method}
                              </div>
                            </div>
                            :
                            <div>
                              <div className="text-amber-500 font-bold flex gap-2 items-center justify-start mb-2">
                                <AlertCircle size={18} />
                                <p>You didn't pay yet</p>
                              </div>
                              <div className="flex gap-2 items-center justify-start mb-2">
                                <p className="text-black font-bold">Advance payment : {' '}</p>
                                <span>{reservation.prix * reservation.voyageurs.length * percent / 100} $</span>
                              </div>
                              <div className="flex gap-2 items-center justify-start mb-2">
                                <p className="text-black font-bold">RIB : {' '}</p>
                                <span>{footerInfos.rib}</span>
                              </div>
                              <p>* The remaining amount should be paid in person when you come for the tour *</p>
                              <div className="mt-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4">

                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Upload payment receipt (optional)
                                </label>

                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 text-green-600">
                                    <ImageIcon size={20} />
                                  </div>

                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setReceiptImage(e.target.files[0])}
                                    className="flex-1 text-sm border border-gray-300 rounded-lg p-2 bg-white"
                                  />
                                </div>

                                <button
                                  onClick={() =>
                                    handleInsertImg(
                                      reservation.id,
                                      (reservation.prix * reservation.voyageurs.length * percent) / 100
                                    )
                                  }
                                  disabled={uploadLoading}
                                  className="mt-4 w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50"
                                >
                                  <Upload size={18} />
                                  {uploadLoading ? 'Uploading...' : 'Send receipt'}
                                </button>

                                {uploadMsg && (
                                  <p className="text-xs mt-3 text-gray-600 text-center">
                                    {uploadMsg}
                                  </p>
                                )}
                              </div>
                            </div>
                          }
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Voyageurs</h4>
                          <div className="space-y-3">
                            {reservation.voyageurs.map((voyageur) => (
                              <div key={voyageur.id} className="flex items-center text-sm">
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                                  <Users className="h-4 w-4 text-amber-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{voyageur.nom} {voyageur.prenom}</p>
                                  <p className="text-gray-500">{voyageur.email}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>
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