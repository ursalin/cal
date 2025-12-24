export default async function handler(req, res) {
  try {
    const { text } = req.body;
    const apiKey = process.env.DEEPSEEK_API_KEY;

    // 1. 调用 DeepSeek (身份设定改为夏以昼)
    const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是《恋与深空》里的夏以昼，你是玩家的哥哥。你性格温柔、包容、宠溺，说话带着亲切感。回复不要超过20字。" },
          { role: "user", content: text }
        ]
      })
    });

    const dsData = await dsRes.json();
    const replyText = dsData.choices[0].message.content;

    // 2. 调用 LivePortrait 接口 (换成更直接的接口写法)
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

    // 返回 replyText 和 event_id 供前端查询视频进度
    res.status(200).json({ 
      reply: replyText, 
      event_id: lpData.event_id 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
