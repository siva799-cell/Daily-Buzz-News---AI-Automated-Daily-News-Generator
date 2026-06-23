import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// Initialize OpenAI client if API key is present
const getOpenAiClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your-openai-api-key') {
    return null;
  }
  return new OpenAI({ apiKey });
};

const languageNames = {
  en: 'English',
  hi: 'Hindi',
  te: 'Telugu',
  bn: 'Bengali',
  mr: 'Marathi',
  ta: 'Tamil',
  gu: 'Gujarati',
  kn: 'Kannada',
  ml: 'Malayalam',
  or: 'Odia',
  pa: 'Punjabi',
  as: 'Assamese',
  ur: 'Urdu',
  sa: 'Sanskrit',
  kok: 'Konkani',
  ks: 'Kashmiri',
  ne: 'Nepali',
  sd: 'Sindhi',
  doi: 'Dogri',
  mni: 'Manipuri',
  mai: 'Maithili',
  sat: 'Santali',
  brx: 'Bodo'
};

export async function POST(request) {
  try {
    const { title, summary, keyPoints, lang } = await request.json();
    if (!lang) {
      return NextResponse.json({ success: false, error: 'Missing target language' }, { status: 400 });
    }

    const langName = languageNames[lang];
    if (!langName) {
      return NextResponse.json({ success: false, error: `Language code '${lang}' is not supported` }, { status: 400 });
    }

    // If English, return inputs directly
    if (lang === 'en') {
      return NextResponse.json({
        success: true,
        title,
        summary,
        keyPoints
      });
    }

    const client = getOpenAiClient();
 
    // If OpenAI client is not configured, fall back to free MyMemory Translation API
    if (!client) {
      const fetchMyMemoryTranslation = async (text, langCode, fallbackPrefix) => {
        try {
          const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${langCode}`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (data && data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
              return data.responseData.translatedText;
            }
          }
        } catch (e) {
          console.error('MyMemory fetch failed:', e);
        }
        return fallbackPrefix ? `[${fallbackPrefix}] ${text}` : text;
      };

      const translatedTitle = await fetchMyMemoryTranslation(title, lang, langName);
      
      // Translate summary paragraph-by-paragraph
      const summaryParagraphs = (summary || '').split('\n');
      const translatedParagraphs = [];
      for (const para of summaryParagraphs) {
        if (para.trim()) {
          const transPara = await fetchMyMemoryTranslation(para, lang, null);
          translatedParagraphs.push(transPara);
        } else {
          translatedParagraphs.push('');
        }
      }
      const translatedSummary = translatedParagraphs.join('\n');

      const translatedKeyPoints = [];
      for (const point of (keyPoints || [])) {
        if (point.trim()) {
          const transPoint = await fetchMyMemoryTranslation(point, lang, langName);
          translatedKeyPoints.push(transPoint);
        } else {
          translatedKeyPoints.push('');
        }
      }

      return NextResponse.json({
        success: true,
        title: translatedTitle,
        summary: translatedSummary,
        keyPoints: translatedKeyPoints
      });
    }

    const prompt = `
    You are an expert translator. Translate the following news content into ${langName}.
    
    Content to translate:
    Title: "${title || ''}"
    Summary: "${summary || ''}"
    Key Points: ${JSON.stringify(keyPoints || [])}
    
    Preserve all formatting and keep the tone professional. Do not add any conversational text or explanation.
    
    Output a JSON object in this exact format:
    {
      "title": "Translated Title",
      "summary": "Translated Summary",
      "keyPoints": ["Translated Point 1", "Translated Point 2", ...]
    }
    `;

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const result = JSON.parse(response.choices[0].message.content);

    return NextResponse.json({
      success: true,
      title: result.title || `[${langName}] ${title}`,
      summary: result.summary || summary,
      keyPoints: result.keyPoints || keyPoints
    });

  } catch (error) {
    console.error('Translation route error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
