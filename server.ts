import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Database setup
  const db = new Database("karuna_journal.db");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      user_email TEXT NOT NULL,
      content TEXT NOT NULL,
      emotion TEXT NOT NULL,
      compassion_rating INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_email) REFERENCES users(email) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS kindness_acts (
      id TEXT PRIMARY KEY,
      user_email TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_email) REFERENCES users(email) ON DELETE CASCADE
    );
  `);

  // API endpoints
  app.post("/api/auth/sync", (req, res) => {
    const { email, name } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: "Email and name are required" });
    }
    try {
      const stmt = db.prepare("INSERT OR REPLACE INTO users (email, name) VALUES (?, ?)");
      stmt.run(email, name);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/journal", (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email is required" });
    try {
      const stmt = db.prepare("SELECT * FROM journal_entries WHERE user_email = ? ORDER BY created_at DESC");
      const entries = stmt.all(email);
      res.json(entries);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/journal", (req, res) => {
    const { email, content, emotion, compassion_rating } = req.body;
    if (!email || !content || !emotion || compassion_rating === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    try {
      const id = Date.now().toString();
      const stmt = db.prepare(`
        INSERT INTO journal_entries (id, user_email, content, emotion, compassion_rating)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(id, email, content, emotion, compassion_rating);
      res.json({ id, success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/kindness", (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email is required" });
    try {
      const stmt = db.prepare("SELECT * FROM kindness_acts WHERE user_email = ? ORDER BY created_at DESC");
      const acts = stmt.all(email);
      res.json(acts);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/kindness", (req, res) => {
    const { email, title, category, description } = req.body;
    if (!email || !title || !category || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    try {
      const id = Date.now().toString();
      const stmt = db.prepare(`
        INSERT INTO kindness_acts (id, user_email, title, category, description)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(id, email, title, category, description);
      res.json({ id, success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/analytics", (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email is required" });
    try {
      // Total journal entries
      const journalCount = db.prepare("SELECT COUNT(*) as count FROM journal_entries WHERE user_email = ?").get(email) as any;
      
      // Total kindness acts
      const kindnessCount = db.prepare("SELECT COUNT(*) as count FROM kindness_acts WHERE user_email = ?").get(email) as any;
      
      // Avg compassion rating
      const avgCompassion = db.prepare("SELECT AVG(compassion_rating) as avg FROM journal_entries WHERE user_email = ?").get(email) as any;
      
      // Emotion stats
      const emotions = db.prepare("SELECT emotion, COUNT(*) as count FROM journal_entries WHERE user_email = ? GROUP BY emotion").all(email) as any[];
      
      // Kindness categories
      const categories = db.prepare("SELECT category, COUNT(*) as count FROM kindness_acts WHERE user_email = ? GROUP BY category").all(email) as any[];

      res.json({
        total_journals: journalCount?.count || 0,
        total_kindness: kindnessCount?.count || 0,
        avg_compassion: avgCompassion?.avg ? Math.round(avgCompassion.avg * 10) / 10 : 0,
        emotions,
        categories
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
