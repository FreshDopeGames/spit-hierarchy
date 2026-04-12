import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Create user client to get user id
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid user" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user already has a location
    const { data: existing } = await supabaseAdmin
      .from("voter_locations")
      .select("id, country, country_code, region, city")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ location: existing }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get IP from request headers (Supabase edge functions provide this)
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    console.log(`Geolocating IP for user ${user.id}`);

    // Use ip-api.com (free, no key needed, 45 req/min)
    let geoData = { country: "Unknown", countryCode: "XX", regionName: "Unknown", city: "Unknown" };

    if (clientIp !== "unknown" && clientIp !== "127.0.0.1") {
      try {
        const geoResponse = await fetch(
          `http://ip-api.com/json/${clientIp}?fields=status,country,countryCode,regionName,city`
        );
        const geoJson = await geoResponse.json();

        if (geoJson.status === "success") {
          geoData = geoJson;
        }
      } catch (geoError) {
        console.error("Geolocation lookup failed:", geoError);
      }
    }

    // Upsert into voter_locations
    const { data: location, error: upsertError } = await supabaseAdmin
      .from("voter_locations")
      .upsert(
        {
          user_id: user.id,
          country: geoData.country,
          country_code: geoData.countryCode,
          region: geoData.regionName,
          city: geoData.city,
        },
        { onConflict: "user_id" }
      )
      .select("id, country, country_code, region, city")
      .single();

    if (upsertError) {
      console.error("Upsert error:", upsertError);
      return new Response(JSON.stringify({ error: "Failed to store location" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Stored location for user ${user.id}: ${geoData.country}, ${geoData.regionName}`);

    return new Response(JSON.stringify({ location }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Geolocate error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
