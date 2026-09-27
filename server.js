const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

app.use(express.json());

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

app.get("/", (req, res) => {
  res.send("SAROJA AI Gemini Server Running");
});

app.post("/chat", async (req, res) => {
  try {

    const message = req.body.message || "";

    // Creator Reply
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

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const today = new Date().toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      }
    );

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

    const result = await model.generateContent(prompt);

    const reply = result.response.text();

    res.json({
      reply: reply
    });

  } catch (error) {

    console.log(error);

    const msg = String(error);

    if (msg.includes("429")) {
      return res.json({
        reply:
          "⚠️ Aaj ka Gemini free quota khatam ho gaya hai. Thodi der baad try karo."
      });
    }

    if (msg.includes("503")) {
      return res.json({
        reply:
          "⚠️ AI server abhi busy hai. Kuch der baad try karo."
      });
    }

    res.json({
      reply:
        "⚠️ Server Error. Baad me try karo."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
