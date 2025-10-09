import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleLogin } from "./routes/login";
import { handleSync } from "./routes/sync";
import { handleUpsertStudent, handleDeleteStudent, handleTestConnection, handleGetAllStudents, handleDeleteAllStudents } from "./routes/students";
import { handleUpsertGrade, handleGetAllGrades, handleDeleteAllGrades } from "./routes/grades";
import { handleUpsertAttendance, handleGetAllAttendance, handleDeleteAllAttendance } from "./routes/attendance";

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
  app.delete("/api/students", handleDeleteAllStudents);
  app.get("/api/students/test-connection", handleTestConnection);
  app.get("/api/students", handleGetAllStudents);
  app.post("/api/grades/upsert", handleUpsertGrade);
  app.get("/api/grades", handleGetAllGrades);
  app.delete("/api/grades", handleDeleteAllGrades);
  app.post("/api/attendance/upsert", handleUpsertAttendance);
  app.get("/api/attendance", handleGetAllAttendance);
  app.delete("/api/attendance", handleDeleteAllAttendance);

  return app;
}
