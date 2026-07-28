import { Prisma } from "@prisma/client";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }

  return "";
}

function isDatabaseUnavailable(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return (
      error.code === "P1000" ||
      error.code === "P1001" ||
      error.code === "P1017" ||
      error.code === "ECONNREFUSED"
    );
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  const message = getErrorMessage(error).toLowerCase();

  return (
    message.includes("can't reach database") ||
    message.includes("econnrefused") ||
    message.includes("connection terminated") ||
    message.includes("connect econnrefused") ||
    message.includes("invocation in") ||
    message.includes("user.upsert()") ||
    (message.includes("invalid `") && message.includes("invocation"))
  );
}

export function formatApiError(error: unknown) {
  if (error instanceof Error && error.message === "Unauthorized") {
    return {
      message: "Sign in to continue.",
      status: 401,
    };
  }

  if (isDatabaseUnavailable(error)) {
    return {
      message:
        "Database is unavailable. Start Postgres and run `npm run db:push`.",
      status: 503,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      status: 400,
    };
  }

  const message = getErrorMessage(error);

  if (message) {
    return {
      message,
      status: 400,
    };
  }

  return {
    message: "Request failed.",
    status: 400,
  };
}
