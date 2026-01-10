// ============================================================
// API ROUTE: /api/notifications/stream
// PRD Section 5.7: Real-Time Notifications
// ============================================================
// PURPOSE: Server-Sent Events endpoint for real-time notifications
// WHO CAN ACCESS: All authenticated users
// ============================================================

import { verifyToken } from '@/lib/auth';
import { addClient, removeClient } from '@/lib/notifications';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  // 1. AUTHENTICATION
  const authHeader = request.headers.get('authorization');
  const cookieToken = request.cookies.get('auth-token')?.value;
  const token = authHeader?.split(' ')[1] || cookieToken;

  // Also check for token in query params (for EventSource which can't set headers)
  const { searchParams } = new URL(request.url);
  const queryToken = searchParams.get('token');
  const finalToken = token || queryToken;

  if (!finalToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const decoded = await verifyToken(finalToken);
  if (!decoded || !decoded.hospitalId) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }

  const hospitalId = decoded.hospitalId;
  const userId = decoded.userId;
  const userRole = decoded.role;

  // 2. CREATE SSE STREAM
  const stream = new ReadableStream({
    start(controller) {
      // Register this client
      addClient(hospitalId, userId, controller);

      // Send initial connection message
      const connectMsg = {
        type: 'connected',
        data: {
          message: 'Connected to notification stream',
          userId,
          role: userRole,
        },
        timestamp: new Date().toISOString(),
      };
      controller.enqueue(
        new TextEncoder().encode(`data: ${JSON.stringify(connectMsg)}\n\n`)
      );

      // Keep connection alive with heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(
            new TextEncoder().encode(`: heartbeat ${Date.now()}\n\n`)
          );
        } catch (e) {
          clearInterval(heartbeat);
        }
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        removeClient(hospitalId, userId, controller);
        try {
          controller.close();
        } catch (e) {
          // Already closed
        }
      });
    },
  });

  // 3. RETURN SSE RESPONSE
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
