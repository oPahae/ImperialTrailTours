import pool from '../_lib/connect';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { value } = req.body;

        // Validate the value
        if (value === undefined || value === null) {
            return res.status(400).json({ message: 'Value is required' });
        }

        const percentValue = parseInt(value);

        if (isNaN(percentValue) || percentValue < 0 || percentValue > 100) {
            return res.status(400).json({ message: 'Value must be a number between 0 and 100' });
        }

        // Update the percent value (assuming there's only one row)
        const [result] = await pool.query(
            "UPDATE Percent SET value = ? WHERE id = 1",
            [percentValue]
        );

        // If no rows were updated, insert a new row
        if (result.affectedRows === 0) {
            await pool.query(
                "INSERT INTO Percent (id, value) VALUES (1, ?)",
                [percentValue]
            );
        }

        return res.status(200).json({
            message: 'Payment percentage updated successfully',
            value: percentValue
        });

    } catch (error) {
        console.error('Error updating percent:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}