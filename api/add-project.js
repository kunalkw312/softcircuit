import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { password, title, category, type, image, desc } = req.body;

    // Secure password check using your Vercel Environment Variable
    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Unauthorized: Incorrect Password' });
    }

    try {
        // 1. Create the database table if it doesn't exist yet
        await sql`
            CREATE TABLE IF NOT EXISTS projects (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                category VARCHAR(255) NOT NULL,
                type VARCHAR(50) NOT NULL,
                image TEXT NOT NULL,
                desc TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

        // 2. Insert the new project into the table
        await sql`
            INSERT INTO projects (title, category, type, image, desc)
            VALUES (${title}, ${category}, ${type}, ${image}, ${desc});
        `;

        return res.status(200).json({ message: 'Project successfully added to the database!' });
        
    } catch (error) {
        console.error('Database Error:', error);
        return res.status(500).json({ message: 'Failed to add project', error: error.message });
    }
}
