import { router } from "../lib/trpc.js";
import { characterRouter } from "./character.js";
import { uploadRouter } from "./upload.js";

export const appRouter = router({
  character: characterRouter,
  upload: uploadRouter,
});

export type AppRouter = typeof appRouter;
