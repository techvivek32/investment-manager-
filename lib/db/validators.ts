/**
 * Input validation utilities for the application
 */

export const validators = {
  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^\S+@\S+\.\S+$/
    return emailRegex.test(email)
  },

  /**
   * Validate password strength
   */
  isValidPassword(password: string): boolean {
    return password.length >= 8
  },

  /**
   * Validate investment amount
   */
  isValidAmount(amount: number): boolean {
    return amount > 0 && Number.isFinite(amount)
  },

  /**
   * Validate coordinates
   */
  isValidCoordinates(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
  },

  /**
   * Sanitize input string
   */
  sanitizeInput(input: string): string {
    return input.trim().slice(0, 500)
  },

  /**
   * Validate role
   */
  isValidRole(role: string): boolean {
    return ["admin", "business_owner", "investor"].includes(role)
  },

  /**
   * Validate business status
   */
  isValidBusinessStatus(status: string): boolean {
    return ["pending", "approved", "rejected"].includes(status)
  },

  /**
   * Validate investment status
   */
  isValidInvestmentStatus(status: string): boolean {
    return ["pending", "confirmed", "cancelled"].includes(status)
  },
}
