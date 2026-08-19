import { sql } from '@vercel/postgres';

export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405 });
    }

    try {
        const { password, title, category, type, image, desc } = await request.json();

        if (password !== process.env.ADMIN_PASSWORD) {
            return new Response(JSON.stringify({ message: 'Unauthorized: Incorrect Password' }), { status: 401 });
        }

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

        await sql`
            INSERT INTO projects (title, category, type, image, desc)
            VALUES (${title}, ${category}, ${type}, ${image}, ${desc});
        `;

        return new Response(JSON.stringify({ message: 'Project successfully added!' }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        return new Response(JSON.stringify({ message: 'Failed to add project', error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
