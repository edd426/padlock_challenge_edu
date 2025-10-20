/**
 * TypeScript type definitions for Math Padlock Challenge
 */

export interface Lock {
  id: number;
  name: string;
  question: string;
  code: string;
  digits: number;
  unlocked: boolean;
}

export interface Challenge {
  locks: Lock[];
  lastUpdated?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
