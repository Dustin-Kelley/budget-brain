import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  // This `try/catch` block is only here for the interactive tutorial.
  // Feel free to remove once you have Supabase connected.
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    // Define public routes
    const publicRoutes = ['/sign-in', '/sign-up', '/landing'];
    const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      // If there's an auth error and we're not on a public route, redirect to sign-in
      if (error && !isPublicRoute) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }

      // If user is authenticated and trying to access auth pages
      if (user && (request.nextUrl.pathname === '/sign-in' || request.nextUrl.pathname === '/sign-up')) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      return response;
    } catch (authError) {
      console.log("🚀 ~ updateSession ~ authError:", authError)
      // If there's an auth error and we're not on a public route, redirect to sign-in
      if (!isPublicRoute) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
      return response;
    }
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    console.error("Middleware error:", e)
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
