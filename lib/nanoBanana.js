import { OpenAI } from 'openai';

const getOpenAiClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your-openai-api-key') {
    return null;
  }
  return new OpenAI({ apiKey });
};

/**
 * Generate a realistic article image using the Nano Banana wrapper.
 * If the OpenAI API key is not available, this returns null.
 *
 * @param {string} prompt
 * @returns {Promise<{url: string, source: string, license: string}|null>}
 */
export async function generateNanoBananaImage(prompt) {
  const client = getOpenAiClient();
  if (!client || !prompt) {
    return null;
  }

  try {
    const response = await client.images.generate({
      model: 'gpt-image-1',
      prompt,
      size: '1024x1024',
    });

    const result = response?.data?.[0];
    if (!result) return null;

    if (result.url) {
      return {
        url: result.url,
        source: 'Nano Banana AI',
        license: 'Generated under OpenAI policies',
      };
    }

    if (result.b64_json) {
      return {
        url: `data:image/png;base64,${result.b64_json}`,
        source: 'Nano Banana AI',
        license: 'Generated under OpenAI policies',
      };
    }

    return null;
  } catch (error) {
    console.error('Nano Banana image generation failed:', error);
    return null;
  }
}
