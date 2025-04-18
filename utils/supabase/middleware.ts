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
    const { data: { user }, error } = await supabase.auth.getUser();
    console.log("🚀 ~ updateSession ~ user:", user?.id)
    console.log("🚀 ~ updateSession ~ error:", error)

    // Define public routes
    const publicRoutes = ['/sign-in', '/sign-up', '/landing'];
    const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

    // If user is not authenticated and trying to access a protected route
    if (!user && !isPublicRoute) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    // If user is authenticated and trying to access auth pages
    if (user && (request.nextUrl.pathname === '/sign-in' || request.nextUrl.pathname === '/sign-up')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return response;
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    console.log("🚀 ~ updateSession ~ error:", e)
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
