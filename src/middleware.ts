import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  const isDashboard = path.startsWith("/dashboard");
  const isDeveloper = path.startsWith("/developer");
  const isAdmin = path.startsWith("/admin");
  const isAuth = path.startsWith("/login") || path.startsWith("/register");

  if ((isDashboard || isDeveloper || isAdmin) && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuth && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Verificación de rol para rutas protegidas
  if (user && (isDeveloper || isAdmin || isDashboard)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;

    // Admin solo accede admin
    if (isAdmin && role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Developer area: solo developers y admins
    if (isDeveloper && role !== "developer" && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // /dashboard: solo buyers (los devs van a /developer, admin a /admin)
    if (isDashboard && role === "developer") {
      return NextResponse.redirect(new URL("/developer/apps", request.url));
    }
    if (isDashboard && role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
