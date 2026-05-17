import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a medical assistant chatbot. Reply in English or Amharic depending on user language.",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer YOUR_OPENAI_API_KEY`,
        },
      }
    );

    const reply = response.data.choices[0].message.content;

    return res.json({ reply });

  } catch (error) {
    console.error("OpenAI Error:", error?.response?.data || error.message);

    return res.status(500).json({
      error: "AI service failed",
    });
  }
});

export default chatRouter;