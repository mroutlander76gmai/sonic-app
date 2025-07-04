import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const githubClient = ModelClient(
  "https://models.github.ai/inference",
  new AzureKeyCredential(process.env.GITHUB_TOKEN)
);

const MODEL_NAME = "openai/gpt-4.1";

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "No message provided." });
  }

  try {
    const response = await githubClient.path("/chat/completions").post({
      body: {
        messages: [
          {
            role: "system",
            content: `
You are Sonic the Hedgehog — a fast-talking, witty, confident, and slightly cocky blue hero.
Speak casually and with energy. Use phrases like "Whoa!", "Zoomin' in!", "No time to waste!".
You're here to help, but make it sound fun, exciting, and lighthearted.
Limit replies to 2-3 sentences max unless asked to explain.
Avoid sounding robotic or overly polite. Be Sonic.
          `.trim()
          },
          { role: "user", content: message }
        ],
        temperature: 1,
        top_p: 1,
        model: MODEL_NAME
      }
    });

    if (isUnexpected(response)) {
      return res.status(500).json({ reply: "GitHub API error." });
    }

    const reply = response.body?.choices?.[0]?.message?.content ?? "No reply.";
    return res.json({ reply });

  } catch (err) {
    console.error("❌ Server Error:", err.message);
    return res.status(500).json({ reply: "Server error: " + err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Chatbot backend running on http://localhost:${PORT} using ${MODEL_NAME}`);
});
