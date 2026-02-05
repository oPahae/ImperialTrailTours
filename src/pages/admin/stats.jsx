import { useState, useEffect } from 'react';
import { Check, Clock, X, Plus, Users, DollarSign, Calendar, MapPin, Star, TrendingUp, TrendingDown, Activity, PieChart as PieIcon, BarChart2, LineChart as LineIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { verifyAuth } from "@/middlewares/adminAuth";

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function AdminStatsPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('year');
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchStats();
    }, [timeRange, selectedYear]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/stats/get?range=${timeRange}&year=${selectedYear}`);
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const bookingTrends = {
        series: [{
            name: 'Bookings',
            data: stats?.bookingTrends
        }],
        options: {
            chart: { type: 'line', zoom: { enabled: false } },
            colors: ['#F59E0B'],
            dataLabels: { enabled: false },
            stroke: {
                curve: 'smooth', // <-- Lisser la courbe
                width: 4, // <-- Épaisseur de la ligne
            },
            title: { text: 'Booking Trends', align: 'left' },
            grid: {
                rowColors: ['#f3f3f3', 'transparent'],
                borderColor: '#f1f1f1'
            },
            xaxis: {
                categories: stats?.bookingTrendsLabels,
            },
            yaxis: {
                min: 0, // <-- Forcer l'axe Y à commencer à 0
            },
        }
    };

    const tourTypeDistribution = {
        series: stats?.tourTypeDistribution,
        options: {
            chart: {
                type: 'pie',
            },
            labels: stats?.tourTypeLabels,
            colors: ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'],
            legend: {
                position: 'bottom', // 👈 IMPORTANT
            },
            dataLabels: {
                enabled: true,
                formatter: (val) => `${val.toFixed(1)}%`,
            },
            responsive: [
                {
                    breakpoint: 768,
                    options: {
                        chart: {
                            height: 260, // 👈 taille mobile
                        },
                        legend: {
                            position: 'bottom',
                            fontSize: '12px',
                        },
                    },
                },
            ],
        },
    };

    const revenueByMonth = {
        series: [{
            name: 'Revenue',
            data: stats?.revenueByMonth
        }],
        options: {
            chart: { type: 'bar' },
            plotOptions: { bar: { horizontal: false, columnWidth: '55%' } },
            colors: ['#10B981'],
            dataLabels: { enabled: false },
            stroke: { show: true, width: 2, colors: ['transparent'] },
            xaxis: {
                categories: stats?.revenueLabels
            },
            fill: { opacity: 1 },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val.toFixed(0) + '$'
                    }
                }
            }
        }
    };

    const customerDemographics = {
        series: stats?.customerDemographics,
        options: {
            chart: {
                type: 'donut',
            },
            labels: stats?.demographicLabels,
            colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
            legend: {
                position: 'bottom',
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '65%', // 👈 réduit sur mobile
                        labels: {
                            show: false, // 👈 évite le chevauchement
                        },
                    },
                },
            },
            dataLabels: {
                enabled: false, // 👈 clé pour mobile
            },
            responsive: [
                {
                    breakpoint: 768,
                    options: {
                        chart: {
                            height: 260,
                        },
                    },
                },
            ],
        },
    };

    const popularDestinations = {
        series: [{
            data: stats?.popularDestinations
        }],
        options: {
            chart: { type: 'bar', height: 350 },
            plotOptions: { bar: { borderRadius: 4, horizontal: true } },
            dataLabels: { enabled: false },
            colors: ['#3B82F6'],
            xaxis: {
                categories: stats?.destinationLabels,
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading statistics...</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                        <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No statistics available</h3>
                        <p className="text-gray-600">There was an error loading the statistics data</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 comp">
            <div className="relative bg-gradient-to-r from-amber-700 to-amber-900 text-white">
                <div className="absolute inset-0 opacity-25">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30L0 0h60L30 30z' fill='%23ffffff' fill-opacity='0.1'/%3E%3C/svg%3E")`,
                        backgroundSize: '60px 60px'
                    }}></div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative">
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">Site Statistics</h1>
                            <p className="text-gray-600">Comprehensive analytics and insights for your travel business</p>
                        </div>
                        {activeTab !== 'overview' && activeTab !== 'revenue' &&
                            <div className="flex gap-3">
                                <select
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
                                >
                                    <option value="week">Last 7 Days</option>
                                    <option value="month">Last 30 Days</option>
                                    <option value="quarter">Last 3 Months</option>
                                    <option value="year">Last Year</option>
                                </select>
                            </div>
                        }
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 mb-8">
                        <div className="flex overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`flex-1 py-3 px-4 text-center font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${activeTab === 'overview' ? 'bg-amber-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <BarChart2 className="w-4 h-4" />
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('bookings')}
                                className={`flex-1 py-3 px-4 text-center font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${activeTab === 'bookings' ? 'bg-amber-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <Calendar className="w-4 h-4" />
                                Bookings
                            </button>
                            <button
                                onClick={() => setActiveTab('revenue')}
                                className={`flex-1 py-3 px-4 text-center font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${activeTab === 'revenue' ? 'bg-amber-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <DollarSign className="w-4 h-4" />
                                Income
                            </button>
                            <button
                                onClick={() => setActiveTab('tours')}
                                className={`flex-1 py-3 px-4 text-center font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${activeTab === 'tours' ? 'bg-amber-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <MapPin className="w-4 h-4" />
                                Tours
                            </button>
                        </div>
                    </div>
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-900">Booking Trends</h3>
                                <div className="flex gap-4 items-center">
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                        className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
                                    >
                                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="flex gap-2">
                                        <button className="p-2 rounded-lg hover:bg-gray-100">
                                            <LineIcon className="w-5 h-5 text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">Booking Trends</h3>
                                    <div className="flex gap-2">
                                        <button className="p-2 rounded-lg hover:bg-gray-100">
                                            <LineIcon className="w-5 h-5 text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                                <Chart
                                    options={bookingTrends.options}
                                    series={bookingTrends.series}
                                    type="line"
                                    height={350}
                                />
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold text-gray-900">Tour Type Distribution</h3>
                                        <div className="flex gap-2">
                                            <button className="p-2 rounded-lg hover:bg-gray-100">
                                                <PieIcon className="w-5 h-5 text-gray-600" />
                                            </button>
                                        </div>
                                    </div>
                                    <Chart
                                        options={tourTypeDistribution.options}
                                        series={tourTypeDistribution.series}
                                        type="pie"
                                        height={window.innerWidth < 768 ? 260 : 350}
                                    />
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold text-gray-900">Customer Demographics</h3>
                                        <div className="flex gap-2">
                                            <button className="p-2 rounded-lg hover:bg-gray-100">
                                                <PieIcon className="w-5 h-5 text-gray-600" />
                                            </button>
                                        </div>
                                    </div>
                                    <Chart
                                        options={customerDemographics.options}
                                        series={customerDemographics.series}
                                        type="donut"
                                        height={350}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'bookings' && (
                        <div className="space-y-8">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Booking Status</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-green-50 rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Confirmed</p>
                                                <p className="text-3xl font-bold text-gray-900">{stats.confirmedBookings}</p>
                                            </div>
                                            <div className="p-3 rounded-full bg-green-100">
                                                <Check className="w-6 h-6 text-green-600" />
                                            </div>
                                        </div>
                                        <p className="text-sm font-medium text-green-600">
                                            {stats.confirmedPercentage}% of total
                                        </p>
                                    </div>
                                    <div className="bg-yellow-50 rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Pending</p>
                                                <p className="text-3xl font-bold text-gray-900">{stats.pendingBookings}</p>
                                            </div>
                                            <div className="p-3 rounded-full bg-yellow-100">
                                                <Clock className="w-6 h-6 text-yellow-600" />
                                            </div>
                                        </div>
                                        <p className="text-sm font-medium text-yellow-600">
                                            {stats.pendingPercentage}% of total
                                        </p>
                                    </div>
                                    <div className="bg-red-50 rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Cancelled</p>
                                                <p className="text-3xl font-bold text-gray-900">{stats.cancelledBookings}</p>
                                            </div>
                                            <div className="p-3 rounded-full bg-red-100">
                                                <X className="w-6 h-6 text-red-600" />
                                            </div>
                                        </div>
                                        <p className="text-sm font-medium text-red-600">
                                            {stats.cancelledPercentage}% of total
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">Popular Destinations</h3>
                                    <div className="flex gap-2">
                                        <button className="p-2 rounded-lg hover:bg-gray-100">
                                            <BarChart2 className="w-5 h-5 text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                                <Chart
                                    options={popularDestinations.options}
                                    series={popularDestinations.series}
                                    type="bar"
                                    height={350}
                                />
                            </div>
                        </div>
                    )}
                    {activeTab === 'revenue' && (
                        <div className="space-y-8">
                            <div className="w-full flex justify-end">
                                <div className="flex gap-4 items-center">
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                        className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
                                    >
                                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="flex gap-2">
                                        <button className="p-2 rounded-lg hover:bg-gray-100">
                                            <LineIcon className="w-5 h-5 text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">Income by Month</h3>
                                    <div className="flex gap-2">
                                        <button className="p-2 rounded-lg hover:bg-gray-100">
                                            <BarChart2 className="w-5 h-5 text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                                <Chart
                                    options={revenueByMonth.options}
                                    series={revenueByMonth.series}
                                    type="bar"
                                    height={350}
                                />
                            </div>
                        </div>
                    )}
                    {activeTab === 'tours' && (
                        <div className="space-y-8">
                            <div className="w-full flex justify-end">
                                <div className="flex gap-4 items-center">
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                        className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
                                    >
                                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="flex gap-2">
                                        <button className="p-2 rounded-lg hover:bg-gray-100">
                                            <LineIcon className="w-5 h-5 text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Tour Performance</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {stats.topTours && stats.topTours.map((tour, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{tour.name}</div>
                                                                <div className="text-sm text-gray-500">{tour.type}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{tour.bookings}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">${tour.revenue.toLocaleString()}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <Star className="w-4 h-4 text-amber-500 mr-1" />
                                                            <span className="text-sm text-gray-900">{tour.rating}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{tour.conversion}%</div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div><div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">Seasonal Trends</h3>
                                    <div className="flex gap-2">
                                        <button className="p-2 rounded-lg hover:bg-gray-100">
                                            <LineIcon className="w-5 h-5 text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { name: 'High Season', months: 'June-August', color: 'green', bookings: stats.highSeasonBookings, revenue: stats.highSeasonRevenue, Icon: TrendingUp },
                                        { name: 'Shoulder Season', months: 'April-May, September-October', color: 'yellow', bookings: stats.shoulderSeasonBookings, revenue: stats.shoulderSeasonRevenue, Icon: Activity },
                                        { name: 'Low Season', months: 'November-March', color: 'blue', bookings: stats.lowSeasonBookings, revenue: stats.lowSeasonRevenue, Icon: TrendingDown }
                                    ].map((season, index) => (
                                        <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-semibold text-gray-900">{season.name}</h4>
                                                <div className={`p-2 rounded-full bg-${season.color}-100`}>
                                                    <season.Icon className={`w-6 h-6 text-${season.color}-600`} />
                                                </div>
                                            </div>
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-500 mb-1">Months:</p>
                                                <p className="text-sm font-medium text-gray-900">{season.months}</p>
                                            </div>
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-500 mb-1">Bookings:</p>
                                                <p className="text-lg font-bold text-gray-900">{season.bookings}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Avg. Revenue:</p>
                                                <p className="text-lg font-bold text-gray-900">
                                                    ${season.revenue.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
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