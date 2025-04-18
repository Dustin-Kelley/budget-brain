import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
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

    // Try to get the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      if (!isPublicRoute) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
      return response;
    }

    // If no session and not on public route, redirect to sign-in
    if (!session && !isPublicRoute) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    // If session exists and trying to access auth pages, redirect to home
    if (session && (request.nextUrl.pathname === '/sign-in' || request.nextUrl.pathname === '/sign-up')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return response;
  } catch (e) {
    console.error("Middleware error:", e);
    // On error, if not on public route, redirect to sign-in
    if (!publicRoutes.includes(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    return response;
  }
};
