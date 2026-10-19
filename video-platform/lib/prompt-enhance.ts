/**
 * Turns a short user prompt into a detailed video-generation prompt
 * (scene, camera, lighting, motion). Uses DeepSeek if a key is configured;
 * otherwise returns the prompt unchanged (no silent "fake AI" rewriting).
 */
export async function enhancePrompt(prompt: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return prompt;

  const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";
  const system =
    "Ты помогаешь превратить короткий запрос пользователя в подробный промпт " +
    "для генерации видео (сцена, план камеры, свет, движение, стиль). " +
    "Отвечай только готовым промптом на английском языке, без пояснений.";

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });
    if (!res.ok) {
      throw new Error(`DeepSeek API вернул ${res.status}`);
    }
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    return text || prompt;
  } catch (err) {
    // Degrade gracefully: a broken LLM call shouldn't block generation.
    console.error("enhancePrompt failed, falling back to raw prompt:", err);
    return prompt;
  }
}
