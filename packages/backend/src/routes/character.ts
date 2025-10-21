import { z } from "zod";
import {
  Character,
  CreateCharacterInput,
  UpdateCharacterInput,
} from "../lib/schemas.js";
import { protectedProcedure, router } from "../lib/trpc.js";

export const characterRouter = router({
  // Get all characters for the current user
  list: protectedProcedure.query(async ({ ctx }) => {
    const characters = await ctx.db.query<Character[]>(
      "SELECT * FROM character WHERE userId = $userId ORDER BY createdAt DESC",
      { userId: ctx.user.id },
    );
    return characters[0] || [];
  }),

  // Get a specific character by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [character] = await ctx.db.select<Character>(input.id);

      // Ensure the character belongs to the current user
      if (character?.userId !== ctx.user.id) {
        throw new Error("Character not found or access denied");
      }

      return character;
    }),

  // Create a new character
  create: protectedProcedure
    .input(CreateCharacterInput)
    .mutation(async ({ ctx, input }) => {
      const now = new Date().toISOString();
      const characterId = `character:${crypto.randomUUID()}`;

      const [character] = await ctx.db.create<Character>(characterId, {
        id: characterId,
        userId: ctx.user.id,
        ...input,
        createdAt: now,
        updatedAt: now,
      });

      return character;
    }),

  // Update a character
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: UpdateCharacterInput,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // First check if the character exists and belongs to the user
      const [existingCharacter] = await ctx.db.select<Character>(input.id);
      if (!existingCharacter || existingCharacter.userId !== ctx.user.id) {
        throw new Error("Character not found or access denied");
      }

      const now = new Date().toISOString();
      const [updatedCharacter] = await ctx.db.merge<Character>(input.id, {
        ...input.data,
        updatedAt: now,
      });

      return updatedCharacter;
    }),

  // Delete a character
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // First check if the character exists and belongs to the user
      const [existingCharacter] = await ctx.db.select<Character>(input.id);
      if (!existingCharacter || existingCharacter.userId !== ctx.user.id) {
        throw new Error("Character not found or access denied");
      }

      await ctx.db.delete(input.id);
      return { success: true };
    }),
});
