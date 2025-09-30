export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Метод не разрешён' });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Нет запроса' });

  console.log('Получен запрос:', prompt);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': Bearer ${process.env.OPENROUTER_API_KEY},
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "google/gemma-3n-e2b-it:free",
        messages: [
          {
            role: "system",
            content: "Ты — талантливый писатель. Напиши художественный текст по запросу. Пиши на языке запроса. Не объясняй, просто дай текст."
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.8
      })
    });

    console.log('Статус ответа от OpenRouter:', response.status);

    const data = await response.json();
    console.log('Ответ от OpenRouter:', JSON.stringify(data, null, 2));

    if (data.choices?.[0]?.message?.content) {
      res.status(200).json({ text: data.choices[0].message.content });
    } else {
      res.status(500).json({ error: 'OpenRouter вернул ошибку', details: data });
    }
  } catch (e) {
    console.error('Ошибка в прокси:', e.message);
    res.status(500).json({ error: 'Серверная ошибка', message: e.message });
  }
}
