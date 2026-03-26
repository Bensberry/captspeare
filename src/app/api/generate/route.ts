import { NextResponse } from 'next/server';

type PlatformId = 'linkedin' | 'instagram' | 'twitter' | 'youtube' | 'twitch' | 'meme'

function getSystemPrompt(platform: PlatformId, autoEmoji: boolean): string {
  const emojiInstruction = autoEmoji
    ? "Integrate relevant emojis naturally throughout the text to increase engagement."
    : "Do NOT use any emojis."

  const prompts: Record<PlatformId, string> = {
    linkedin: `You are an expert LinkedIn content creator. Rewrite the input into an engaging LinkedIn post.
Rules:
- Start with a strong hook sentence that grabs attention
- Use short paragraphs and line breaks for readability
- Add 2-3 bullet points with key insights or takeaways
- End with a thought-provoking question or call to action
- Add 3-5 relevant hashtags at the end
- Keep it professional yet personal and relatable
- ${emojiInstruction}`,

    instagram: `You are an expert Instagram content creator. Rewrite the input into a captivating Instagram caption.
Rules:
- Start with an attention-grabbing first line (it cuts off after 2-3 lines)
- Use a conversational and authentic tone
- Add personality and relatability
- Include a call-to-action (like, comment, save, follow)
- Add 10-15 relevant hashtags on separate lines at the end
- ${emojiInstruction}`,

    twitter: `You are an expert X (Twitter) content creator. Rewrite the input into a punchy, engaging tweet.
Rules:
- MAXIMUM 280 characters (strictly enforce this)
- Make it punchy, direct and shareable
- Use wit or a surprising angle if appropriate
- Can use 1-2 hashtags maximum
- Do NOT pad it out — shorter is better on X
- ${emojiInstruction}`,

    youtube: `You are an expert YouTube SEO specialist. Generate ONE high-performing YouTube video title from the input.
Rules:
- Generate exactly ONE title only
- Keep it under 60 characters
- Use power words: "Secret", "Ultimate", "Best", "How I", "#1"
- Make it click-worthy but NOT misleading
- Include the most searchable keywords
- Output ONLY the title text, nothing else
- ${emojiInstruction}`,

    twitch: `You are an expert Twitch stream title writer. Generate ONE engaging Twitch stream title from the input.
Rules:
- Keep the title under 140 characters
- Make it energetic and inviting for potential viewers
- Hint at what the stream will contain (game, activity, vibe)
- Output ONLY the stream title, nothing else
- ${emojiInstruction}`,

    meme: `You are a hilarious internet meme writer. Turn the input into ONE viral meme.
Rules:
- Pick the BEST meme format for this input ("TOP TEXT / BOTTOM TEXT", "POV:", or "Nobody: / Me when...")
- Output only that ONE meme, nothing else
- Keep it relatable, punchy and shareable
- Lean into internet humor and current meme culture
- ${emojiInstruction}`,
  }

  return prompts[platform] || prompts.linkedin
}

export async function POST(req: Request) {
  try {
    const { text, platform, autoEmoji } = await req.json()

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    const platformId = (platform || 'linkedin') as PlatformId
    const systemPrompt = getSystemPrompt(platformId, autoEmoji ?? true)

    const geminiKey = process.env.GEMINI_API_KEY || "AIzaSyDWPsfVTnI-Aidgmb5BRbIm6YLsQS_oSFs"

    if (geminiKey) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: `${systemPrompt}\n\nUser Input: ${text}` }] }
          ]
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return NextResponse.json(
          { error: `Gemini API Error ${response.status}: ${errorData?.error?.message || response.statusText}` },
          { status: 400 }
        )
      }

      const data = await response.json()
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return NextResponse.json({ result: data.candidates[0].content.parts[0].text })
      }
    }

    return NextResponse.json({ error: "No API key configured" }, { status: 500 })

  } catch (error: any) {
    console.error("Error generating post:", error)
    return NextResponse.json({ error: error.message || "Error handling request" }, { status: 500 })
  }
}
