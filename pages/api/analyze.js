import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { content } = req.body;
  if (!content) return res.status(400).json({ error: '缺少文案内容' });

  const systemPrompt = `你是一个专业的短视频文案分析师。请分析给定的文案，并按照以下分类维度进行标注，只返回JSON，不要任何其他内容。

分类维度和选项：

1. 内容目的（purpose）- 选择1-2个最匹配的：
   选项：拉新获客、痛点切入、效果证实、新方案替代、信任背书、用户共鸣、种草推荐、促销活动

2. 开头钩子（hook）- 选择1-2个最匹配的：
   选项：正说反话、塑造冲突、提问疑问、威胁警告、直击痛点、引发好奇、情绪价值、价格优惠、场景需求、信用背书、种草推荐、效果展示

3. 功能结构（structure）- 选择文案中出现的所有模块（可多选）：
   选项：身份介绍/人群圈定、痛点切入/痛点解决、产品引入、成分介绍/认知科普、产品工艺/产品理念、信任背书、使用场景/使用方法、效果承诺/效果佐证、体验展示/种草体验、高端关联/产品情怀、促销机制/产品价格

返回格式（仅JSON）：
{
  "purpose": ["选项1"],
  "hook": ["选项1"],
  "structure": ["选项1", "选项2"],
  "summary": "一句话总结这条文案的核心策略（15字以内）"
}`;

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: `文案内容：\n${content}` }],
    });

    const text = message.content[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Analyze error:', err);
    return res.status(500).json({ error: err.message || 'AI分析失败' });
  }
}
