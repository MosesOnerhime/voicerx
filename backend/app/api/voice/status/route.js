// ============================================================
// API ROUTE: /api/voice/status
// Check if voice AI features are available
// ============================================================

// Check if AI features are available
function isAIEnabled() {
  return process.env.OPENAI_API_KEY &&
         process.env.OPENAI_API_KEY !== 'your-openai-api-key' &&
         process.env.OPENAI_API_KEY.startsWith('sk-');
}

// GET - Check voice AI status
export async function GET() {
  const enabled = isAIEnabled();

  return Response.json({
    aiEnabled: enabled,
    message: enabled
      ? 'Voice AI features are available'
      : 'Voice AI features are not configured. Manual form entry is available.',
  });
}
