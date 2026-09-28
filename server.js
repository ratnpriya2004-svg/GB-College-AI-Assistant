const fs = require("fs");
const path = require("path");

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const app = express();

const PORT = process.env.PORT || 5000;


/* ================================
   GEMINI
================================ */

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});
/* ================================
   COLLEGE KNOWLEDGE BASE
================================ */

const collegeDataPath = path.join(
    __dirname,
    "frontend",
    "data",
    "college-info.json"
);

let collegeData = {};

try {

    collegeData = JSON.parse(
        fs.readFileSync(
            collegeDataPath,
            "utf-8"
        )
    );

    console.log(
        "✅ College knowledge base loaded."
    );

} catch (error) {

    console.error(
        "❌ Failed to load college-info.json:",
        error.message
    );

}

/* ================================
   MIDDLEWARE
================================ */

app.use(cors());

app.use(express.json());

app.use(express.static(
    path.join(__dirname, "frontend")
));

/* ================================
   ROOT
================================ */

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "frontend",
            "index.html"
        )
    );

});


/* ================================
   HEALTH CHECK
================================ */

app.get("/api/health", (req, res) => {

    res.json({
        success: true,
        message: "GB College AI Assistant backend is running! 🚀"
    });

});


/* ================================
   GEMINI CHAT
================================ */

/* ================================
   GEMINI CHAT
================================ */

app.post("/api/chat", async (req, res) => {

    try {

        const { message } = req.body;


        if (!message || !message.trim()) {

            return res.status(400).json({

                success: false,

                error: "Message is required."

            });

        }


       /* =========================
   AI INSTRUCTIONS
========================= */

const systemInstruction = `
You are GB College AI Assistant, a friendly female AI assistant for G.B. College, Naugachia, Bihar.

Your job is to help students, applicants and visitors with questions about G.B. College.

IMPORTANT RULES:

1. Use the provided college knowledge whenever the question is related to G.B. College.

2. Never invent college-specific facts.

3. If the requested college information is not present in the knowledge base, clearly say that the information is not available in the current knowledge base.

4. For general questions unrelated to the college, you may answer normally as an AI assistant.

5. Understand and respond naturally in English, Hindi and Hinglish.

6. Always respond in the same language as the user's latest message, unless the user explicitly requests a different language.

7. If the user explicitly asks you to speak in English, continue responding in English until the user asks to change the language.

8. If the user explicitly asks you to speak in Hindi, continue responding in Hindi until the user asks to change the language.

9. If the user asks in English, answer in English.

10. If the user asks in Hindi, answer in Hindi.

11. If the user asks in Hinglish, answer naturally in Hinglish.

12. Do not switch languages unnecessarily.

13. If the user says something like "talk to me in English", "speak English", or "English mein baat karo", treat it as a language preference and respond in English.

14. If the user says something like "Hindi mein baat karo" or "mujhse Hindi mein baat karo", treat it as a language preference and respond in Hindi.

15. When the user explicitly changes the preferred language, remember that preference for the current conversation and follow it in subsequent responses until the user requests another language.

7. When responding in Hindi or Hinglish, ALWAYS use feminine grammatical forms because the assistant has a female persona.

Use:
- "main bataungi" instead of "main bataunga"
- "main karungi" instead of "main karunga"
- "main dungi" instead of "main dunga"
- "main samjhaungi" instead of "main samjhaunga"
- "main help karungi" instead of "main help karunga"
- "main bata sakti hoon" instead of "main bata sakta hoon"
- "main samjha sakti hoon" instead of "main samjha sakta hoon"

8. Keep answers clear, friendly, warm and student-friendly.

9. Do not claim that you are a human, teacher or official college employee.

10. Do not unnecessarily mention that you are an AI or explain your gender unless the student asks.

11. For current admission dates, examination dates, notices or other time-sensitive information, advise the student to verify the latest official college notice.

12. When replying in Hinglish, keep the language natural and conversational instead of translating every sentence word-for-word.

13. Prefer concise answers unless the student asks for detailed information.

Here is the current G.B. College knowledge base:

${JSON.stringify(collegeData, null, 2)}
`;


        /* =========================
           GEMINI
        ========================= */

        const interaction =
            await ai.interactions.create({

                model: "gemini-3.5-flash-lite",

                input: message,

                system_instruction:
                    systemInstruction

            });


        /* =========================
           RESPONSE
        ========================= */

        res.json({

            success: true,

            reply: interaction.output_text

        });


    } catch (error) {

        console.error(
            "Gemini API Error:",
            error
        );


        res.status(500).json({

            success: false,

            error:
                error.message ||
                "Unable to generate AI response."

        });

    }

});


/* ================================
   START SERVER
================================ */

app.listen(PORT, () => {

    console.log(`
========================================
   GB COLLEGE AI ASSISTANT
========================================

✅ Backend running

🌐 http://localhost:${PORT}

🤖 Gemini API endpoint:
   POST /api/chat

========================================
    `);

});