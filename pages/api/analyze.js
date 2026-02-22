export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: '缺少文案内容' });

  const systemPrompt = `你是一个专业的短视频文案分析师。只返回JSON，不要其他内容，不要markdown代码块。
返回格式：{"purpose":["选项"],"hook":["选项"],"structure":["选项1","选项2"],"summary":"15字以内策略总结"}
purpose选项：拉新获客、痛点切入、效果证实、新方案替代、信任背书、用户共鸣、种草推荐、促销活动
hook选项：正说反话、塑造冲突、提问疑问、威胁警告、直击痛点、引发好奇、情绪价值、价格优惠、场景需求、信用背书、种草推荐、效果展示
structure选项：身份介绍/人群圈定、痛点切入/痛点解决、产品引入、成分介绍/认知科普、产品工艺/产品理念、信任背书、使用场景/使用方法、效果承诺/效果佐证、体验展示/种草体验、高端关联/产品情怀、促销机制/产品价格`;

  try {
    const resp = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `文案内容：\n${content}` }
        ],
        max_tokens: 1024,
        response_format: { type: 'json_object' }
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      return res.status(500).json({ error: err });
    }

    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content || '{}';
    const clean = text.replace(/```json|```/g, '').trim();
    return res.status(200).json(JSON.parse(clean));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
