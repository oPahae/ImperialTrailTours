import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Calendar, MapPin, Users, User, Clock, CheckCircle, AlertCircle, XCircle, LogOut, DollarSign } from "lucide-react";
import Link from "next/link";
import { verifyAuth } from "@/middlewares/auth";

export default function Me({ session }) {
  const [reservations, setReservations] = useState([]);
  const [localReservation, setLocalReservation] = useState({});
  const [showLocalReservation, setShowLocalReservation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cardRefs = useRef([]);

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
    const fetchReservations = async () => {
      try {
        const response = await fetch(`/api/reservations/getMe?id=${session ? session.id : null}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Impossible de récupérer vos réservations.");
        }
        setReservations(data.reservations);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchLocalReservations = async (id) => {
      try {
        const response = await fetch(`/api/reservations/getID?id=${id}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Impossible de récupérer vos réservations.");
        }
        setLocalReservation(data.reservations[0]);
        setShowLocalReservation(true);
        console.log(data.reservations[0])
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
    const stored = localStorage.getItem('localReservationId');
    if(stored) fetchLocalReservations(stored);
  }, []);

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
                <span className="font-bold text-amber-400">My reservations</span>
                <hr />
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

                {showLocalReservation &&
                  <>
                    <span className="font-bold text-amber-400">My reservations without account</span>
                    <hr />
                    <div
                      key={localReservation.id}
                      className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{localReservation.titre}</h3>
                            <p className="mt-1 text-sm text-gray-500">{localReservation.descr}</p>
                          </div>
                          <div className={`flex items-center ${getStatusInfo(localReservation.status).color}`}>
                            {getStatusInfo(localReservation.status).icon}
                            <span className="ml-1 text-sm font-medium">{getStatusInfo(localReservation.status).text}</span>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="mr-2 h-4 w-4 text-amber-500" />
                            <span>
                              From {formatDate(localReservation.dateDeb)} to {formatDate(localReservation.dateFin)}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="mr-2 h-4 w-4 text-amber-500" />
                            <span>{localReservation.places}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="mr-2 h-4 w-4 text-amber-500" />
                            <span>{localReservation.voyageurs.length} traveler(s)</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <DollarSign className="mr-2 h-4 w-4 text-amber-500" />
                            <span>{localReservation.prix} $</span>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Travelers</h4>
                          <div className="space-y-3">
                            {localReservation.voyageurs.map((voyageur) => (
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
                  </>
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

  if (user) return {
    props: { session: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email } },
  };

  else return {
    props: { session: null },
  };
}