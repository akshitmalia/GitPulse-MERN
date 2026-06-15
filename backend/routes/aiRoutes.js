import express from "express";
import Groq from "groq-sdk";

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function summarizeRepo(req, res) {
  try {
    const { repoName, ownerLogin, description, stars, forks, language } = req.body;

    if (!repoName || !ownerLogin) {
      return res.status(400).json({ message: "Repository name and owner are required" });
    }

    const prompt = `You are a technical writer analyzing a GitHub repository. Provide a professional and insightful summary based on the following details:

Repository: ${ownerLogin}/${repoName}
Description: ${description || "No description provided"}
Primary Language: ${language || "Not specified"}
Stars: ${stars || 0}
Forks: ${forks || 0}

Write a concise 4-5 sentence paragraph covering:
- What this project does and its core purpose based on the name and description
- The technology or language it is built with and what that suggests about the project
- Who would benefit from using or learning from this project
${stars > 0 || forks > 0
  ? `- This repository has ${stars} stars and ${forks} forks which indicates ${stars > 100 ? "strong community interest and adoption" : stars > 10 ? "growing interest from developers" : "it is an emerging project gaining attention"}`
  : "- This appears to be a personal or early stage project which shows initiative and hands-on learning"}

Write in a professional, friendly and easy to understand tone. Do not use bullet points, headers or markdown formatting. Write as a single clean paragraph only. Never say you cannot determine something — make intelligent inferences based on the repository name, description and language.`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
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