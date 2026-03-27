"use client"

import { use, useState, useRef, useEffect } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Feather, ArrowLeft, Mic, MicOff, Type, Wand2, Copy, RefreshCw, Check, Sparkles, Hash } from "lucide-react"
import { platforms, PlatformId } from "@/lib/platforms"
import { getPlatformIcon } from "@/components/platform-icons"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PageProps {
  params: Promise<{ platform: string }>
}

export default function PlatformPage({ params }: PageProps) {
  const { platform: platformId } = use(params)
  const platform = platforms[platformId as PlatformId]

  if (!platform) {
    notFound()
  }

  const [inputMode, setInputMode] = useState<"text" | "voice">("text")
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [copied, setCopied] = useState(false)
  const [autoEmoji, setAutoEmoji] = useState(true)
  const [includeHashtags, setIncludeHashtags] = useState(true)
  const [isLong, setIsLong] = useState(false)
  const [tone, setTone] = useState<string>(platform.tones[0])
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = "en-US"
        recognitionRef.current = recognition
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

      if (recognitionRef.current) {
        const startText = inputText
        recognitionRef.current.onresult = (event: any) => {
          let resultText = ""
          for (let i = 0; i < event.results.length; i++) {
            resultText += event.results[i][0].transcript
          }
          setInputText(startText + (startText ? " " : "") + resultText)
        }
        recognitionRef.current.start()
      }
    } catch {
      alert("Could not access microphone. Please check your permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    if (recognitionRef.current) recognitionRef.current.stop()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleGenerate = async () => {
    if (!inputText.trim()) return
    setIsProcessing(true)
    setOutputText("")
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: inputText, 
          platform: platform.id, 
          autoEmoji,
          tone,
          includeHashtags,
          isLong
        })
      })
      const data = await res.json()
      if (data.result) {
        setOutputText(data.result)
      } else {
        setOutputText(`Error: ${data.error}`)
      }
    } catch {
      setOutputText("Failed to connect to API. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(outputText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg ring-1",
              platform.colors.bg,
              platform.colors.ring
            )}>
              <Feather className={cn("h-5 w-5", platform.colors.accent)} />
            </div>
            <span className="text-xl font-semibold tracking-tight text-foreground">
              Capt<span className={cn("bg-gradient-to-r bg-clip-text text-transparent", platform.colors.gradient)}>speare</span>
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            All Platforms
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-8">
        <div className="pointer-events-none absolute inset-0">
          <div className={cn(
            "absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full blur-3xl opacity-30",
            platform.colors.bgGlow
          )} />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className={cn(
            "mb-6 inline-flex items-center gap-3 rounded-full border px-4 py-2 backdrop-blur-sm",
            platform.colors.bg,
            platform.colors.ring.replace("ring-", "border-")
          )}>
            <span className={platform.colors.accent}>
              {getPlatformIcon(platform.id, "h-5 w-5")}
            </span>
            <span className={cn("font-medium", platform.colors.accent)}>
              {platform.name} Generator
            </span>
          </div>

          <h1 className="mb-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Create Perfect{" "}
            <span className={cn("bg-gradient-to-r bg-clip-text text-transparent", platform.colors.gradient)}>
              {platform.outputLabel}s
            </span>
          </h1>

          <p className="mx-auto max-w-xl text-muted-foreground">
            {platform.description}. Just speak or type your thoughts.
          </p>
        </div>
      </section>

      {/* Input Section */}
      <section className="py-8">
        <div className="mx-auto max-w-3xl px-6">
          {/* Input Mode Toggle */}
          <div className="mb-6 flex justify-center">
            <div className="inline-flex rounded-xl border border-border bg-secondary/30 p-1 backdrop-blur-sm">
              <button
                onClick={() => setInputMode("text")}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all",
                  inputMode === "text"
                    ? cn(platform.colors.primary, "text-white shadow-lg")
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Type className="h-4 w-4" />
                Text
              </button>
              <button
                onClick={() => setInputMode("voice")}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all",
                  inputMode === "voice"
                    ? cn(platform.colors.primary, "text-white shadow-lg")
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Mic className="h-4 w-4" />
                Voice
              </button>
            </div>
          </div>

          {/* Input Card */}
          <div className={cn(
            "relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 shadow-xl backdrop-blur-xl",
          )}>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />

            {inputMode === "text" ? (
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={platform.placeholder}
                className="relative min-h-[160px] w-full resize-none bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
            ) : (
              <div className="flex min-h-[160px] flex-col items-center justify-center gap-6">
                {isRecording ? (
                  <>
                    <div className="relative">
                      <div className={cn(
                        "absolute inset-0 animate-ping rounded-full opacity-30",
                        platform.colors.bgGlow
                      )} />
                      <div className={cn(
                        "relative flex h-20 w-20 items-center justify-center rounded-full ring-4",
                        platform.colors.bg,
                        platform.colors.ring
                      )}>
                        <Mic className={cn("h-8 w-8", platform.colors.accent)} />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-mono text-2xl font-semibold text-foreground">
                        {formatTime(recordingTime)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">Recording...</p>
                    </div>
                    <button
                      onClick={stopRecording}
                      className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <MicOff className="h-4 w-4" />
                      Stop Recording
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={startRecording}
                      className={cn(
                        "group flex h-24 w-24 items-center justify-center rounded-full ring-2 transition-all hover:scale-105",
                        platform.colors.bg,
                        platform.colors.ring
                      )}
                    >
                      <Mic className={cn("h-10 w-10 transition-transform group-hover:scale-110", platform.colors.accent)} />
                    </button>
                    <p className="text-center text-muted-foreground">
                      Click the microphone to start recording
                    </p>
                  </>
                )}

                {inputText && !isRecording && (
                  <div className="mt-4 w-full rounded-xl border border-border/50 bg-secondary/30 p-4">
                    <p className="text-sm text-muted-foreground">Transcription:</p>
                    <p className="mt-1 text-foreground">{inputText}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Generate Options */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {inputText.length} characters
              </span>
              {/* Emoji Toggle */}
              <label className="flex cursor-pointer items-center gap-2">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={autoEmoji}
                    onChange={(e) => setAutoEmoji(e.target.checked)}
                  />
                  <div className={cn(
                    "h-5 w-9 rounded-full transition-colors",
                    autoEmoji ? platform.colors.primary : "bg-secondary"
                  )} />
                  <div className={cn(
                    "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                    autoEmoji ? "left-5" : "left-0.5"
                  )} />
                </div>
                <span className="text-sm text-muted-foreground">Emojis</span>
              </label>

              {/* Hashtag Toggle */}
              <label className="flex cursor-pointer items-center gap-2">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={includeHashtags}
                    onChange={(e) => setIncludeHashtags(e.target.checked)}
                  />
                  <div className={cn(
                    "h-5 w-9 rounded-full transition-colors",
                    includeHashtags ? platform.colors.primary : "bg-secondary"
                  )} />
                  <div className={cn(
                    "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                    includeHashtags ? "left-5" : "left-0.5"
                  )} />
                </div>
                <span className="text-sm text-muted-foreground">Hashtags</span>
              </label>

              {/* Length Toggle */}
              <label className="flex cursor-pointer items-center gap-2">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isLong}
                    onChange={(e) => setIsLong(e.target.checked)}
                  />
                  <div className={cn(
                    "h-5 w-9 rounded-full transition-colors",
                    isLong ? platform.colors.primary : "bg-secondary"
                  )} />
                  <div className={cn(
                    "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                    isLong ? "left-5" : "left-0.5"
                  )} />
                </div>
                <span className="text-sm text-muted-foreground">{isLong ? "Long" : "Short"}</span>
              </label>

              {/* Tone Selection */}
              <div className="ml-2 flex items-center gap-2">
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger size="sm" className="w-[140px] border-border/50 bg-secondary/30 backdrop-blur-sm">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {platform.tones.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={!inputText.trim() || isProcessing}
              className={cn(
                "flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                platform.colors.primary,
                platform.colors.primaryHover
              )}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Crafting...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Transform
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Output Section */}
      {(outputText || isProcessing) && (
        <section className="py-8 pb-16">
          <div className="mx-auto max-w-3xl px-6">
            <div className={cn(
              "relative overflow-hidden rounded-2xl border bg-card/50 p-6 shadow-xl backdrop-blur-xl",
              platform.colors.ring.replace("ring-", "border-")
            )}>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />

              <div className="relative">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className={cn("h-5 w-5", platform.colors.accent)} />
                    <h3 className="font-semibold text-foreground">
                      Your {platform.outputLabel}
                    </h3>
                  </div>

                  {outputText && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleGenerate}
                        disabled={isProcessing}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary/50"
                      >
                        <RefreshCw className={cn("h-4 w-4", isProcessing && "animate-spin")} />
                      </button>
                      <button
                        onClick={handleCopy}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-secondary/50",
                          copied ? "text-green-400" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  )}
                </div>

                {isProcessing ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <RefreshCw className={cn("mx-auto h-8 w-8 animate-spin", platform.colors.accent)} />
                      <p className="mt-4 text-muted-foreground">
                        Crafting your perfect {platform.outputLabel.toLowerCase()}...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap rounded-xl bg-secondary/30 p-4 text-foreground">
                    {outputText}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
