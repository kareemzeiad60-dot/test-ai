import { Router } from "express";
import { db, analysesTable, usersTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import {
  CreateAnalysisBody,
  GetAnalysisParams,
  DeleteAnalysisParams,
  ListAnalysesQueryParams,
} from "@workspace/api-zod";

const router = Router();

const PREDICT_URL = process.env.PREDICT_URL ?? "http://localhost:5000/predict";

async function runPrediction(imageData: string): Promise<Array<{ breed: string; confidence: number; rank: number }>> {
  const res = await fetch(PREDICT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageData }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Predict service error ${res.status}: ${text}`);
  }
  const json = await res.json() as { predictions: Array<{ breed: string; confidence: number; rank: number }> };
  return json.predictions;
}

router.get("/analyses/stats", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const userId = req.user!.id;

  const allAnalyses = await db
    .select()
    .from(analysesTable)
    .where(eq(analysesTable.userId, userId))
    .orderBy(desc(analysesTable.createdAt));

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthCount = allAnalyses.filter(a => new Date(a.createdAt) >= startOfMonth).length;

  const breedCounts: Record<string, number> = {};
  let totalConf = 0;
  for (const a of allAnalyses) {
    breedCounts[a.topBreed] = (breedCounts[a.topBreed] || 0) + 1;
    totalConf += a.topConfidence;
  }
  const mostCommonBreed = Object.keys(breedCounts).sort((a, b) => breedCounts[b] - breedCounts[a])[0] ?? null;
  const avgConfidence = allAnalyses.length > 0 ? totalConf / allAnalyses.length : 0;

  const recentAnalyses = allAnalyses.slice(0, 5).map(a => ({
    ...a,
    predictions: a.predictions as Array<{ breed: string; confidence: number; rank: number }>,
    createdAt: a.createdAt.toISOString(),
    imageData: null,
  }));

  return res.json({
    totalAnalyses: allAnalyses.length,
    thisMonthAnalyses: thisMonthCount,
    mostCommonBreed,
    avgConfidence: Math.round(avgConfidence * 1000) / 1000,
    recentAnalyses,
  });
});

router.get("/analyses/breed-stats", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const userId = req.user!.id;

  const analyses = await db
    .select({ topBreed: analysesTable.topBreed })
    .from(analysesTable)
    .where(eq(analysesTable.userId, userId));

  const breedCounts: Record<string, number> = {};
  for (const a of analyses) {
    breedCounts[a.topBreed] = (breedCounts[a.topBreed] || 0) + 1;
  }

  const result = Object.entries(breedCounts)
    .map(([breed, count]) => ({ breed, count }))
    .sort((a, b) => b.count - a.count);

  return res.json(result);
});

router.get("/analyses", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const parsed = ListAnalysesQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit ?? 50) : 50;
  const offset = parsed.success ? (parsed.data.offset ?? 0) : 0;

  const userId = req.user!.id;
  const analyses = await db
    .select()
    .from(analysesTable)
    .where(eq(analysesTable.userId, userId))
    .orderBy(desc(analysesTable.createdAt))
    .limit(limit)
    .offset(offset);

  return res.json(
    analyses.map(a => ({
      ...a,
      predictions: a.predictions,
      createdAt: a.createdAt.toISOString(),
      imageData: null,
    }))
  );
});

router.post("/analyses", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const parsed = CreateAnalysisBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const { imageData, imageName, notes } = parsed.data;
  const userId = req.user!.id;

  const predictions = await runPrediction(imageData);
  const topPrediction = predictions[0];

  await db.insert(usersTable).values({
    id: userId,
    email: req.user!.email ?? null,
    firstName: req.user!.firstName ?? null,
    lastName: req.user!.lastName ?? null,
    profileImageUrl: req.user!.profileImageUrl ?? null,
  }).onConflictDoNothing();

  const [inserted] = await db
    .insert(analysesTable)
    .values({
      userId,
      imageData,
      imageName: imageName ?? null,
      topBreed: topPrediction.breed,
      topConfidence: topPrediction.confidence,
      predictions,
      notes: notes ?? null,
    })
    .returning();

  return res.status(201).json({
    ...inserted,
    predictions: inserted.predictions,
    createdAt: inserted.createdAt.toISOString(),
  });
});

router.get("/analyses/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const parsed = GetAnalysisParams.safeParse({ id: req.params.id });
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid id" });
  }
  const userId = req.user!.id;
  const [analysis] = await db
    .select()
    .from(analysesTable)
    .where(and(eq(analysesTable.id, parsed.data.id), eq(analysesTable.userId, userId)));

  if (!analysis) {
    return res.status(404).json({ error: "Analysis not found" });
  }

  return res.json({
    ...analysis,
    predictions: analysis.predictions,
    createdAt: analysis.createdAt.toISOString(),
  });
});

router.delete("/analyses/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const parsed = DeleteAnalysisParams.safeParse({ id: req.params.id });
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid id" });
  }
  const userId = req.user!.id;
  const deleted = await db
    .delete(analysesTable)
    .where(and(eq(analysesTable.id, parsed.data.id), eq(analysesTable.userId, userId)))
    .returning();

  if (deleted.length === 0) {
    return res.status(404).json({ error: "Analysis not found" });
  }

  return res.json({ success: true });
});

router.get("/analyses/:id/breed-distribution", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const userId = req.user!.id;
  const analyses = await db
    .select({ topBreed: analysesTable.topBreed })
    .from(analysesTable)
    .where(eq(analysesTable.userId, userId));

  const breedCounts: Record<string, number> = {};
  for (const a of analyses) {
    breedCounts[a.topBreed] = (breedCounts[a.topBreed] || 0) + 1;
  }

  return res.json(
    Object.entries(breedCounts)
      .map(([breed, count]) => ({ breed, count }))
      .sort((a, b) => b.count - a.count)
  );
});

export default router;
