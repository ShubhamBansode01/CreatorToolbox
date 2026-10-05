export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { prompt, tool } = req.body || {};

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required"
      });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
    const HUGGINGFACE_MODEL =
      process.env.HUGGINGFACE_MODEL || "Qwen/Qwen2.5-7B-Instruct";

    const systemPrompt = `
You are CreatorToolbox AI, an AI assistant for content creators.

Tool:
${tool || "general"}

Create useful, accurate and engaging content.
Follow the user's requested format and language.
If the user requests Hinglish, respond naturally in Hinglish.
Do not add unnecessary explanations.
`;

    // ==========================================
    // 1. PRIMARY: GEMINI
    // ==========================================

    if (GEMINI_API_KEY) {
      try {
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              systemInstruction: {
                parts: [
                  {
                    text: systemPrompt
                  }
                ]
              },
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: prompt
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1200
              }
            })
          }
        );

        if (geminiResponse.ok) {
          const data = await geminiResponse.json();

          const result =
            data?.candidates?.[0]?.content?.parts
              ?.map(part => part.text || "")
              .join("")
              .trim();

          if (result) {
            return res.status(200).json({
              result,
              provider: "gemini"
            });
          }
        }

        console.error(
          "Gemini failed:",
          await geminiResponse.text()
        );
      } catch (error) {
        console.error("Gemini error:", error);
      }
    }

    // ==========================================
    // 2. BACKUP: HUGGING FACE
    // ==========================================

    if (HUGGINGFACE_API_KEY) {
      try {
        const hfResponse = await fetch(
          "https://router.huggingface.co/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${HUGGINGFACE_API_KEY}`
            },
            body: JSON.stringify({
              model: HUGGINGFACE_MODEL,
              messages: [
                {
                  role: "system",
                  content: systemPrompt
                },
                {
                  role: "user",
                  content: prompt
                }
              ],
              temperature: 0.7,
              max_tokens: 1200
            })
          }
        );

        if (hfResponse.ok) {
          const data = await hfResponse.json();

          const result =
            data?.choices?.[0]?.message?.content?.trim();

          if (result) {
            return res.status(200).json({
              result,
              provider: "huggingface"
            });
          }
        }

        console.error(
          "Hugging Face failed:",
          await hfResponse.text()
        );
      } catch (error) {
        console.error("Hugging Face error:", error);
      }
    }

    // ==========================================
    // BOTH FAILED
    // ==========================================

    return res.status(502).json({
      error: "Both Gemini and Hugging Face failed."
    });

  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
                }
