import { router } from "../lib/trpc.js";
import { characterRouter } from "./character.js";

export const appRouter = router({
  character: characterRouter,
});

export type AppRouter = typeof appRouter;
