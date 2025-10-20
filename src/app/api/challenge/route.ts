/**
 * API Routes for Challenge Management
 * GET  /api/challenge - Retrieve active challenge
 * POST /api/challenge - Save challenge (password-protected)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getActiveChallenge, saveActiveChallenge } from '@/lib/azure';
import type { Challenge, ApiResponse } from '@/lib/types';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'swordfish';

/**
 * GET /api/challenge
 * Retrieves the currently active challenge configuration
 * No authentication required for students to view
 */
export async function GET() {
  try {
    const challenge = await getActiveChallenge();

    if (!challenge) {
      return NextResponse.json({
        success: false,
        error: 'No active challenge found'
      } as ApiResponse<null>, {
        status: 404
      });
    }

    return NextResponse.json({
      success: true,
      data: challenge
    } as ApiResponse<Challenge>);
  } catch (error) {
    console.error('GET /api/challenge error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve challenge'
    } as ApiResponse<null>, {
      status: 500
    });
  }
}

/**
 * POST /api/challenge
 * Saves a challenge configuration to Azure Table Storage
 * Requires password authentication via x-admin-password header
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const passwordHeader = request.headers.get('x-admin-password');

    if (!passwordHeader || passwordHeader !== ADMIN_PASSWORD) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized: Invalid password'
      } as ApiResponse<null>, {
        status: 401
      });
    }

    // Parse request body
    const body = await request.json();

    if (!body.locks || !Array.isArray(body.locks)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request: locks array required'
      } as ApiResponse<null>, {
        status: 400
      });
    }

    // Create challenge object with locks
    const challenge: Challenge = {
      locks: body.locks,
      lastUpdated: new Date().toISOString()
    };

    // Save to Azure Table Storage
    await saveActiveChallenge(challenge);

    return NextResponse.json({
      success: true,
      data: challenge
    } as ApiResponse<Challenge>);
  } catch (error) {
    console.error('POST /api/challenge error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to save challenge'
    } as ApiResponse<null>, {
      status: 500
    });
  }
}
