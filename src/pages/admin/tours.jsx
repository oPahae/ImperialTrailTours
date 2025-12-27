import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, MapPin, Calendar, Banknote, Users, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Loading from '@/components/Loading';
import { types } from '@/utils/constants';
import { verifyAuth } from "@/middlewares/adminAuth";

const AdminToursPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTours, setTotalTours] = useState(0);
  const [sortBy, setSortBy] = useState('price-asc');
  const limit = 9;

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString(),
          sortBy,
          ...(searchQuery && { searchTerm: searchQuery }),
          ...(filterType !== 'all' && { type: filterType }),
        }).toString();
        const response = await fetch(`/api/tours/get?${params}`);
        const data = await response.json();
        setTours(data.tours);
        setTotalTours(data.total);
      } catch (error) {
        console.error("Erreur lors de la récupération des tours :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, [currentPage, searchQuery, filterType, sortBy]);

  const totalPages = Math.ceil(totalTours / limit);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const DeleteModal = ({ tour, onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-8 shadow-2xl">
        <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
          <Trash2 size={32} className="text-red-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">Delete Tour</h3>
        <p className="text-gray-600 text-center mb-6">
          Are you sure you want to delete <strong>{tour.title}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/tours/delete?id=${selectedTour.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setTours(tours.filter(tour => tour.id !== selectedTour.id));
        setTotalTours(totalTours - 1);
        setShowDeleteModal(false);
        setSelectedTour(null);
      } else {
        console.error("Erreur lors de la suppression du tour");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Tours Management</h1>
              <p className="text-gray-600">Manage your travel experiences and tour packages</p>
            </div>
            <Link
              href="ajouterTour"
              className="inline-flex items-center justify-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors shadow-sm"
            >
              <Plus size={20} />
              Add New Tour
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by tour name or code..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div className="relative min-w-[200px]">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                >
                  <option value="all">All Types</option>
                  {types.map(type => (<option value={type}>{type}</option>))}
                </select>
              </div>
              <div className="relative min-w-[200px]">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                >
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="days-asc">Duration: Short to Long</option>
                  <option value="days-desc">Duration: Long to Short</option>
                  <option value="rating">Rating</option>
                  <option value="date">Next Date</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        {loading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-16'>
            <Loading />
            <Loading />
            <Loading />
          </div>
        ) : (
          <>
            {tours.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search size={32} className="text-gray-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No tours found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {tours.map((tour) => (
                    <div key={tour.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative h-48">
                        <img src={tour.image} alt={tour.title} className="w-full h-full object-cover" />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                            {tour.code}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="bg-amber-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                            {tour.type}
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{tour.title}</h3>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Calendar size={16} className="text-amber-600" />
                            <span>{tour.days} Days</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Banknote size={16} className="text-amber-600" />
                            <span className="font-semibold text-gray-900">{tour.price} $</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <span className="text-amber-500">★</span>
                            <span className="font-semibold text-gray-900">{Number(tour.rating).toFixed(1) || '0.0'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                          <MapPin size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-600">Next: {tour.date || 'N/A'}</span>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`modifierTour?id=${tour.id}`}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                          >
                            <Eye size={18} />
                            View
                          </Link>
                          <Link
                            href={`modifierTour?id=${tour.id}`}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
                          >
                            <Edit2 size={18} />
                            Edit
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedTour(tour);
                              setShowDeleteModal(true);
                            }}
                            className="flex items-center justify-center px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center mt-8 gap-4">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-full border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-full border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
      {showDeleteModal && selectedTour && (
        <DeleteModal
          tour={selectedTour}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedTour(null);
          }}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default AdminToursPage;

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