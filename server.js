const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get("/", (req, res) => {
  res.send("SAROJA AI Gemini Server Running");
});

app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash"
    });

    const result = await model.generateContent(message);
    const reply = result.response.text();

    res.json({
      reply: reply
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
