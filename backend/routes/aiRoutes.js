import express from "express";
import Groq from "groq-sdk";

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function summarizeRepo(req, res) {
  try {
    const { repoName, ownerLogin, description, stars, forks, language, readmeText, topics } = req.body;

    if (!repoName || !ownerLogin) {
      return res.status(400).json({ message: "Repository name and owner are required" });
    }

    const hasReadme = readmeText && readmeText.trim().length > 50;

    const prompt = `You are a technical writer analyzing a GitHub repository. Your summary must be based on ACTUAL CONTENT, not assumptions from the repository name.

Repository: ${ownerLogin}/${repoName}
GitHub Description: ${description || "Not provided"}
Topics/Tags: ${topics && topics.length > 0 ? topics.join(", ") : "Not provided"}
Primary Language: ${language || "Not specified"}
Stars: ${stars || 0}
Forks: ${forks || 0}

${hasReadme
  ? `README Content (this is the PRIMARY source of truth — base your summary on this):
"""
${readmeText}
"""`
  : "No README content is available. Base your summary on the description, topics and language only. Do not guess the project's domain purely from the repository name if it could be misleading (e.g. a name like 'cantilever' or 'phoenix' may just be a project codename, not its actual technical domain)."}

Write a concise 4-5 sentence paragraph covering:
- What this project actually does, based strictly on the README/description/topics above
- The technology stack and what it suggests about the project
- Who would benefit from using or learning from this project
${stars > 0 || forks > 0
  ? `- Mention that this repository has ${stars} stars and ${forks} forks, indicating ${stars > 100 ? "strong community interest and adoption" : stars > 10 ? "growing interest from developers" : "it is an emerging project gaining attention"}`
  : "- Mention that this appears to be a personal or early stage project, showing initiative and hands-on learning"}

IMPORTANT: If the repository name suggests one meaning but the README/description clearly indicates something different, ALWAYS trust the README/description over the name. Never invent a purpose the content doesn't support. Write in a professional, friendly tone as a single clean paragraph with no bullet points or markdown formatting.`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 300,
    });

    const summary = response.choices[0]?.message?.content;

    if (!summary) {
      return res.status(500).json({ message: "No summary generated" });
    }

    res.json({ summary });
  } catch (err) {
    console.error("Groq API error:", err.message);
    res.status(500).json({ message: "Failed to generate summary" });
  }
}

router.post("/summarize", summarizeRepo);

export default router;