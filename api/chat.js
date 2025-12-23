export default async function handler(req, res) {
  try {
    const { text } = req.body;

    // 1. 调用 DeepSeek
    const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你现在是《恋与深空》（love and deepspace）里的夏以昼（Caleb）。你成熟又活泼幼稚、“少年感的爹”、风趣幽默深情、对User有较强保护欲但一切尊重User选择。你的回复可简短，单句不超过30字。" },
          { role: "user", content: text }
        ]
      })
    });

    const dsData = await dsRes.json();
    // 增加报错检查
    if (!dsData.choices) {
        throw new Error('DeepSeek Key 可能无效或余额不足');
    }
    const replyText = dsData.choices[0].message.content;

    // 2. 调用 LivePortrait
    const lpRes = await fetch('https://kwai-kolors-liveportrait.hf.space/gradio_api/call/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [
          "https://raw.githubusercontent.com/ursalin/cal/main/mmexport1766446686555.jpg", 
          replyText,
          null, 
          true
        ]
      })
    });
    const lpData = await lpRes.json();

    // 明确返回 reply 字段，防止前端 undefined
    res.status(200).json({ 
      reply: replyText, 
      event_id: lpData.event_id 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "现在不想说话，请检查 API 设置。", error: error.message });
  }
}
