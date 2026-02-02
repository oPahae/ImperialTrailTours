import pool from '../_lib/connect';

export default async function handler(req, res) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { value } = req.body;

    if (value === undefined) {
        return res.status(400).json({ message: 'Missing value in request body' });
    }

    try {
        const [result] = await pool.query("UPDATE Percent SET value = ? LIMIT 1", [value]);

        if (result.affectedRows > 0) {
            return res.status(200).json({
                message: 'success',
                value: value
            });
        } else {
            return res.status(404).json({
                message: 'No percent value found to update'
            });
        }

    } catch (error) {
        console.error('Error updating percent:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}