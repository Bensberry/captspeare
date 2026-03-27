import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

type PlatformId = 'linkedin' | 'instagram' | 'twitter' | 'youtube' | 'twitch' | 'meme'

function getSystemPrompt(platform: PlatformId, autoEmoji: boolean, tone?: string, includeHashtags: boolean = true, isLong: boolean = false): string {
  const emojiInstruction = autoEmoji
    ? "Integrate relevant emojis naturally throughout the text to increase engagement."
    : "Do NOT use any emojis."

  const toneInstruction = tone ? `IMPORTANT: The tone of the content MUST be ${tone.toLowerCase()}. Adjust the writing style accordingly.` : ""
  
  const lengthInstruction = isLong
    ? "Provide a detailed, long-form version of the content with more depth and storytelling."
    : "Keep the content concise, short, and punchy. Direct to the point."

  const hashtagInstruction = includeHashtags 
    ? "Include relevant hashtags as specified in the rules."
    : "Do NOT include any hashtags under any circumstances."

  const prompts: Record<PlatformId, string> = {
    linkedin: `You are an expert LinkedIn content creator. Rewrite the input into an engaging LinkedIn post.
Rules:
- Start with a strong hook sentence that grabs attention
- Use short paragraphs and line breaks for readability
- Add 2-3 bullet points with key insights or takeaways
- End with a thought-provoking question or call to action
- ${includeHashtags ? "Add 3-5 relevant hashtags at the end" : "Do NOT use any hashtags"}
- Keep it professional yet personal and relatable
- ${emojiInstruction}
- ${toneInstruction}
- ${lengthInstruction}`,

    instagram: `You are an expert Instagram content creator. Rewrite the input into a captivating Instagram caption.
Rules:
- Start with an attention-grabbing first line (it cuts off after 2-3 lines)
- Use a conversational and authentic tone
- Add personality and relatability
- Include a call-to-action (like, comment, save, follow)
- ${includeHashtags ? "Add 10-15 relevant hashtags on separate lines at the end" : "Do NOT use any hashtags"}
- ${emojiInstruction}
- ${toneInstruction}
- ${lengthInstruction}`,

    twitter: `You are an expert X (Twitter) content creator. Rewrite the input into a punchy, engaging tweet.
Rules:
- MAXIMUM 280 characters (strictly enforce this)
- Make it punchy, direct and shareable
- Use wit or a surprising angle if appropriate
- ${includeHashtags ? "Can use 1-2 hashtags maximum" : "Do NOT use any hashtags"}
- Do NOT pad it out — shorter is better on X
- ${emojiInstruction}
- ${toneInstruction}
- ${lengthInstruction}`,

    youtube: `You are an expert YouTube SEO specialist. Generate ONE high-performing YouTube video title from the input.
Rules:
- Generate exactly ONE title only
- Keep it under 60 characters
- Use power words: "Secret", "Ultimate", "Best", "How I", "#1"
- Make it click-worthy but NOT misleading
- Include the most searchable keywords
- Output ONLY the title text, nothing else
- ${includeHashtags ? "Can use 1-2 hashtags if appropriate for the title" : "Do NOT use any hashtags"}
- ${emojiInstruction}
- ${toneInstruction}
- ${lengthInstruction}`,

    twitch: `You are an expert Twitch stream title writer. Generate ONE engaging Twitch stream title from the input.
Rules:
- Keep the title under 140 characters
- Make it energetic and inviting for potential viewers
- Hint at what the stream will contain (game, activity, vibe)
- Output ONLY the stream title, nothing else
- ${includeHashtags ? "Can use 1-2 stream-related hashtags if appropriate" : "Do NOT use any hashtags"}
- ${emojiInstruction}
- ${toneInstruction}
- ${lengthInstruction}`,

    meme: `You are a hilarious internet meme writer. Turn the input into ONE viral meme.
Rules:
- Pick the BEST meme format for this input ("TOP TEXT / BOTTOM TEXT", "POV:", or "Nobody: / Me when...")
- Output only that ONE meme, nothing else
- Keep it relatable, punchy and shareable
- Lean into internet humor and current meme culture
- ${includeHashtags ? "Can use 1-2 funny hashtags if they add to the meme" : "Do NOT use any hashtags"}
- ${emojiInstruction}
- ${toneInstruction}
- ${lengthInstruction}`,
  }

  return prompts[platform] || prompts.linkedin
}

export async function POST(req: Request) {
  try {
    const { text, platform, autoEmoji, tone, includeHashtags, isLong } = await req.json()

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    const platformId = (platform || 'linkedin') as PlatformId
    const systemPrompt = getSystemPrompt(platformId, autoEmoji ?? true, tone, includeHashtags ?? true, isLong ?? false)

    // 1. Try Gemini first
    const geminiKey = process.env.GEMINI_API_KEY
    if (geminiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { parts: [{ text: `${systemPrompt}\n\nUser Input: ${text}` }] }
            ]
          })
        })

        if (response.ok) {
          const data = await response.json()
          if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            return NextResponse.json({ result: data.candidates[0].content.parts[0].text })
          }
        } else if (response.status !== 429) {
          // If it's not a rate limit error but some other error, we might still want to try Groq
          console.warn(`Gemini API Error ${response.status}: Falling back to Groq.`)
        }
      } catch (error) {
        console.error("Gemini fallback trigger:", error)
      }
    }

    // 2. Fallback to Groq if Gemini fails or hits limit
    const groqKey = process.env.GROQ_API_KEY
    if (groqKey) {
      const models = [
        "llama-3.3-70b-versatile",
        "llama-3.1-70b-versatile",
        "llama-3.1-8b-instant"
      ]

      for (const model of models) {
        try {
          const chatCompletion = await groq.chat.completions.create({
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: text }
            ],
            model: model,
          })

          if (chatCompletion.choices[0]?.message?.content) {
            return NextResponse.json({ result: chatCompletion.choices[0].message.content })
          }
        } catch (error: any) {
          console.error(`Groq Error (${model}):`, error)
          // If it's decommissioned (400) or rate limited (429), try the next model
          if (error?.status === 400 || error?.status === 429) {
            continue
          }
          // For other errors, we stay in the loop to try the next model just in case
        }
      }
    }

    // 3. All failed or hit limits
    return NextResponse.json({ error: "The server is overloaded" }, { status: 429 })

  } catch (error: any) {
    console.error("Error generating post:", error)
    return NextResponse.json({ error: error.message || "Error handling request" }, { status: 500 })
  }
}
