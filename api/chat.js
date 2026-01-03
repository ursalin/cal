export default async function handler(req, res) {
  // 强制设置返回格式为 JSON，防止浏览器误认为 HTML
  res.setHeader('Content-Type', 'application/json');

  try {
    const { text } = req.body;
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return res.status(200).json({ reply: "（哥的信号保险丝断了，请检查 API Key 设置）" });
    }

    // 1. 请求文字（DeepSeek）
    const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是夏以昼，温柔宠溺的哥哥。回复简短。" },
          { role: "user", content: text }
        ]
      })
    });

    const dsData = await dsRes.json();
    const replyText = dsData.choices[0].message.content;

    // 2. 提交视频生成请求
    const lpRes = await fetch('https://kwai-kolors-liveportrait.hf.space/gradio_api/call/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [
          "https://pic4.zhimg.com/v2-b7e17f54c9354e6082404ed88f175440_r.jpg", 
          replyText, 
          null, 
          true
        ]
      })
    });

    const lpData = await lpRes.json();

    // 无论 lpData 有没有 event_id，都必须返回 JSON
    return res.status(200).json({ 
      reply: replyText, 
      event_id: lpData.event_id || null 
    });

  } catch (error) {
    console.error("后端发生错误:", error);
    return res.status(200).json({ 
      reply: "（信号干扰，哥刚才没听清）", 
      error: error.message 
    });
  }
}
