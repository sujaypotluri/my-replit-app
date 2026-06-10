import { Router } from "express";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/ai/generate-copy", async (req, res) => {
  const {
    campaignName,
    clientName,
    industry,
    impressions,
    ctr,
    leads,
    tone,
    additionalContext,
  } = req.body;

  const toneGuide: Record<string, string> = {
    professional: "authoritative, polished, and data-driven",
    bold: "punchy, direct, and attention-grabbing",
    playful: "friendly, witty, and approachable",
    urgent: "time-sensitive, action-oriented, and compelling",
    empathetic: "warm, understanding, and human-centered",
  };

  const perfContext = impressions != null
    ? `Campaign has generated ${Number(impressions).toLocaleString()} impressions, a ${Number(ctr).toFixed(2)}% CTR, and ${Number(leads).toLocaleString()} leads.`
    : "";

  const prompt = `You are a world-class B2B marketing copywriter. Generate high-converting ad copy for the following campaign.

Campaign: ${campaignName}
Client: ${clientName}${industry ? `\nIndustry: ${industry}` : ""}
${perfContext}
Tone: ${toneGuide[tone] ?? tone}
${additionalContext ? `Additional context: ${additionalContext}` : ""}

Respond ONLY with a JSON object in this exact shape (no markdown, no explanation):
{
  "headlines": ["<h1>", "<h2>", "<h3>"],
  "descriptions": ["<desc1>", "<desc2>", "<desc3>"],
  "ctas": ["<cta1>", "<cta2>", "<cta3>"],
  "insight": "<one sentence strategic insight about this campaign's performance>"
}

Rules:
- Headlines: max 60 chars each, punchy and benefit-led
- Descriptions: 90-150 chars each, speak to the buyer's pain or gain
- CTAs: 2-5 words each, action verbs only
- Insight: concrete observation tied to the metrics, not generic advice`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);

    res.json({
      headlines: parsed.headlines ?? [],
      descriptions: parsed.descriptions ?? [],
      ctas: parsed.ctas ?? [],
      insight: parsed.insight ?? "",
    });
  } catch (err: unknown) {
    req.log.error({ err }, "AI copy generation failed");
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default router;
