import pool from '../_lib/connect';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { range = 'month', year } = req.query;

    try {
        const connection = await pool.getConnection();

        // Calculer les dates en fonction du range
        const now = new Date();
        let startDate;

        switch (range) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'quarter':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case 'year':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        // Formater la date pour MySQL
        const formattedStartDate = startDate.toISOString().split('T')[0];

        // === BOOKINGS STATS ===
        const [totalBookingsResult] = await connection.query(
            'SELECT COUNT(*) as count FROM Reservations WHERE dateReserv >= ?',
            [formattedStartDate]
        );
        const totalBookings = totalBookingsResult[0].count;

        // Bookings par statut
        const [confirmedBookings] = await connection.query(
            'SELECT COUNT(*) as count FROM Reservations WHERE status = "approved" AND dateReserv >= ?',
            [formattedStartDate]
        );
        const [pendingBookings] = await connection.query(
            'SELECT COUNT(*) as count FROM Reservations WHERE status = "pending" AND dateReserv >= ?',
            [formattedStartDate]
        );
        const [cancelledBookings] = await connection.query(
            'SELECT COUNT(*) as count FROM Reservations WHERE status = "rejected" AND dateReserv >= ?',
            [formattedStartDate]
        );

        const confirmedCount = confirmedBookings[0].count;
        const pendingCount = pendingBookings[0].count;
        const cancelledCount = cancelledBookings[0].count;

        // === REVENUE STATS ===
        const [revenueResult] = await connection.query(
            `SELECT SUM(d.prix) as totalRevenue 
             FROM Reservations r 
             JOIN Dates d ON r.dateR = d.id 
             WHERE r.status = "confirmed" AND r.dateReserv >= ?`,
            [formattedStartDate]
        );
        const totalRevenue = revenueResult[0].totalRevenue || 0;

        // Revenue par mois
        const [revenueByMonthResult] = await connection.query(
            `SELECT 
                DATE_FORMAT(r.dateReserv, '%b') as month,
                SUM(d.prix) as revenue
             FROM Reservations r 
             JOIN Dates d ON r.dateR = d.id 
             WHERE r.status = "approved" AND YEAR(r.dateReserv) = ?
             GROUP BY DATE_FORMAT(r.dateReserv, '%Y-%m')
             ORDER BY DATE_FORMAT(r.dateReserv, '%Y-%m')`,
            [year]
        );

        const revenueLabels = revenueByMonthResult.map(row => row.month);
        const revenueByMonth = revenueByMonthResult.map(row => parseFloat(row.revenue));

        // === TOURS STATS ===
        const [activeTours] = await connection.query(
            'SELECT COUNT(*) as count FROM Tours'
        );

        // Distribution par type de tour
        const [tourTypeResult] = await connection.query(
            `SELECT t.type, COUNT(r.id) as count 
             FROM Tours t 
             LEFT JOIN Reservations r ON t.id = r.tourID 
             WHERE r.dateReserv >= ? OR r.dateReserv IS NULL
             GROUP BY t.type`,
            [formattedStartDate]
        );

        const tourTypeLabels = tourTypeResult.map(row => row.type || 'Other');
        const tourTypeDistribution = tourTypeResult.map(row => row.count);

        // Destinations populaires
        const [popularDestResult] = await connection.query(
            `SELECT t.places, COUNT(r.id) as count 
             FROM Tours t 
             JOIN Reservations r ON t.id = r.tourID 
             WHERE r.dateReserv >= ?
             GROUP BY t.places 
             ORDER BY count DESC 
             LIMIT 7`,
            [formattedStartDate]
        );

        const destinationLabels = popularDestResult.map(row => row.places);
        const popularDestinations = popularDestResult.map(row => row.count);

        // Top tours
        const [topToursResult] = await connection.query(
            `SELECT 
                t.titre as name,
                t.type,
                COUNT(r.id) as bookings,
                SUM(d.prix) as revenue,
                COALESCE(AVG(rt.netoiles), 0) as rating
             FROM Tours t
             LEFT JOIN Reservations r ON t.id = r.tourID AND YEAR(r.dateReserv) = ?
             LEFT JOIN Dates d ON r.dateR = d.id
             LEFT JOIN ReviewsTour rt ON t.id = rt.tourID
             GROUP BY t.id
             ORDER BY bookings DESC
             LIMIT 10`,
            [year]
        );

        const topTours = topToursResult.map(tour => ({
            name: tour.name,
            type: tour.type || 'N/A',
            bookings: tour.bookings,
            revenue: parseFloat(tour.revenue) || 0,
            rating: parseFloat(tour.rating).toFixed(1),
            conversion: ((tour.bookings / totalBookings) * 100).toFixed(1)
        }));

        // === REVIEWS STATS ===
        const [reviewsResult] = await connection.query(
            'SELECT AVG(netoiles) as avgRating, COUNT(*) as totalReviews FROM ReviewsTour'
        );
        const averageRating = parseFloat(reviewsResult[0].avgRating || 0).toFixed(1);
        const totalReviews = reviewsResult[0].totalReviews;

        // Distribution des étoiles
        const [starDistribution] = await connection.query(
            `SELECT netoiles, COUNT(*) as count 
             FROM ReviewsTour 
             GROUP BY netoiles 
             ORDER BY netoiles DESC`
        );

        const starCounts = {};
        starDistribution.forEach(row => {
            starCounts[`star${row.netoiles}Count`] = row.count;
            starCounts[`star${row.netoiles}Percentage`] = ((row.count / totalReviews) * 100).toFixed(1);
        });

        function getAllMonthsInYear(year) {
            const months = [];
            for (let month = 0; month < 12; month++) {
                const date = new Date(year, month, 1);
                months.push({
                    month: date.toLocaleString('default', { month: 'short' }),
                    yearMonth: date.toISOString().slice(0, 7) // Format 'YYYY-MM'
                });
            }
            return months;
        }

        // === BOOKING TRENDS ===
        const [bookingTrendsResult] = await connection.query(
            `SELECT
                DATE_FORMAT(dateReserv, '%Y-%m') as yearMonth,
                DATE_FORMAT(dateReserv, '%b') as month,
                COUNT(*) as count
            FROM Reservations
            WHERE YEAR(dateReserv) = ?
            AND status = 'approved'
            GROUP BY DATE_FORMAT(dateReserv, '%Y-%m')
            ORDER BY DATE_FORMAT(dateReserv, '%Y-%m')`,
            [year]
        );
        const allMonths = getAllMonthsInYear(year);
        const bookingTrendsMap = {};
        bookingTrendsResult.forEach(row => {
            bookingTrendsMap[row.yearMonth] = {
                month: row.month,
                count: row.count
            };
        });
        const bookingTrendsLabels = [];
        const bookingTrends = [];
        allMonths.forEach(({ month, yearMonth }) => {
            bookingTrendsLabels.push(month);
            bookingTrends.push(bookingTrendsMap[yearMonth]?.count || 0);
        });

        // === CUSTOMER DEMOGRAPHICS (simulé à partir des voyageurs) ===
        const [demographicsResult] = await connection.query(
            `SELECT 
                CASE 
                    WHEN TIMESTAMPDIFF(YEAR, dateN, CURDATE()) BETWEEN 18 AND 25 THEN '18-25'
                    WHEN TIMESTAMPDIFF(YEAR, dateN, CURDATE()) BETWEEN 26 AND 35 THEN '26-35'
                    WHEN TIMESTAMPDIFF(YEAR, dateN, CURDATE()) BETWEEN 36 AND 50 THEN '36-50'
                    ELSE '50+'
                END as ageGroup,
                COUNT(*) as count
             FROM Voyageurs v
             JOIN Reservations r ON v.reservID = r.id
             WHERE r.dateReserv >= ? AND v.dateN IS NOT NULL
             GROUP BY ageGroup`,
            [formattedStartDate]
        );

        const demographicLabels = demographicsResult.map(row => row.ageGroup);
        const customerDemographics = demographicsResult.map(row => row.count);

        // === CUSTOMER ACQUISITION (simulé) ===
        const totalCustomers = totalBookings;
        const directCustomers = Math.floor(totalCustomers * 0.4);
        const socialCustomers = Math.floor(totalCustomers * 0.3);
        const referralCustomers = Math.floor(totalCustomers * 0.2);
        const otherCustomers = totalCustomers - directCustomers - socialCustomers - referralCustomers;

        // === SEASONAL TRENDS ===
        const highSeasonBookings = Math.floor(totalBookings * 0.5);
        const shoulderSeasonBookings = Math.floor(totalBookings * 0.3);
        const lowSeasonBookings = totalBookings - highSeasonBookings - shoulderSeasonBookings;

        connection.release();

        // Construire la réponse
        const stats = {
            // Overview
            totalBookings,
            totalRevenue: parseFloat(totalRevenue),
            averageRating,
            totalReviews,
            activeTours: activeTours[0].count,
            totalTours: activeTours[0].count,

            // Bookings
            confirmedBookings: confirmedCount,
            pendingBookings: pendingCount,
            cancelledBookings: cancelledCount,
            confirmedPercentage: totalBookings > 0 ? ((confirmedCount / totalBookings) * 100).toFixed(1) : 0,
            pendingPercentage: totalBookings > 0 ? ((pendingCount / totalBookings) * 100).toFixed(1) : 0,
            cancelledPercentage: totalBookings > 0 ? ((cancelledCount / totalBookings) * 100).toFixed(1) : 0,

            // Trends
            bookingTrends,
            bookingTrendsLabels,

            // Tour Types
            tourTypeDistribution,
            tourTypeLabels,

            // Destinations
            popularDestinations,
            destinationLabels,

            // Revenue
            revenueByMonth,
            revenueLabels,
            tourRevenue: parseFloat(totalRevenue * 0.7),
            extraRevenue: parseFloat(totalRevenue * 0.2),
            partnershipRevenue: parseFloat(totalRevenue * 0.1),
            tourRevenuePercentage: 70,
            extraRevenuePercentage: 20,
            partnershipRevenuePercentage: 10,

            // Demographics
            customerDemographics,
            demographicLabels,

            // Customer Acquisition
            directCustomers,
            socialCustomers,
            referralCustomers,
            otherCustomers,
            directPercentage: totalCustomers > 0 ? ((directCustomers / totalCustomers) * 100).toFixed(1) : 0,
            socialPercentage: totalCustomers > 0 ? ((socialCustomers / totalCustomers) * 100).toFixed(1) : 0,
            referralPercentage: totalCustomers > 0 ? ((referralCustomers / totalCustomers) * 100).toFixed(1) : 0,
            otherPercentage: totalCustomers > 0 ? ((otherCustomers / totalCustomers) * 100).toFixed(1) : 0,

            // Top Tours
            topTours,

            // Star Distribution
            ...starCounts,

            // Seasonal
            highSeasonBookings,
            shoulderSeasonBookings,
            lowSeasonBookings,
            highSeasonRevenue: parseFloat(totalRevenue * 0.5),
            shoulderSeasonRevenue: parseFloat(totalRevenue * 0.3),
            lowSeasonRevenue: parseFloat(totalRevenue * 0.2),

            // Changes (simulé - nécessiterait une comparaison avec période précédente)
            bookingChange: 12.5,
            revenueChange: 8.3
        };

        return res.status(200).json(stats);

    } catch (error) {
        console.error('Error fetching stats:', error);
        return res.status(500).json({ message: 'Error fetching statistics', error: error.message });
    }
}