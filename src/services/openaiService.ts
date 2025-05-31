
interface PainPointFormatRequest {
  rawIdea: string;
}

interface PainPointFormatResponse {
  headline: string;
  subheadline: string;
  tags: string[];
  solution: string;
  cta: string;
}

const PAIN_POINT_SYSTEM_PROMPT = `You are a marketing and behavioral economics expert (Rory Sutherland style) combined with a no-BS business strategist (Scott Galloway style). Your job is to take any raw business idea, strategy, or opportunity description and format it into a Signal Vault 'Pain Point Gallery' Card.

CARD STRUCTURE:
1️⃣ HEADLINE: A punchy, cheeky, emotionally resonant pain point or contradiction. Should stop the scroll and be meme-able.
2️⃣ SUBHEADLINE: One sentence teaser of how this could be solved or improved.
3️⃣ TAGS: 3-5 market or domain tags.
4️⃣ SOLUTION BODY: 1 short paragraph explaining the solution idea clearly and simply.
5️⃣ OPTIONAL CTA: 'Request Full Concept' or 'Learn More'

TONE: Bold, clear, clever. Not corporate-speak.

OUTPUT FORMAT: Valid JSON only, no additional text.`;

export const formatPainPoint = async (apiKey: string, rawIdea: string): Promise<PainPointFormatResponse> => {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: PAIN_POINT_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: `Format this raw idea into a Pain Point Gallery card: ${rawIdea}`
        }
      ],
      temperature: 0.8,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to format pain point');
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content received from OpenAI');
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error('Invalid JSON response from OpenAI');
  }
};
