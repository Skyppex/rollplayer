import { z } from "zod";

// User schema
export const UserSchema = z.object({
  id: z.string(),
  uid: z.string(), // Firebase UID
  email: z.email(),
  displayName: z.string().optional(),
  photoURL: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

// Example: Character schema (for RPG context)
export const CharacterSchema = z.object({
  id: z.uuidv4(),
  userId: z.string(),
  name: z.string(),
  class: z.string(),
  level: z.number().min(1),
  stats: z.object({
    strength: z.number(),
    dexterity: z.number(),
    constitution: z.number(),
    intelligence: z.number(),
    wisdom: z.number(),
    charisma: z.number(),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Character = z.infer<typeof CharacterSchema>;

// File upload schema
export const FileUploadSchema = z.object({
  id: z.string(),
  userId: z.string(),
  filename: z.string(),
  originalName: z.string(),
  mimetype: z.string(),
  size: z.number(),
  url: z.string(),
  createdAt: z.date(),
});

export type FileUpload = z.infer<typeof FileUploadSchema>;

// Input schemas for API endpoints
export const CreateCharacterInput = CharacterSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateCharacterInput = CharacterSchema.partial().omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});
