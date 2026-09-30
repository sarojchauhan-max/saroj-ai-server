const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(express.json({ limit: "10mb" }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.get("/", (req, res) => {
  res.send("SAROJA AI Gemini Server Running");
});

/* =========================
   CHAT
========================= */

app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message || "";

    if (
      message.toLowerCase().includes("tumko kisne banaya") ||
      message.toLowerCase().includes("tumhe kisne banaya") ||
      message.toLowerCase().includes("tumko kisne bnaya") ||
      message.toLowerCase().includes("tumhe kisne bnaya") ||
      message.toLowerCase().includes("tumko kon bnaya") ||
      message.toLowerCase().includes("who made you") ||
      message.toLowerCase().includes("who created you")
    ) {
      return res.json({
        reply: "❤️ Mujhe Saroj Brand Babu ne banaya hai."
      });
    }

    const today = new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    const prompt = `
You are SAROJA AI.

Today's date and day is:
${today}

Always use the above date/day when the user asks:
- aaj kya date hai
- aaj kon sa din hai
- today's date
- what day is today

User Message:
${message}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    const reply =
      response.text || "⚠️ AI ne koi reply nahi diya.";

    res.json({
      reply: reply
    });

  } catch (error) {
    console.log("CHAT ERROR:", error);

    const msg = String(error);

    if (msg.includes("429")) {
      return res.json({
        reply: "⚠️ Gemini quota khatam ho gaya hai. Baad me try karo."
      });
    }

    if (msg.includes("503")) {
      return res.json({
        reply: "⚠️ AI server busy hai. Kuch der baad try karo."
      });
    }

    res.status(500).json({
      reply: "⚠️ Server Error."
    });
  }
});

/* =========================
   IMAGE GENERATION
========================= */

app.post("/generate-image", async (req, res) => {
  try {
    const prompt = String(req.body.prompt || "").trim();

    if (!prompt) {
      return res.status(400).json({
        error: "Image prompt empty hai."
      });
    }

    console.log("IMAGE PROMPT:", prompt);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: prompt,
      config: {
        responseModalities: ["TEXT", "IMAGE"]
      }
    });

    let imageBase64 = null;
    let mimeType = "image/png";
    let textReply = "";

    const candidates = response.candidates || [];

    for (const candidate of candidates) {

      const parts =
        candidate.content &&
        candidate.content.parts
          ? candidate.content.parts
          : [];

      for (const part of parts) {

        if (part.text) {
          textReply += part.text;
        }

        if (part.inlineData) {

          imageBase64 = part.inlineData.data;

          if (part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
        }
      }
    }

    if (!imageBase64) {
      return res.status(500).json({
        error: "Gemini ne image return nahi ki."
      });
    }

    res.json({
      success: true,
      mimeType: mimeType,
      imageBase64: imageBase64,
      reply: textReply || "🖼️ Image generated successfully."
    });

  } catch (error) {

    console.log("IMAGE ERROR:", error);

    const msg = String(error);

    if (msg.includes("429")) {
      return res.status(429).json({
        error: "⚠️ Image generation quota khatam ho gaya hai."
      });
    }

    if (msg.includes("503")) {
      return res.status(503).json({
        error: "⚠️ Gemini image server busy hai."
      });
    }

    res.status(500).json({
      error: "⚠️ Image generation failed."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`SAROJA AI server running on port ${PORT}`);
});
