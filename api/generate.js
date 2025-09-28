// api/generate.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Метод не разрешён' });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Нет запроса' });

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct:free",
        messages: [
          {
            role: "system",
            content: "Ты — талантливый писатель. Напиши художественный текст по запросу. Пиши на языке запроса. Не объясняй, просто дай текст."
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 600,
        temperature: 0.8
      })
    });

    const data = await response.json();
    if (data.choices?.[0]?.message?.content) {
      res.status(200).json({ text: data.choices[0].message.content });
    } else {
      res.status(500).json({ error: 'Ошибка генерации' });
    }
  } catch (e) {
    res.status(500).json({ error: 'Серверная ошибка' });
  }
}
