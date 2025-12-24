export default async function handler(req, res) {
  try {
    const { text } = req.body;
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return res.status(200).json({ reply: "（哥的信号卡住了，请检查 API Key 设置）" });
    }

    // 1. 请求 DeepSeek 文字回复
    const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是夏以昼，温柔宠溺的哥哥。语气温和，常用语气词，回复短一点。" },
          { role: "user", content: text }
        ]
      })
    });

    const dsData = await dsRes.json();
    const replyText = dsData.choices?.[0]?.message?.content || "刚才走神了，再说一遍？";

    // 2. 请求 LivePortrait 视频生成
    let event_id = null;
    try {
      const lpRes = await fetch('https://kwai-kolors-liveportrait.hf.space/gradio_api/call/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [
            "https://pic4.zhimg.com/v2-b7e17f54c9354e6082404ed88f175440_r.jpg", // 稳定图源
            replyText,
            null, 
            true
          ]
        })
      });

      if (lpRes.ok) {
        const lpData = await lpRes.json();
        event_id = lpData.event_id;
      }
    } catch (e) {
      console.error("视频工厂排队中");
    }

    // 返回结果
    res.status(200).json({ 
      reply: replyText, 
      event_id: event_id 
    });

  } catch (error) {
    res.status(200).json({ reply: "哎呀，刚才信号断了一下下..." });
  }
}
