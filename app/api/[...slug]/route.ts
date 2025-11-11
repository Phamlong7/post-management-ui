/**
 * API Proxy Route for Post Management Backend
 * 
 * This file proxies requests to the backend API to avoid CORS issues.
 * When backend enables CORS properly, you can remove this and use direct API calls.
 * 
 * Usage: http://localhost:3000/api/posts instead of https://postmanage.onrender.com/api/posts
 */

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://postmanage.onrender.com/api'
    : 'http://localhost:5203/api');

async function handler(request: Request) {
  // Get the path from the request
  const url = new URL(request.url);
  const pathname = url.pathname.replace('/api/', '');
  const searchParams = url.searchParams.toString();
  
  // Build the backend URL
  const backendUrl = `${BACKEND_API_URL}/${pathname}${searchParams ? `?${searchParams}` : ''}`;
  
  console.log(`Proxying ${request.method} to ${backendUrl}`);
  
  try {
    // Forward the request to backend
    const response = await fetch(backendUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization headers if present
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization') || '',
        }),
      },
      // Only include body for non-GET requests
      ...(request.method !== 'GET' && {
        body: await request.text(),
      }),
    });
    
    // Return the response
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': 'application/json',
        // IMPORTANT: Add CORS headers for frontend
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to proxy request to backend',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Export handler for all HTTP methods
export { handler as GET, handler as POST, handler as PUT, handler as DELETE };

// Handle preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
