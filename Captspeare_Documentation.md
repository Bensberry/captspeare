# Captspeare — Project Documentation
### AI-Powered Multi-Platform Social Media Caption Generator

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [File-by-File Explanation](#4-file-by-file-explanation)
   - 4.1 `src/app/layout.tsx`
   - 4.2 `src/app/globals.css`
   - 4.3 `src/app/page.tsx` (Home Page)
   - 4.4 `src/app/[platform]/page.tsx` (Generator Pages)
   - 4.5 `src/app/api/generate/route.ts` (AI Backend)
   - 4.6 `lib/platforms.ts`
   - 4.7 `lib/utils.ts`
   - 4.8 `components/platform-icons.tsx`
   - 4.9 `.env.local`
5. [How the AI Pipeline Works](#5-how-the-ai-pipeline-works)
6. [Platform-Specific Prompts](#6-platform-specific-prompts)
7. [Features Summary](#7-features-summary)
8. [How to Run the Project](#8-how-to-run-the-project)

---

## 1. Project Overview

**Captspeare** is a full-stack web application that uses artificial intelligence to transform raw, casual text or voice input into professionally crafted social media captions and titles. It supports **6 different social media platforms**, each with a unique visual theme and a tailored AI prompt that produces the best possible output for that platform.

The name **Captspeare** is a blend of "Caption" and "Shakespeare," reflecting the app's goal of turning ordinary words into captivating, eloquent content.

### Core User Flow:
1. The user visits the home page and selects a platform (e.g., LinkedIn, YouTube, Instagram).
2. They type their raw thoughts **or** record a voice message.
3. They hit the **"Transform"** button.
4. The app sends the input to the Google Gemini 2.5 Flash AI model via a secure server-side API call.
5. The AI rewrites the content using a platform-specific system prompt and returns the result.
6. The user can copy the output or regenerate it.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16 (App Router) | Handles both frontend pages and backend API routes in one project |
| **Language** | TypeScript | Adds strong typing to JavaScript for fewer bugs |
| **Styling** | Tailwind CSS v4 | Utility-first CSS framework for fast, consistent styling |
| **AI Model** | Google Gemini 2.5 Flash | The large language model that rewrites the user's text |
| **Icons** | Lucide React | Clean, consistent icon library used throughout the UI |
| **Font** | Inter (Google Fonts) | Modern sans-serif font for readability |
| **Voice Input** | Web Speech Recognition API | Browser-native API for real-time voice-to-text transcription |

---

## 3. Project Structure

```
captspeare/
├── src/
│   └── app/
│       ├── layout.tsx              ← Global HTML wrapper & fonts
│       ├── page.tsx                ← Landing page with 6 platform cards
│       ├── globals.css             ← Tailwind CSS & global design tokens
│       ├── [platform]/
│       │   └── page.tsx            ← Dynamic generator page (LinkedIn, YouTube, etc.)
│       └── api/
│           └── generate/
│               └── route.ts        ← Server-side AI API route
├── lib/
│   ├── platforms.ts                ← Platform definitions (colors, prompts, metadata)
│   └── utils.ts                    ← Utility: cn() helper for Tailwind class merging
├── components/
│   └── platform-icons.tsx          ← SVG icons for each social platform
├── .env.local                      ← API keys (never committed to Git)
├── postcss.config.mjs              ← PostCSS config for Tailwind v4
└── tsconfig.json                   ← TypeScript compiler options
```

---

## 4. File-by-File Explanation

---

### 4.1 `src/app/layout.tsx` — Global App Shell

This is the **root layout** that wraps every single page in the application. In Next.js, the `layout.tsx` file at the top of the `app/` folder applies to all child routes.

**What it does:**
- Imports and applies the **Inter** font from Google Fonts, giving the whole app a modern, clean look.
- Adds the `dark` class to the `<html>` element, which forces the entire app into dark mode.
- Sets the page **title** and **meta description** for SEO purposes. Search engines and browser tabs will show "Captspeare | Transform Words Into Social Media Gold."
- Wraps all page content in a `<body>` tag with the correct font class applied.

**Key functions:**
- `RootLayout({ children })` — A React component that receives the current page's content as `children` and wraps it in the global HTML structure.

---

### 4.2 `src/app/globals.css` — Global Styles

This file configures the entire design system for the app using **Tailwind CSS v4**.

**What it does:**
- `@import 'tailwindcss'` — Loads all of Tailwind's utility classes.
- `@import 'tw-animate-css'` — Adds smooth animation utilities.
- **CSS Variables (`:root`)** — Defines the dark color palette using `oklch` color format:
  - `--background`: The deep dark background (~oklch black).
  - `--foreground`: Near-white text color.
  - `--card`: Slightly lighter dark shade for card surfaces.
  - `--primary`, `--accent`: Default teal/cyan highlight color.
  - `--border`, `--muted`: Subtle separator and subdued text colors.
- **`@theme inline`** — Maps these CSS variables to Tailwind's color utility names (`bg-background`, `text-foreground`, etc.) so you can use them in Tailwind class names.
- **`@layer base`** — Global base styles applied to all elements: transparent borders using the border variable color, and applying the background/text color to the `<body>`.

---

### 4.3 `src/app/page.tsx` — Home / Landing Page

This is the **first page** users see when they visit the app. It is a client-side React component (`"use client"`).

**Sections:**

**Header (Navbar)**
- A fixed top navigation bar with the Captspeare logo (Feather icon + "Capt**speare**" in cyan/blue gradient text).
- Uses `position: fixed` to stay visible as you scroll.

**Hero Section**
- An animated background with two blurred radial glow effects (cyan and blue) for the glassmorphism effect.
- A badge pill: "AI-Powered Content Generator".
- The main headline: "Transform Words Into **Social Media Gold**".
- A subtitle describing the app's purpose.

**Platform Selection Grid**
- Iterates over `platformList` (imported from `lib/platforms.ts`) using `.map()`.
- Renders one card per platform in a responsive `grid` (1 → 2 → 3 columns on different screen sizes).
- Each card is a `<Link>` component (from Next.js) that routes to `/{platform.id}` (e.g., `/linkedin`).
- On hover, the card slightly lifts (`-translate-y-1`) and shows a colored glow shadow.
- Displays: platform icon, platform name, description, and a "Generate →" link.

**Footer**
- Simple centered text with a Feather icon.

**Key imports:**
- `platformList` — The array of all 6 platform definitions.
- `getPlatformIcon()` — Returns the correct SVG icon for each platform ID.
- `cn()` — Merges Tailwind classes conditionally.

---

### 4.4 `src/app/[platform]/page.tsx` — Dynamic Generator Page

This is the most **complex file** in the project. The folder name `[platform]` uses Next.js **dynamic routing** — the word in brackets becomes a URL parameter. So `/linkedin`, `/instagram`, `/youtube` all use this same file, but receive a different `platform` string value.

**Key state variables:**
| State | Type | Purpose |
|-------|------|---------|
| `inputMode` | `"text"` or `"voice"` | Whether the user is typing or recording |
| `inputText` | `string` | The raw input text (typed or transcribed) |
| `outputText` | `string` | The AI-generated caption returned from the API |
| `isProcessing` | `boolean` | True while waiting for the AI response (shows spinner) |
| `isRecording` | `boolean` | True while audio is being recorded |
| `recordingTime` | `number` | Seconds elapsed during recording (shown as a timer) |
| `copied` | `boolean` | True briefly after the user copies text (shows checkmark) |
| `autoEmoji` | `boolean` | Whether to include emojis in the generated output |

**Key functions:**

`startRecording()`
- Calls `navigator.mediaDevices.getUserMedia({ audio: true })` to request microphone access.
- Creates a `MediaRecorder` instance to capture audio.
- Simultaneously starts `SpeechRecognition` (the browser's built-in voice-to-text engine) to transcribe speech in real time.
- Starts a 1-second interval timer to count recording seconds.
- As the user speaks, the transcription is continuously appended to `inputText`.

`stopRecording()`
- Stops both the `MediaRecorder` and the `SpeechRecognition` session.
- Stops all audio tracks on the microphone stream to release it.
- Clears the timer interval.

`formatTime(seconds)`
- Converts a raw second count into `M:SS` format (e.g., `1:23`) for the recording timer display.

`handleGenerate()`
- Called when the user clicks "Transform".
- Makes a `POST` request to `/api/generate` (the server-side AI route) with the body: `{ text, platform, autoEmoji }`.
- Sets `isProcessing = true` while waiting.
- On success, updates `outputText` with the AI result.
- On failure, shows the error message in the output box.

`handleCopy()`
- Uses `navigator.clipboard.writeText()` to copy the output text.
- Temporarily sets `copied = true` to show a "Copied!" confirmation badge.

**The Emoji Toggle:**
- A custom CSS-styled checkbox rendered as a toggle switch.
- When toggled ON, `autoEmoji` is `true` and is sent to the API, which instructs the AI to include relevant emojis.
- When toggled OFF, the AI is instructed to produce no emojis.

**The platform variable:**
- Extracted from `params` using React's `use()` hook.
- Looked up in the `platforms` object from `lib/platforms.ts`.
- If the platform ID is invalid (not in the map), `notFound()` is called, showing a 404 page.

**Dynamic theming:**
- Every color class (button color, glow, ring, gradient) comes from `platform.colors.XXX`.
- This means the same component automatically becomes blue for LinkedIn, red for YouTube, purple for Twitch, etc.

---

### 4.5 `src/app/api/generate/route.ts` — AI Backend API Route

This is the **server-side** brain of the application. Because it lives in the `api/` folder in Next.js, it runs **on the server**, never in the browser. This is critical for security — the API key is never exposed to the client.

**`getSystemPrompt(platform, autoEmoji)` function**
- Takes a platform ID string and the emoji toggle boolean.
- Returns a detailed set of instructions (a "system prompt") telling the AI exactly how to format and style its response for that platform.

**Platform-specific prompts:**
| Platform | Prompt Style |
|---------|-------------|
| LinkedIn | Hook-first, bullet points, professional tone, 3-5 hashtags |
| Instagram | Short first line (preview), conversational, 10-15 hashtags |
| X (Twitter) | Max 280 characters, punchy and direct, 1-2 hashtags |
| YouTube | ONE click-worthy SEO title under 60 characters |
| Twitch | ONE energetic stream title under 140 characters |
| Meme | ONE meme in the best fitting format (TOP/BOTTOM, POV, Nobody/Me when) |

**`POST` request handler:**
1. Reads `text`, `platform`, and `autoEmoji` from the incoming JSON request body.
2. Validates that `text` is not empty — returns a 400 error if it is.
3. Builds the system prompt by calling `getSystemPrompt()`.
4. Reads the Gemini API key from environment variables (`process.env.GEMINI_API_KEY`) or falls back to the hardcoded key.
5. Makes a `fetch` call to the Google Gemini REST API:
   - URL: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=...`
   - Body: Contains a `contents` array with a single message combining the system prompt and user input.
6. If the Gemini API returns a non-OK status, it extracts and returns the error message.
7. If successful, extracts `data.candidates[0].content.parts[0].text` — the actual generated text.
8. Returns it as a JSON response: `{ result: "..." }`.

---

### 4.6 `lib/platforms.ts` — Platform Configuration

This file is the **single source of truth** for all platform metadata. It defines the `Platform` TypeScript interface and creates an object/array of all 6 platforms.

**`PlatformId` type:**
A TypeScript union type: `'linkedin' | 'instagram' | 'twitter' | 'youtube' | 'twitch' | 'meme'`.
This ensures only valid platform strings can be used anywhere in the codebase.

**`Platform` interface:**
Each platform object contains:
- `id` — The URL slug.
- `name` — Display name (e.g., "X (Twitter)").
- `description` — Short tagline shown on the card.
- `placeholder` — Placeholder text for the textarea.
- `outputLabel` — What the generated content is called (e.g., "LinkedIn Caption", "Tweet", "Stream Title").
- `colors` — An object containing all Tailwind class names for that platform's theme:
  - `primary` — Main button/active tab background color.
  - `primaryHover` — Hover state of the primary color.
  - `glow` — Shadow color for glow effects.
  - `gradient` — Gradient direction for text and backgrounds.
  - `accent` — Text color using the platform's brand color.
  - `ring` — Ring/outline color.
  - `bg` — Translucent background tint for icons and badges.
  - `bgGlow` — Used for the animated hero background glow effect.

**`platformList`:**
`Object.values(platforms)` — Converts the platforms object into an array. Used by the home page to render the grid of cards.

---

### 4.7 `lib/utils.ts` — Utility Functions

A tiny but essential utility file.

**`cn(...inputs)` function:**
- Combines two libraries: `clsx` (which handles conditional class logic) and `tailwind-merge` (which handles conflicting Tailwind classes).
- Usage: `cn("text-white", isActive && "bg-blue-500")` — only applies `bg-blue-500` if `isActive` is true.
- This is the standard shadcn/ui pattern for building robust, conditional Tailwind styling.

---

### 4.8 `components/platform-icons.tsx` — Social Platform SVG Icons

Contains raw SVG icon components for each platform. These are NOT from a library — they are the actual official brand SVG paths.

**Icons included:**
- `LinkedInIcon` — "in" rounded square logo
- `InstagramIcon` — Camera aperture logo
- `TwitterIcon` — X logo (new X brand)
- `YouTubeIcon` — Play button inside a red rectangle
- `TwitchIcon` — Twitch speech bubble controller
- `MemeIcon` — Smiley face (emoji face)

**`getPlatformIcon(platformId, className)` function:**
- A `switch` statement that takes a platform ID and returns the correct icon component.
- The `className` prop is passed down so the parent can control icon size and color (e.g., `"h-7 w-7"`).

---

### 4.9 `.env.local` — Environment Variables

This file stores **secret API keys** that should never be shared or committed to version control. Next.js automatically reads this file on startup and makes the variables available to server-side code via `process.env.VARIABLE_NAME`.

**Variables:**
- `GEMINI_API_KEY` — Your Google AI Studio API key for accessing Gemini 2.5 Flash.
- `OPENAI_API_KEY` — OpenAI key (optional, no longer used in the current version).

**Security note:** This file is listed in `.gitignore` so it is never accidentally uploaded to GitHub.

---

## 5. How the AI Pipeline Works

```
User types/speaks text
         ↓
[Browser] Frontend collects text, platform ID, emoji boolean
         ↓
[Browser] POST /api/generate  →  { text, platform, autoEmoji }
         ↓
[Server] route.ts receives the request
         ↓
[Server] getSystemPrompt() builds the tailored AI instructions
         ↓
[Server] Fetches Google Gemini 2.5 Flash REST API with the prompt + user input
         ↓
[Gemini AI] Processes and generates platform-optimized content
         ↓
[Server] Extracts text from candidates[0].content.parts[0].text
         ↓
[Server] Returns { result: "..." } JSON to the browser
         ↓
[Browser] Sets outputText state → UI renders the caption card
```

---

## 6. Platform-Specific Prompts

| Platform | Format | Length | Special Rules |
|---------|--------|--------|--------------|
| **LinkedIn** | Hook + Bullets + CTA + Hashtags | Medium-long | Professional but personal tone |
| **Instagram** | Hook + Story + CTA + Heavy Hashtags | Medium | First line must hook (preview cutoff) |
| **X (Twitter)** | Short punchy statement | Max 280 characters | No padding, wit preferred |
| **YouTube** | ONE click-worthy title | Max 60 characters | SEO power words required |
| **Twitch** | ONE stream title | Max 140 characters | Energetic, hints at content |
| **Meme** | ONE meme in best format | Short | TOP/BOTTOM, POV, or Nobody/Me when |

---

## 7. Features Summary

| Feature | Description |
|---------|-------------|
| **6 Platform Generators** | LinkedIn, Instagram, X/Twitter, YouTube, Twitch, Meme |
| **Color Theming** | Each platform has a unique brand color applied across the entire page |
| **Text Input** | Full textarea with character counter |
| **Voice Input** | Browser-native real-time speech transcription with recording timer |
| **Emoji Toggle** | Switch to include or exclude emojis from AI output |
| **Copy to Clipboard** | One-click copy with visual confirmation |
| **Regenerate** | Send the same prompt again for a fresh AI response |
| **Responsive Design** | Works on desktop, tablet and mobile |
| **Dark Mode** | Permanently set dark mode with glassmorphism card effects |
| **Privacy** | API keys are server-side only, never sent to browser |

---

## 8. How to Run the Project

### Prerequisites
- Node.js 18+ installed
- A free Google Gemini API key from https://aistudio.google.com

### Steps

1. **Open a terminal** and navigate to the project folder:
   ```
   cd "C:\Users\Ben R\.gemini\antigravity\scratch\captspeare"
   ```

2. **Install dependencies** (only needed once):
   ```
   npm install
   ```

3. **Add your API key** — Open `.env.local` and add:
   ```
   GEMINI_API_KEY="your-key-here"
   ```

4. **Start the development server:**
   ```
   npm run dev
   ```

5. **Open your browser** at:
   ```
   http://localhost:3000
   ```

6. Select a platform, type your thought, and hit **Transform**!

---

*Captspeare — Turn your words into social media magic.*
