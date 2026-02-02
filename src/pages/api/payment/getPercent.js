import pool from '../_lib/connect';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const [rows] = await pool.query("SELECT value FROM Percent LIMIT 1");

        if (rows.length > 0) {
            return res.status(200).json({
                message: 'success',
                value: rows[0].value
            });
        } else {
            return res.status(404).json({
                message: 'No percent value found'
            });
        }

    } catch (error) {
        console.error('Error fetching percent:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}