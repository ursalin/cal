export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "只接受 POST" });
  }

  try {
    const { text, source_image_url, driving_video_url } = req.body || {};
    if (!text) return res.status(400).json({ reply: "你没说话" });

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return res.status(500).json({ reply: "服务器没配 DEEPSEEK_API_KEY" });

    // 你可以在前端传，也可以在这里写死默认值
    const SOURCE_IMAGE =
      source_image_url ||
      "https://raw.githubusercontent.com/ursalin/cal/main/mmexport1766446686555.jpg";

    // ⚠️ 你必须换成一个真实可访问的 driving 视频 mp4 链接
    const DRIVING_VIDEO =
      driving_video_url ||
      "https://YOUR_PUBLIC_DRIVING_VIDEO.mp4";

    // 1) DeepSeek 回复
    const dsRes = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是夏以昼，玩家温柔的哥哥。回复极简，10字以内。" },
          { role: "user", content: text },
        ],
      }),
    });

    const dsData = await dsRes.json();
    const replyText =
      dsData?.choices?.[0]?.message?.content?.trim() || "嗯。";

    // 2) 提交 LivePortrait 任务（Gradio call/predict）
    // 注意：不同 Space 的 data 参数顺序可能不同
    // 这一版按“常见的：source_image, driving_video, ...options”思路写
    // 如果你发现返回里报 input mismatch，需要你把 Space 的 UI 输入项发我，我会对齐 schema
    const lpRes = await fetch("https://kwai-kolors-liveportrait.hf.space/gradio_api/call/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [
          SOURCE_IMAGE,
          DRIVING_VIDEO,
          // 可选项：很多 liveportrait space 会有类似这些开关
          // 不确定 schema 的话宁可少传，避免错位
        ],
      }),
    });

    const lpData = await lpRes.json();

    // 有些 gradio 返回的是 {event_id: "..."}，按 gradio 文档这个是正常的:contentReference[oaicite:2]{index=2}
    const eventId = lpData?.event_id;

    return res.status(200).json({
      reply: replyText,
      event_id: eventId || null,
      source_image_url: SOURCE_IMAGE,
      driving_video_url: DRIVING_VIDEO,
    });
  } catch (err) {
    console.error(err);
    return res.status(200).json({ reply: "哥信号不好，等我一下。" });
  }
}
