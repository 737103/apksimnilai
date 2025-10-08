import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleLogin } from "./routes/login";
import { handleSync } from "./routes/sync";
import { handleUpsertStudent, handleDeleteStudent, handleTestConnection } from "./routes/students";
import { handleUpsertGrade } from "./routes/grades";
import { handleUpsertAttendance } from "./routes/attendance";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.post("/api/login", handleLogin);
  app.post("/api/sync", handleSync);
  app.post("/api/students/upsert", handleUpsertStudent);
  app.post("/api/students/delete", handleDeleteStudent);
  app.get("/api/students/test-connection", handleTestConnection);
  app.post("/api/grades/upsert", handleUpsertGrade);
  app.post("/api/attendance/upsert", handleUpsertAttendance);

  return app;
}
