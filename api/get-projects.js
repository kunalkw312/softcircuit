import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // Fetch all projects from the database, ordering by the newest first
        const { rows } = await sql`
            SELECT * FROM projects 
            ORDER BY created_at DESC;
        `;

        // Send the data back to the frontend
        return res.status(200).json({ projects: rows });
        
    } catch (error) {
        console.error('Database Error:', error);
        
        // If the table doesn't exist yet (because no projects have been added), 
        // safely return an empty array instead of throwing an error.
        if (error.message.includes('relation "projects" does not exist')) {
            return res.status(200).json({ projects: [] });
        }
        
        return res.status(500).json({ message: 'Failed to fetch projects', error: error.message });
    }
}
