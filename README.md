# RollPlayer - tRPC + SurrealDB Backend

A character management application built with React frontend and tRPC + SurrealDB backend.

## Architecture

- **Frontend**: React (packages/frontend)
- **Backend**: tRPC + SurrealDB (packages/backend)
- **Authentication**: Firebase Auth (frontend only)
- **Database**: SurrealDB (replacing Firestore)
- **Real-time**: WebSocket subscriptions via tRPC
- **File Uploads**: Express server with Multer

## Prerequisites

- [Bun](https://bun.sh/) for package management
- [SurrealDB](https://surrealdb.com/install) installed and running
- Firebase project configured

## Setup

### 1. Install Dependencies

```bash
# Install root dependencies
bun install

# Install all workspace dependencies
bun run install:all
```

### 2. Start SurrealDB

```bash
# Start SurrealDB locally
surreal start --user root --pass root
```

### 3. Configure Environment Variables

Copy the environment example and fill in your Firebase credentials:

```bash
cp packages/backend/.env.example packages/backend/.env
```

Update the following variables in `packages/backend/.env`:
```env
# Firebase Admin Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@your-project.iam.gserviceaccount.com
```

### 4. Update Frontend Firebase Config

Update the Firebase configuration in `packages/frontend/src/App.jsx` with your project credentials.

### 5. Run the Application

```bash
# Development mode (runs both frontend and backend)
bun run dev

# Or run individually:
bun run dev:frontend  # React app on http://localhost:3000
bun run dev:backend   # tRPC server on http://localhost:3001
```

## API Endpoints

The backend runs multiple servers:

- **tRPC HTTP**: `http://localhost:3001` - Main API
- **tRPC WebSocket**: `ws://localhost:3002` - Real-time subscriptions
- **Upload Server**: `http://localhost:3003` - File uploads

## Available tRPC Routes

### User Routes (`trpc.user`)
- `me()` - Get current user profile
- `updateProfile(data)` - Update user profile
- `getById(userId)` - Get user by ID

### Character Routes (`trpc.character`)
- `list()` - Get all characters for current user
- `getById(id)` - Get character by ID
- `create(data)` - Create new character
- `update(id, data)` - Update character
- `delete(id)` - Delete character
- `onUpdate()` - Real-time subscription for character updates

### Upload Routes (`trpc.upload`)
- `list(limit, offset)` - List user's files
- `getById(id)` - Get file by ID
- `delete(id)` - Delete file

### File Upload
- `POST /upload` - Upload files (multipart/form-data)
- `GET /uploads/:filename` - Serve uploaded files

## Real-time Features

The application supports real-time updates using SurrealDB's live queries and tRPC subscriptions:

```javascript
// Subscribe to character updates
const subscription = trpc.character.onUpdate.useSubscription();
```

## Database Schema

### User Table
```sql
{
  id: "user:firebase_uid",
  uid: "firebase_uid",
  email: "user@example.com",
  displayName?: "Display Name",
  photoURL?: "https://...",
  createdAt: "2023-...",
  updatedAt: "2023-..."
}
```

### Character Table
```sql
{
  id: "character:uuid",
  userId: "user:firebase_uid",
  name: "Character Name",
  class: "Fighter",
  level: 1,
  stats: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  },
  createdAt: "2023-...",
  updatedAt: "2023-..."
}
```

### File Upload Table
```sql
{
  id: "file_upload:uuid",
  userId: "user:firebase_uid",
  filename: "generated_filename.ext",
  originalName: "original_filename.ext",
  mimetype: "image/jpeg",
  size: 1024000,
  url: "/uploads/generated_filename.ext",
  createdAt: "2023-..."
}
```

## Development

### Building

```bash
# Build both frontend and backend
bun run build

# Build individually
bun run build --workspace=packages/frontend
bun run build --workspace=packages/backend
```

### Testing

```bash
# Run tests
bun run test
```

### Type Checking

The backend includes TypeScript for full type safety:

```bash
cd packages/backend
bun run type-check
```

## Production Deployment

1. Build the application
2. Set up SurrealDB in production
3. Configure environment variables
4. Deploy the built frontend and backend
5. Update CORS origins in the backend configuration

## Migration from Firebase

This setup keeps Firebase Auth for authentication while replacing Firestore with SurrealDB. The backend automatically creates users in SurrealDB when they first authenticate through Firebase.
