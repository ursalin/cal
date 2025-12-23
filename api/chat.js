export default async function handler(req, res) {
  const { text } = req.body;

  try {
    // 1. 调用 DeepSeek 获取对话文本
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
    const replyText = dsData.choices[0].message.content;

    // 2. 发起 LivePortrait 视频生成请求
    // 注意：这里需要你把照片直链填在下面的 URL 处
    const lpRes = await fetch('https://kwai-kolors-liveportrait.hf.space/gradio_api/call/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [
          "你的Caleb照片直链地址.jpg", // 👈 记得换成你的照片链接！
          replyText,
          null, 
          true
        ]
      })
    });
    const lpData = await lpRes.json();

    // 返回文字和任务 ID 给前端
    res.status(200).json({ 
      reply: replyText, 
      event_id: lpData.event_id 
    });

  } catch (error) {
    res.status(500).json({ error: "连接大脑失败" });
  }
}
