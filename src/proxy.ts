import {
  clerkClient,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const hasClerkConfig = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

const isPublicRoute = createRouteMatcher([
  "/private-access(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

const isApiRoute = createRouteMatcher(["/api(.*)"]);

function requestIsLocal(request: NextRequest) {
  const hostname = request.nextUrl.hostname;

  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function localOnlyProxy(request: NextRequest) {
  if (isPublicRoute(request) || requestIsLocal(request)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/private-access", request.url));
}

async function userOwnsApp(userId: string) {
  const ownerEmail = process.env.VINYLHUB_OWNER_EMAIL?.trim().toLowerCase();

  if (!ownerEmail) {
    return false;
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const emails = user.emailAddresses.map((email) =>
    email.emailAddress.toLowerCase(),
  );

  return emails.includes(ownerEmail);
}

const privateAppProxy = clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  const session = await auth();

  if (!session.userId) {
    if (isApiRoute(request)) {
      return NextResponse.json(
        { error: "Sign in to save releases to your collection." },
        { status: 401 },
      );
    }

    return session.redirectToSignIn({ returnBackUrl: request.url });
  }

  if (!(await userOwnsApp(session.userId))) {
    if (isApiRoute(request)) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    return NextResponse.redirect(new URL("/private-access", request.url));
  }

  return NextResponse.next();
});

export default hasClerkConfig ? privateAppProxy : localOnlyProxy;

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
