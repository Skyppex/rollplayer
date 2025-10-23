import { initTRPC, TRPCError } from "@trpc/server";
import { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import { RecordId } from "surrealdb";
import { db } from "./db.js";
import { auth } from "./firebase.js";
import { User } from "./schemas.js";

// Context type
export interface Context {
  user?: User;
  db: typeof db;
}

const users = "users";

// Create context from HTTP request
export async function createContext({
  req,
  res,
}: CreateHTTPContextOptions): Promise<Context> {
  let user: User | undefined;

  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      // Verify Firebase token
      const decodedToken = await auth.verifyIdToken(token);

      // Get or create user in SurrealDB
      const [existingUser] = await db.select<User>(
        `${users}:${decodedToken.uid}`,
      );

      if (existingUser) {
        user = existingUser;
      } else {
        // Create new user in SurrealDB
        const now = new Date();
        const newUser = await db.create<User>(
          new RecordId(users, decodedToken.uid),
          {
            id: new RecordId(users, decodedToken.uid).toString(),
            uid: decodedToken.uid,
            email: decodedToken.email || "",
            displayName: decodedToken.name,
            photoURL: decodedToken.picture,
            createdAt: now,
            updatedAt: now,
          },
        );
        user = newUser;
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      // Don't throw here, just leave user undefined
    }
  }

  return {
    user,
    db,
  };
}

// Initialize tRPC
const t = initTRPC.context<Context>().create();

// Export router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure that requires authentication
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // Now guaranteed to be defined
    },
  });
});
