import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GROK_API_KEY = process.env.GROK_API_KEY;
const GROQ_CLOUD_API_KEY = process.env.GROQ_CLOUD_API_KEY;

// Helper function to repair incomplete JSON array
const repairJSON = (str: string): string => {
  const lastBracket = str.lastIndexOf(']');
  if (lastBracket === -1) {
    let i = str.length - 1;
    let inString = false;
    let escapeNext = false;
    while (i >= 0) {
      const char = str[i];
      if (escapeNext) {
        escapeNext = false;
        i--;
        continue;
      }
      if (char === '\\') {
        escapeNext = true;
        i--;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        if (!inString) {
          let j = i + 1;
          while (j < str.length && /[\s,\]]/.test(str[j])) {
            if (str[j] === ']' || str[j] === ',') {
              return str.substring(0, i + 1) + ']';
            }
            j++;
          }
        }
      }
      i--;
    }
    return str + '"]';
  }
  const beforeBracket = str.substring(0, lastBracket);
  let quoteCount = 0;
  let inString = false;
  let escapeNext = false;
  for (let i = 0; i < beforeBracket.length; i++) {
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (beforeBracket[i] === '\\') {
      escapeNext = true;
      continue;
    }
    if (beforeBracket[i] === '"') {
      inString = !inString;
      quoteCount++;
    }
  }
  if (quoteCount % 2 === 1) {
    let lastCompleteQuote = -1;
    inString = false;
    escapeNext = false;
    for (let i = 0; i < beforeBracket.length; i++) {
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      if (beforeBracket[i] === '\\') {
        escapeNext = true;
        continue;
      }
      if (beforeBracket[i] === '"') {
        inString = !inString;
        if (!inString) {
          lastCompleteQuote = i;
        }
      }
    }
    if (lastCompleteQuote > 0) {
      return str.substring(0, lastCompleteQuote + 1) + ']';
    }
  }
  return str;
};

// Helper to parse reviews from response content
const parseReviews = (content: string): string[] => {
  let reviews: string[] = [];
  let cleanContent = content.trim();
  if (cleanContent.startsWith('```json')) cleanContent = cleanContent.substring(7);
  else if (cleanContent.startsWith('```')) cleanContent = cleanContent.substring(3);
  if (cleanContent.endsWith('```')) cleanContent = cleanContent.substring(0, cleanContent.length - 3);
  cleanContent = cleanContent.trim();

  try {
    reviews = JSON.parse(cleanContent);
    if (Array.isArray(reviews) && reviews.length > 0) return reviews;
  } catch (e) {
    console.log('Direct parse failed, trying repair...');
  }
  try {
    const repairedContent = repairJSON(cleanContent);
    reviews = JSON.parse(repairedContent);
    if (Array.isArray(reviews) && reviews.length > 0) return reviews;
  } catch (e) {
    console.log('Repair strategy failed');
  }
  const startIdx = cleanContent.indexOf('[');
  const endIdx = cleanContent.lastIndexOf(']');
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const jsonStr = cleanContent.substring(startIdx, endIdx + 1);
    try {
      const repairedJson = repairJSON(jsonStr);
      reviews = JSON.parse(repairedJson);
      if (Array.isArray(reviews) && reviews.length > 0) return reviews;
    } catch (e) {
      console.error('Failed to parse extracted/repaired JSON');
    }
  }
  return [];
};

// Helper function to make API call
const callGeminiAPI = async (prompt: string, model: string) => {
  return fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.8,
        maxOutputTokens: 4000,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' }
      ]
    }),
    next: { revalidate: 3600 }
  });
};

// Helper function to call OpenAI API
const callOpenAIAPI = async (prompt: string) => {
  return fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000
    })
  });
};

// Helper function to call Grok API
const callGrokAPI = async (prompt: string) => {
  return fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'grok-2-latest',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      stream: false
    })
  });
};

// Helper function to call Groq Cloud API (FREE & UNLIMITED)
const callGroqCloudAPI = async (prompt: string) => {
  return fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_CLOUD_API_KEY}`
    },
    body: JSON.stringify({
      model: 'mixtral-8x7b-32768',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });
};

export async function POST(request: NextRequest) {
  try {
    const { businessName, category, description, location, batches = 1 } = await request.json();

    if (!businessName || !category || !description || !location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    const numBatches = Math.min(Math.max(parseInt(batches) || 1, 1), 5);
    const reviewsPerBatch = 20;
    const totalReviews = numBatches * reviewsPerBatch;
    let allReviews: string[] = [];

    // Generate reviews in batches
    for (let i = 0; i < numBatches; i++) {
      const prompt = `You are a review generator. OUTPUT ONLY a JSON array. Nothing else.

Generate ${reviewsPerBatch} unique reviews (batch ${i + 1}/${numBatches}) for: "${businessName}" (${category}) in ${location}. ${description}

IMPORTANT: Each review MUST be:
- 2-3 sentences
- UNIQUE structure and wording - DO NOT repeat or use templates
- Include "best" OR "highly recommend"/"i would recommend"
- Mention specific service details related to ${category}
- Include location "${location}"
- Natural, authentic customer voice
- Different from previous batches if this is not the first batch

