import { createHTTPServer } from "@trpc/server/adapters/standalone";
import cors from "cors";
import dotenv from "dotenv";
import { connectToDatabase, disconnectFromDatabase } from "./lib/db.js";
import { createContext } from "./lib/trpc.js";
import { startUploadServer } from "./lib/upload-server.js";
import { appRouter } from "./routes/index.js";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const WS_PORT = process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 3002;
const UPLOAD_PORT = process.env.UPLOAD_PORT
  ? parseInt(process.env.UPLOAD_PORT)
  : 3003;

async function main() {
  // Connect to SurrealDB
  await connectToDatabase();

  // Create HTTP server with CORS
  const server = createHTTPServer({
    router: appRouter,
    createContext,
    middleware: cors({
      origin:
        process.env.NODE_ENV === "production"
          ? ["https://your-frontend-domain.com"] // Replace with your actual frontend domain
          : ["http://localhost:3000", "http://127.0.0.1:3000"],
      credentials: true,
    }),
  });

  // Start the upload server
  await startUploadServer(UPLOAD_PORT);

  // Start the HTTP server
  server.listen(PORT, () => {
    console.log(`🚀 tRPC HTTP Server running on http://localhost:${PORT}`);
    console.log(
      `🔌 tRPC WebSocket Server running on ws://localhost:${WS_PORT}`,
    );
    console.log(`📁 Upload Server running on http://localhost:${UPLOAD_PORT}`);
    console.log(`📊 SurrealDB connection established`);
  });

  // Graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\n🛑 Shutting down servers...");
    server.close();
    await disconnectFromDatabase();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("\n🛑 Shutting down servers...");
    server.close();
    await disconnectFromDatabase();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});

