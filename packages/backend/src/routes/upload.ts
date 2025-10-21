import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { FileUpload } from '../lib/schemas.js';
import { protectedProcedure, router } from '../lib/trpc.js';

export const uploadRouter = router({
  // Upload a file (this endpoint needs to be handled separately due to multipart/form-data)
  // The actual upload will be handled by an Express endpoint

  // Get file by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [file] = await ctx.db.select<FileUpload>(input.id);

      // Ensure the file belongs to the current user
      if (file?.userId !== ctx.user.id) {
        throw new Error('File not found or access denied');
      }

      return file;
    }),

  // List user's files
  list: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const files = await ctx.db.query<FileUpload[]>(
        'SELECT * FROM file_upload WHERE userId = $userId ORDER BY createdAt DESC LIMIT $limit START $offset',
        {
          userId: ctx.user.id,
          limit: input.limit,
          offset: input.offset,
        }
      );
      return files[0] || [];
    }),

  // Delete a file
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // First check if the file exists and belongs to the user
      const [existingFile] = await ctx.db.select<FileUpload>(input.id);
      if (!existingFile || existingFile.userId !== ctx.user.id) {
        throw new Error('File not found or access denied');
      }

      // Delete the physical file
      try {
        const uploadsDir = path.join(process.cwd(), 'uploads');
        const filePath = path.join(uploadsDir, existingFile.filename);
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Error deleting physical file:', error);
        // Continue with database deletion even if physical file deletion fails
      }

      // Delete from database
      await ctx.db.delete(input.id);
      return { success: true };
    }),
});
