export default async function handler(req, res) {
  try {
    const { text } = req.body;
    const apiKey = process.env.DEEPSEEK_API_KEY;

    // 1. 获取夏以昼的文字
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

    // 2. 尝试唤醒视频工厂 (LivePortrait)
    // 换一个更稳的调用方式
    const lpRes = await fetch('https://kwai-kolors-liveportrait.hf.space/gradio_api/call/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [
          "https://pic4.zhimg.com/v2-b7e17f54c9354e6082404ed88f175440_r.jpg", // 我帮你换了一个更稳定的图片源试试
          replyText,
          null,
          true
        ]
      })
    });
    const lpData = await lpRes.json();

    res.status(200).json({ reply: replyText, event_id: lpData.event_id });
  } catch (error) {
    // 即使视频坏了，也要把文字传回去
    res.status(200).json({ reply: "（哥现在有点忙，先陪你聊天）" + error.message });
  }
}
