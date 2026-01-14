
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

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text: PAIN_POINT_SYSTEM_PROMPT
            }
          ]
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: `Format this raw idea into a Pain Point Gallery card: ${rawIdea}`
            }
          ]
        }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'pain_point_card',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              headline: { type: 'string' },
              subheadline: { type: 'string' },
              tags: {
                type: 'array',
                minItems: 3,
                maxItems: 5,
                items: { type: 'string' }
              },
              solution: { type: 'string' },
              cta: { type: 'string' }
            },
            required: ['headline', 'subheadline', 'tags', 'solution', 'cta']
          }
        }
      },
      temperature: 0.8,
      max_output_tokens: 500
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to format pain point: ${errorText}`);
  }

  const data = await response.json();
  const content =
    data.output_text ??
    data.output?.[0]?.content?.find((item: { type: string; text?: string }) => item.type === 'output_text')
      ?.text;
  
  if (!content) {
    throw new Error('No content received from OpenAI');
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error('Invalid JSON response from OpenAI');
  }
};
