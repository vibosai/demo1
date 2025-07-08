export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // Check if API key is available
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.error('OPENAI_API_KEY environment variable is not set');
            return Response.json({
                error: 'API key not configured'
            }, { status: 500 });
        }

        const res = await fetch('https://api.openai.com/v1/realtime/sessions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-realtime-preview-2025-06-03',
                voice: "verse"
            }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error('OpenAI API Error:', res.status, errorText);
            // Log headers for more debugging info
            console.error('Response Headers:', JSON.stringify(Object.fromEntries(res.headers.entries())));
            return Response.json({
                error: `OpenAI API Error: ${res.status} - ${errorText}`,
                headers: Object.fromEntries(res.headers.entries())
            }, { status: res.status });
        }

        const data = await res.json();

        return Response.json({ data });
    } catch (error) {
        console.error('Error creating realtime session:', error);
        return Response.json({
            error: 'Failed to create realtime session'
        }, { status: 500 });
    }
}