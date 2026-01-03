export default async function handler(req, res) {
  // 必须最先声明返回格式为 JSON
  res.setHeader('Content-Type', 'application/json');

  try {
    const { text } = req.body;
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) throw new Error("缺少 API Key，请检查 Vercel 环境变量设置");

    console.log("正在呼叫 DeepSeek...");
    const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "system", content: "你是夏以昼，温柔哥哥。" }, { role: "user", content: text }]
      })
    });

    const dsData = await dsRes.json();
    if (!dsData.choices) throw new Error("DeepSeek 未返回有效文字");
    const replyText = dsData.choices[0].message.content;

    console.log("正在提交视频任务...");
    const lpRes = await fetch('https://kwai-kolors-liveportrait.hf.space/gradio_api/call/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: ["https://pic4.zhimg.com/v2-b7e17f54c9354e6082404ed88f175440_r.jpg", replyText, null, true]
      })
    });

    const lpData = await lpRes.json();
    console.log("任务提交成功，ID:", lpData.event_id);

    return res.status(200).json({ reply: replyText, event_id: lpData.event_id });

  } catch (error) {
    console.error("后端崩溃详情:", error.message);
    // 即使报错，也必须返回 JSON 格式，防止前端报 Unexpected token <
    return res.status(200).json({ 
      reply: "（哥刚才信号断了，但我还在）", 
      error: error.message 
    });
  }
}
