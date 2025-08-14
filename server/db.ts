// Try standard PostgreSQL connection first, fallback to Neon if needed
import dotenv from "dotenv"
dotenv.config()

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Alternative: Use standard postgres connection to avoid Neon endpoint issues

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use standard postgres connection with SSL for Neon database
// export const sql = postgres(process.env.DATABASE_URL, {
//   max: 20,
//   idle_timeout: 30,
//   connect_timeout: 10,
//   ssl: { rejectUnauthorized: false } // Enable SSL for Neon database
// });

export const sql = postgres(process.env.DATABASE_URL, {
  max: 20,
  idle_timeout: 30,
  connect_timeout: 10,
  ssl: false,
});
export const db = drizzle(sql, { schema });