OUTPUT ONLY:
["review1","review2",...,"review${reviewsPerBatch}"]`;

      let batchReviews: string[] = [];
      let aiUsed = '';

      // Try Gemini first
      try {
        console.log(`Batch ${i + 1}: Trying Gemini API...`);
        let response = await callGeminiAPI(prompt, 'gemini-2.5-flash-lite');

        if (!response.ok && (response.status === 503 || response.status === 429)) {
          console.log(`Batch ${i + 1}: Gemini 2.5 Flash-Lite unavailable, trying 3.5-flash...`);
          response = await callGeminiAPI(prompt, 'gemini-3.5-flash');
        }

        if (response.ok) {
          const data = await response.json();
          const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

          if (content) {
            console.log(`Batch ${i + 1}: Gemini response received, parsing...`);
            batchReviews = parseReviews(content);
            if (batchReviews.length > 0) {
              aiUsed = 'Gemini';
            }
          }
        }
      } catch (geminiError) {
        console.log(`Batch ${i + 1}: Gemini error, will try OpenAI...`);
      }

      // Fallback to OpenAI if Gemini fails
      if (batchReviews.length === 0 && OPENAI_API_KEY) {
        try {
          console.log(`Batch ${i + 1}: Trying OpenAI API...`);
          const response = await callOpenAIAPI(prompt);

          if (response.ok) {
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;

            if (content) {
              console.log(`Batch ${i + 1}: OpenAI response received, parsing...`);
              console.log(`Response length: ${content.length} chars`);
              batchReviews = parseReviews(content);
              if (batchReviews.length > 0) {
                aiUsed = 'OpenAI';
              } else {
                console.log(`Batch ${i + 1}: OpenAI - Failed to parse, content sample: ${content.substring(0, 100)}...`);
              }
            } else {
              console.log(`Batch ${i + 1}: OpenAI - No content in response`);
            }
          } else {
            console.log(`Batch ${i + 1}: OpenAI - Response not ok, status: ${response.status}`);
          }
        } catch (openaiError) {
          console.log(`Batch ${i + 1}: OpenAI error, will try Grok...`, openaiError);
        }
      }

      // Fallback to Grok if both Gemini and OpenAI fail
      if (batchReviews.length === 0 && GROK_API_KEY) {
        try {
          console.log(`Batch ${i + 1}: Trying Grok API...`);
          const response = await callGrokAPI(prompt);

          if (response.ok) {
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;

            if (content) {
              console.log(`Batch ${i + 1}: Grok response received, parsing...`);
              console.log(`Response length: ${content.length} chars`);
              batchReviews = parseReviews(content);
              if (batchReviews.length > 0) {
                aiUsed = 'Grok';
              } else {
                console.log(`Batch ${i + 1}: Grok - Failed to parse, content sample: ${content.substring(0, 100)}...`);
              }
            } else {
              console.log(`Batch ${i + 1}: Grok - No content in response`);
            }
          } else {
            console.log(`Batch ${i + 1}: Grok - Response not ok, status: ${response.status}`);
          }
        } catch (grokError) {
          console.log(`Batch ${i + 1}: Grok error...`, grokError);
        }
      }

      // Fallback to Groq Cloud if all others fail (FREE & UNLIMITED)
      if (batchReviews.length === 0 && GROQ_CLOUD_API_KEY) {
        try {
          console.log(`Batch ${i + 1}: Trying Groq Cloud API...`);
          const response = await callGroqCloudAPI(prompt);

          if (response.ok) {
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;

            if (content) {
              console.log(`Batch ${i + 1}: Groq Cloud response received, parsing...`);
              console.log(`Response length: ${content.length} chars`);
              batchReviews = parseReviews(content);
              if (batchReviews.length > 0) {
                aiUsed = 'Groq Cloud';
              } else {
                console.log(`Batch ${i + 1}: Groq Cloud - Failed to parse, content sample: ${content.substring(0, 100)}...`);
              }
            } else {
              console.log(`Batch ${i + 1}: Groq Cloud - No content in response`);
            }
          } else {
            console.log(`Batch ${i + 1}: Groq Cloud - Response not ok, status: ${response.status}`);
          }
        } catch (groqCloudError) {
          console.log(`Batch ${i + 1}: Groq Cloud error...`, groqCloudError);
        }
      }

      // If all AI services fail, return error
      if (batchReviews.length === 0) {
        console.error(`Batch ${i + 1}: All AI services failed or responses couldn't be parsed`);
        return NextResponse.json({ error: `Batch ${i + 1}: Failed with all available AI services` }, { status: 500 });
      }

      console.log(`✓ Batch ${i + 1}: Generated ${batchReviews.length} reviews using ${aiUsed}`);
      allReviews = [...allReviews, ...batchReviews];

      // Add small delay between batches to avoid rate limiting
      if (i < numBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`✅ Successfully generated ${allReviews.length} reviews across ${numBatches} batches`);
    return NextResponse.json({ reviews: allReviews });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
