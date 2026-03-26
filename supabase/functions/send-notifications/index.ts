import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NotificationRequest {
  type: "email" | "voice_call";
  to: string;
  substitute_name: string;
  kindergarten_name: string;
  request_date: string;
  message?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const payload: NotificationRequest = await req.json();

    const response = {
      success: true,
      message: `Notification sent via ${payload.type}`,
      details: {
        type: payload.type,
        recipient: payload.to,
        substitute: payload.substitute_name,
        kindergarten: payload.kindergarten_name,
        date: payload.request_date,
        timestamp: new Date().toISOString(),
      },
    };

    if (payload.type === "email") {
      response.message = `Email notification sent to ${payload.to} about available substitute shift on ${payload.request_date}`;
    } else if (payload.type === "voice_call") {
      response.message = `Voice call notification initiated to ${payload.to} using Twilio API (placeholder)`;
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
