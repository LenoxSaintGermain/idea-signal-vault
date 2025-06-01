
// Secure API service for handling sensitive operations
export class SecureApiService {
  private static instance: SecureApiService;
  private apiEndpoint = '/api/secure'; // This would be your backend endpoint

  static getInstance(): SecureApiService {
    if (!SecureApiService.instance) {
      SecureApiService.instance = new SecureApiService();
    }
    return SecureApiService.instance;
  }

  async formatPainPoint(rawIdea: string, userToken: string): Promise<any> {
    // Validate input
    if (!rawIdea || rawIdea.length > 5000) {
      throw new Error('Invalid input: Raw idea is required and must be under 5000 characters');
    }

    try {
      const response = await fetch(`${this.apiEndpoint}/format-pain-point`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          rawIdea: this.sanitizeInput(rawIdea)
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Secure API call failed:', error);
      throw new Error('Service temporarily unavailable. Please try again later.');
    }
  }

  private sanitizeInput(input: string): string {
    // Basic HTML/script sanitization
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  }
}
