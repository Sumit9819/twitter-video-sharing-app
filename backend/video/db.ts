import { SQLDatabase } from "encore.dev/storage/sqldb";

export const videoDB = new SQLDatabase("video", {
  migrations: "./migrations",
});
