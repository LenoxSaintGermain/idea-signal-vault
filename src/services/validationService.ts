
import DOMPurify from 'dompurify';

export class ValidationService {
  private static instance: ValidationService;

  static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  // Sanitize HTML content to prevent XSS
  sanitizeHtml(input: string): string {
    if (typeof window !== 'undefined' && DOMPurify) {
      return DOMPurify.sanitize(input, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
        ALLOWED_ATTR: ['href']
      });
    }
    // Fallback sanitization if DOMPurify is not available
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  }

  // Validate and sanitize text input
  validateTextInput(input: string, maxLength: number = 1000): string {
    if (!input || typeof input !== 'string') {
      throw new Error('Invalid input: Text is required');
    }

    const sanitized = this.sanitizeHtml(input);
    
    if (sanitized.length > maxLength) {
      throw new Error(`Input too long: Maximum ${maxLength} characters allowed`);
    }

    return sanitized;
  }

  // Validate email format
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  validatePassword(password: string): { isValid: boolean; message: string } {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { 
        isValid: false, 
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
      };
    }

    return { isValid: true, message: 'Password is valid' };
  }

  // Validate and sanitize idea data
  validateIdeaData(data: any): any {
    return {
      title: this.validateTextInput(data.title, 200),
      summary: this.validateTextInput(data.summary, 1000),
      painPoint: data.painPoint ? this.validateTextInput(data.painPoint, 2000) : '',
      solution: data.solution ? this.validateTextInput(data.solution, 2000) : '',
      tags: Array.isArray(data.tags) ? data.tags.slice(0, 10).map((tag: string) => 
        this.validateTextInput(tag, 50)
      ) : []
    };
  }

  // Rate limiting helper
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = this.rateLimitMap.get(identifier);

    if (!record || now > record.resetTime) {
      this.rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }
}

export const validation = ValidationService.getInstance();
