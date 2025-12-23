export default async function handler(req, res) {
  try {
    const { text } = req.body;
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return res.status(200).json({ reply: "系统没找到你的 API 钥匙，请确认 Vercel 变量名是否叫 DEEPSEEK_API_KEY" });
    }

    // 1. 调用 DeepSeek 获取文字
    const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
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
    const replyText = dsData.choices?.[0]?.message?.content || "现在不想说话。";

    // 2. 调用 LivePortrait (增加容错)
    let event_id = null;
    try {
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

      // 关键：先检查返回的是不是 JSON
      const contentType = lpRes.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const lpData = await lpRes.json();
        event_id = lpData.event_id;
      }
    } catch (e) {
      console.error("视频生成接口调用失败，仅返回文字");
    }

    // 无论视频通没通，先把文字发给前端
    res.status(200).json({ 
      reply: replyText, 
      event_id: event_id 
    });

  } catch (error) {
    res.status(200).json({ reply: "秦彻的信号塔倒了: " + error.message });
  }
}
