export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');
  try {
    const { content } = req.body;
    const resp = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: '你是短视频文案分析师。只返回JSON，格式：{"purpose":["拉新获客"],"hook":["引发好奇"],"structure":["产品引入"],"summary":"核心策略"}。purpose从以下选1-2个：拉新获客、痛点切入、效果证实、新方案替代、信任背书、用户共鸣、种草推荐、促销活动。hook从以下选1-2个：正说反话、塑造冲突、提问疑问、威胁警告、直击痛点、引发好奇、情绪价值、价格优惠、场景需求、信用背书、种草推荐、效果展示。structure从以下多选：身份介绍/人群圈定、痛点切入/痛点解决、产品引入、成分介绍/认知科普、产品工艺/产品理念、信任背书、使用场景/使用方法、效果承诺/效果佐证、体验展示/种草体验、高端关联/产品情怀、促销机制/产品价格。summary15字以内。' },
          { role: 'user', content: `分析这条文案：\n${content}` }
        ],
        max_tokens: 512
      })
    });
    const raw = await resp.text();
    if (!resp.ok) return res.status(500).json({ error: raw });
    const data = JSON.parse(raw);
    const result = JSON.parse(data.choices[0].message.content);
    return res.status(200).json(result);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
