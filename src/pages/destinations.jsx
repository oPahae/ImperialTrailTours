import React, { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, Calendar, Clock, Users, Star, X, ImageIcon, Filter, Repeat } from 'lucide-react';
import { Range } from 'react-range';
import { useRouter } from 'next/router';
import { destination, types } from '@/utils/constants';
import Link from 'next/link';
import Loading from '@/components/Loading';
import { verifyAuth } from "@/middlewares/auth";

export default function DestinationPage() {
    const router = useRouter();
    const { key } = router.query;
    const [viewMode, setViewMode] = useState({});
    const [searchTerm, setSearchTerm] = useState(key || '');
    const [sortBy, setSortBy] = useState('price-asc');
    const [filters, setFilters] = useState({
        dateFrom: '',
        dateTo: '',
        daysRange: [1, 10],
        budgetRange: [500, 5000],
        type: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const toursPerPage = 9;

    useEffect(() => {
        const fetchTours = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                params.append('page', currentPage);
                params.append('limit', toursPerPage);
                params.append('searchTerm', searchTerm);
                params.append('sortBy', sortBy);
                params.append('dateFrom', filters.dateFrom);
                params.append('dateTo', filters.dateTo);
                params.append('daysMin', filters.daysRange[0]);
                params.append('daysMax', filters.daysRange[1]);
                params.append('budgetMin', filters.budgetRange[0]);
                params.append('budgetMax', filters.budgetRange[1]);
                params.append('type', filters.type);

                const response = await fetch(`/api/tours/get?${params.toString()}`);
                const data = await response.json();
                setTours((data.tours || []).map(tour => {
                    if (tour.image) {
                        const base64Image = tour.image;
                        return { ...tour, image: base64Image };
                    }
                    return { ...tour, image: null };
                }));
                setTotalPages(Math.ceil(data.total / toursPerPage));
            } catch (error) {
                console.error("Erreur lors de la récupération des tours :", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTours();
    }, [currentPage, searchTerm, sortBy, filters]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

    const getGoogleMapsUrl = (places) => {
        const origin = encodeURIComponent(`${places[0]}, ${places[0]}, Morocco`);
        const dest = encodeURIComponent(`${places[places.length - 1]}, ${places[places.length - 1]}, Morocco`);
        const waypoints = places.slice(1, -1).map(p => encodeURIComponent(`${p}, ${p}, Morocco`)).join('|');
        return `https://www.google.com/maps/embed/v1/directions?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&origin=${origin}&destination=${dest}${waypoints ? '&waypoints=' + waypoints : ''}&mode=driving`;
    };

    const filteredAndSortedTours = useMemo(() => {
        let result = tours.filter(tour => {
            const matchesSearch = tour.places.some(p => p.toLowerCase().includes(searchTerm.toLowerCase())) ||
                tour.title.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Pour les tours daily, on vérifie si dateStart existe et est dans le futur
            const isFutureDate = tour.daily 
                ? (tour.date && new Date(tour.date) >= new Date())
                : (tour.dateMax && new Date(tour.dateMax) >= new Date());
            
            const matchesDate = (!filters.dateFrom || new Date(tour.date) >= new Date(filters.dateFrom)) &&
                (!filters.dateTo || new Date(new Date(tour.date).setDate(new Date(tour.date).getDate() + tour.days)) <= new Date(filters.dateTo));
            const matchesDays =
                tour.days >= filters.daysRange[0] && tour.days <= filters.daysRange[1];
            const matchesBudget =
                tour.price >= filters.budgetRange[0] && tour.price <= filters.budgetRange[1];
            const matchesType = !filters.type || tour.type === filters.type;
            return isFutureDate && matchesSearch && matchesDate && matchesDays && matchesBudget && matchesType;
        });
        result.sort((a, b) => {
            switch (sortBy) {
                case 'price-asc': return a.price - b.price;
                case 'price-desc': return b.price - a.price;
                case 'days-asc': return a.days - b.days;
                case 'days-desc': return b.days - a.days;
                case 'rating': return b.rating - a.rating;
                case 'date': return new Date(a.date) - new Date(b.date);
                default: return 0;
            }
        });
        return result;
    }, [tours, searchTerm, sortBy, filters]);

    const toggleView = (tourId) => {
        setViewMode(prev => ({ ...prev, [tourId]: prev[tourId] === 'map' ? 'image' : 'map' }));
    };

    const resetFilters = () => {
        setFilters({
            dateFrom: '',
            dateTo: '',
            daysRange: [1, 10],
            budgetRange: [500, 5000],
            type: ''
        });
    };

    const goToPage = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white comp">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-amber-700 to-amber-900 text-white">
                <div className="absolute inset-0 opacity-25">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30L0 0h60L30 30z' fill='%23ffffff' fill-opacity='0.1'/%3E%3C/svg%3E")`,
                        backgroundSize: '60px 60px'
                    }}></div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative">
                    <div className="flex items-center gap-3 mb-4 mt-10">
                        <MapPin className="w-8 h-8" />
                        <h1 className="text-4xl sm:text-5xl font-bold">{destination.name}</h1>
                    </div>
                    <p className="text-lg sm:text-xl text-amber-50 max-w-3xl leading-relaxed">
                        {destination.descr}
                    </p>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Search and Filters */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row gap-4 mb-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search for a tour or destination..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                            />
                            {searchTerm && <X onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full cursor-pointer font-bold text-amber-400 bg-amber-600/20 hover:text-white hover:bg-amber-600 duration-150 p-1 w-6 h-6" />}
                        </div>
                        <div className="flex gap-3 flex-col md:flex-row">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="px-6 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-amber-500 transition flex items-center gap-2 font-medium"
                            >
                                <Filter className="w-5 h-5" />
                                Filters
                            </button>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-6 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none font-medium"
                            >
                                <option value="def">Default</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="days-asc">Duration: Short to Long</option>
                                <option value="days-desc">Duration: Long to Short</option>
                                <option value="rating">Top Rated</option>
                                <option value="date">Date</option>
                            </select>
                        </div>
                    </div>
                    {showFilters && (
                        <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={filters.dateFrom}
                                        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                    <input
                                        type="date"
                                        value={filters.dateTo}
                                        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                                    <select
                                        value={filters.type}
                                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                                    >
                                        <option value="">All Types</option>
                                        {types.map(type => (<option key={type} value={type}>{type}</option>))}
                                    </select>
                                </div>
                                {/* Number of Days */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Number of Days ({filters.daysRange[0]} – {filters.daysRange[1]})
                                    </label>
                                    <Range
                                        step={1}
                                        min={1}
                                        max={15}
                                        values={filters.daysRange}
                                        onChange={(values) => setFilters({ ...filters, daysRange: values })}
                                        renderTrack={({ props, children }) => (
                                            <div
                                                {...props}
                                                className="w-full h-2 bg-gray-200 rounded-full"
                                            >
                                                <div
                                                    className="h-2 bg-amber-500 rounded-full"
                                                    style={{
                                                        width: `${(filters.daysRange[1] - filters.daysRange[0]) / (15 - 1) * 100}%`,
                                                        marginLeft: `${(filters.daysRange[0] - 1) / (15 - 1) * 100}%`
                                                    }}
                                                ></div>
                                                {children}
                                            </div>
                                        )}
                                        renderThumb={({ props, index }) => (
                                            <div
                                                {...props}
                                                key={index}
                                                className="w-4 h-4 bg-amber-600 rounded-full shadow cursor-pointer"
                                            />
                                        )}
                                    />
                                </div>
                                {/* Budget */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Budget ($) ({filters.budgetRange[0]} – {filters.budgetRange[1]})
                                    </label>
                                    <Range
                                        step={100}
                                        min={500}
                                        max={10000}
                                        values={filters.budgetRange}
                                        onChange={(values) => setFilters({ ...filters, budgetRange: values })}
                                        renderTrack={({ props, children }) => (
                                            <div
                                                {...props}
                                                className="w-full h-2 bg-gray-200 rounded-full"
                                            >
                                                <div
                                                    className="h-2 bg-amber-500 rounded-full"
                                                    style={{
                                                        width: `${(filters.budgetRange[1] - filters.budgetRange[0]) / (10000 - 500) * 100}%`,
                                                        marginLeft: `${(filters.budgetRange[0] - 500) / (10000 - 500) * 100}%`
                                                    }}
                                                ></div>
                                                {children}
                                            </div>
                                        )}
                                        renderThumb={({ props }) => (
                                            <div
                                                {...props}
                                                className="w-4 h-4 bg-amber-600 rounded-full shadow cursor-pointer"
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={resetFilters}
                                className="mt-4 px-6 py-2 text-amber-700 hover:text-amber-700 font-medium"
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}
                </div>
                {/* Tours Grid */}
                {loading ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-16'>
                        <Loading />
                        <Loading />
                        <Loading />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-16">
                            {filteredAndSortedTours.length > 0 ? (
                                filteredAndSortedTours.map((tour) => (
                                    <div key={tour.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                                        {/* Image/Map Section */}
                                        <div className="relative h-64 bg-gray-100">
                                            {viewMode[tour.id] === 'map' ? (
                                                <iframe
                                                    src={getGoogleMapsUrl(tour.places)}
                                                    className="w-full h-full"
                                                    allowFullScreen
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                ></iframe>
                                            ) : (
                                                <img
                                                    src={tour.image}
                                                    alt={tour.image}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                            <button
                                                onClick={() => toggleView(tour.id)}
                                                className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition"
                                            >
                                                {viewMode[tour.id] === 'map' ? (
                                                    <ImageIcon className="w-5 h-5 text-gray-700" />
                                                ) : (
                                                    <MapPin className="w-5 h-5 text-gray-700" />
                                                )}
                                            </button>
                                            <div className="absolute top-4 left-4 flex gap-2">
                                                <div className="bg-amber-700 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                                    {tour.type}
                                                </div>
                                                {(tour.daily === true || tour.daily === 1) && (
                                                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1.5 shadow-md">
                                                        <Repeat size={14} className="animate-pulse" />
                                                        <span>Daily</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* Content Section */}
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="text-xl font-bold text-gray-900 flex-1">{tour.title}</h3>
                                                <div className="flex items-center gap-1 ml-2">
                                                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                                    <span className="text-sm font-semibold text-gray-700">{Number(tour.rating).toFixed(1)}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="text-sm">{tour.days} days</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Calendar className="w-4 h-4" />
                                                    <span className="text-sm">
                                                        {tour.daily 
                                                            ? 'From ' + new Date(tour.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
                                                            : new Date(tour.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Users className="w-4 h-4" />
                                                    <span className="text-sm">{tour.reviews} reviews</span>
                                                </div>
                                            </div>
                                            <div className="mb-4">
                                                <p className="text-sm font-medium text-gray-700 mb-2">Itinerary:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {tour.places.map((place, idx) => (
                                                        <span key={idx} className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full border border-amber-200">
                                                            {place}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                                <div>
                                                    <p className="text-xs text-gray-500">From</p>
                                                    <p className="text-2xl font-bold text-amber-700">{tour.price} $</p>
                                                </div>
                                                <Link href={`tour?id=${tour.id}`} className="bg-gradient-to-r from-amber-700 to-amber-900 text-white px-6 py-2 rounded-lg font-semibold hover:from-amber-700 hover:to-amber-900 transition">
                                                    Book
                                                </Link>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">Code: {tour.code}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12">
                                    <p className="text-lg text-gray-600">No tours found matching your criteria.</p>
                                </div>
                            )}
                        </div>
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => goToPage(page)}
                                        className={`px-4 py-2 rounded-lg ${currentPage === page ? 'bg-amber-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
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