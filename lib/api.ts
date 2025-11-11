/**
 * Get API URL based on environment
 * 
 * CORS Solution:
 * If backend doesn't have CORS enabled, requests are proxied through /api route
 * Set USE_API_PROXY=true to enable proxy (useful during development)
 * 
 * - Production: Uses /api proxy (which forwards to https://postmanage.onrender.com/api)
 * - Development: Uses http://localhost:5203/api directly
 */
const getApiUrl = (): string => {
  // Check if we should use the proxy
  const useProxy = typeof window !== 'undefined' && 
    process.env.NEXT_PUBLIC_USE_API_PROXY === 'true';
  
  if (useProxy) {
    // Use Next.js API route as proxy to avoid CORS issues
    return '/api';
  }
  
  // Use direct API URL
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5203/api';
};

const API_URL = getApiUrl();

export interface Post {
  id: number;
  name: string;
  description: string;
  image?: string;
  createdAt: string;
}

export interface PostDto {
  name: string;
  description: string;
  image?: string;
}

class PostAPI {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Common fetch options for all requests
   */
  private getFetchOptions(method: string = 'GET', body?: unknown): RequestInit {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      cache: method === 'GET' ? 'no-store' : undefined,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    return options;
  }

  /**
   * Handle fetch errors with better error messages
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = response.statusText;
      
      try {
        const error = await response.json();
        errorMessage = error.message || error.errors?.[0] || errorMessage;
      } catch {
        // Response is not JSON, use status text
      }

      if (response.status === 404) {
        throw new Error('Resource not found');
      }
      if (response.status === 401) {
        throw new Error('Unauthorized - Please log in');
      }
      if (response.status === 403) {
        throw new Error('Forbidden - You do not have permission');
      }
      if (response.status >= 500) {
        throw new Error('Server error - Please try again later');
      }

      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return undefined as unknown as T;
    }

    return response.json();
  }

  async getAll(search?: string, sortOrder?: string): Promise<Post[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (sortOrder) params.append('sortOrder', sortOrder);
    
    const url = `${this.baseUrl}/posts${params.toString() ? `?${params}` : ''}`;
    const response = await fetch(url, this.getFetchOptions());
    
    return this.handleResponse<Post[]>(response);
  }

  async getById(id: number): Promise<Post> {
    const url = `${this.baseUrl}/posts/${id}`;
    const response = await fetch(url, this.getFetchOptions());
    
    return this.handleResponse<Post>(response);
  }

  async create(data: PostDto): Promise<Post> {
    const url = `${this.baseUrl}/posts`;
    const response = await fetch(url, this.getFetchOptions('POST', data));
    
    return this.handleResponse<Post>(response);
  }

  async update(id: number, data: PostDto): Promise<Post> {
    const url = `${this.baseUrl}/posts/${id}`;
    const response = await fetch(url, this.getFetchOptions('PUT', data));
    
    return this.handleResponse<Post>(response);
  }

  async delete(id: number): Promise<void> {
    const url = `${this.baseUrl}/posts/${id}`;
    const response = await fetch(url, this.getFetchOptions('DELETE'));
    
    await this.handleResponse<void>(response);
  }
}

export const postAPI = new PostAPI(API_URL);
