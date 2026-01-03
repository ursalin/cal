export default async function handler(req, res) {
  // 增加跨域支持，防止前端被拦截
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');

  try {
    const { text } = req.body;
    const apiKey = process.env.DEEPSEEK_API_KEY;

    // 1. 调用 DeepSeek
    const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "system", content: "你是夏以昼，温柔哥哥。回复极简。" }, { role: "user", content: text }]
      })
    });
    const dsData = await dsRes.json();
    const replyText = dsData.choices[0].message.content;

    // 2. 呼叫视频工厂 (LivePortrait)
    const lpRes = await fetch('https://kwai-kolors-liveportrait.hf.space/gradio_api/call/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: ["https://pic4.zhimg.com/v2-b7e17f54c9354e6082404ed88f175440_r.jpg", replyText, null, true]
      })
    });
    const lpData = await lpRes.json();

    return res.status(200).json({ reply: replyText, event_id: lpData.event_id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
