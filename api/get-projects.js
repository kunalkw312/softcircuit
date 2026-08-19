import { neon } from '@neondatabase/serverless';

export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    if (request.method !== 'GET') {
        return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405 });
    }

    try {
        // Connect to the Neon Postgres database
        const sql = neon(process.env.POSTGRES_URL);
        
        const rows = await sql`
            SELECT * FROM projects 
            ORDER BY created_at DESC;
        `;

        return new Response(JSON.stringify({ projects: rows }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        if (error.message.includes('relation "projects" does not exist')) {
            return new Response(JSON.stringify({ projects: [] }), { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        return new Response(JSON.stringify({ message: 'Failed to fetch', error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
