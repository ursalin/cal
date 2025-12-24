export default async function handler(req, res) {
  try {
    const { text } = req.body;
    const apiKey = process.env.DEEPSEEK_API_KEY;

    // 1. 获取 DeepSeek 回复
    const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是夏以昼，玩家温柔的哥哥。回复极简，10字以内。" },
          { role: "user", content: text }
        ]
      })
    });
    const dsData = await dsRes.json();
    const replyText = dsData.choices[0].message.content;

    // 2. 调用 LivePortrait 提交任务
    // 注意：这里我们只管提交，拿到 event_id 立即返回给前端，减轻服务器压力
    const lpRes = await fetch('https://kwai-kolors-liveportrait.hf.space/gradio_api/call/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: ["https://pic4.zhimg.com/v2-b7e17f54c9354e6082404ed88f175440_r.jpg", replyText, null, true]
      })
    });
    const lpData = await lpRes.json();

    res.status(200).json({ reply: replyText, event_id: lpData.event_id });
  } catch (error) {
    res.status(200).json({ reply: "哥信号不好，等我一下。" });
  }
}
