import { Surreal } from "surrealdb";

export const db = new Surreal();

export async function connectToDatabase() {
  try {
    // Connect to SurrealDB
    await db.connect(process.env.SURREALDB_URL || "http://127.0.0.1:8000");

    // Sign in to SurrealDB
    await db.signin({
      username: process.env.SURREALDB_USERNAME || "root",
      password: process.env.SURREALDB_PASSWORD || "root",
    });

    // Use namespace and database
    await db.use({
      namespace: process.env.SURREALDB_NAMESPACE || "rollplayer",
      database: process.env.SURREALDB_DATABASE || "main",
    });

    console.log("✅ Connected to SurrealDB");
  } catch (error) {
    console.error("❌ Failed to connect to SurrealDB:", error);
    process.exit(1);
  }
}

export async function disconnectFromDatabase() {
  try {
    await db.close();
    console.log("✅ Disconnected from SurrealDB");
  } catch (error) {
    console.error("❌ Failed to disconnect from SurrealDB:", error);
  }
}
