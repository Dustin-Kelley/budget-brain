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

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const { data: { user } } = await supabase.auth.getUser();

    // Define public routes that don't require authentication
    const publicRoutes = ['/sign-in', '/sign-up', '/landing'];
    
    // Check if the current route is public
    const isPublicRoute = publicRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    );

    // If user is not authenticated and trying to access a protected route
    if (!user && !isPublicRoute) {
      return NextResponse.redirect(new URL('/landing', request.url));
    }

    // If user is authenticated and trying to access a public route
    if (user && isPublicRoute) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return response;
  } catch {
    // If there's an error, redirect to landing page
    return NextResponse.redirect(new URL('/landing', request.url));
  }
};
