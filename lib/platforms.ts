export type PlatformId = 'linkedin' | 'instagram' | 'twitter' | 'youtube' | 'twitch' | 'meme'

export interface Platform {
  id: PlatformId
  name: string
  description: string
  placeholder: string
  outputLabel: string
  colors: {
    primary: string
    primaryHover: string
    glow: string
    gradient: string
    accent: string
    ring: string
    bg: string
    bgGlow: string
  }
}

export const platforms: Record<PlatformId, Platform> = {
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Professional captions that drive engagement',
    placeholder: 'Share your professional achievement, insight, or story...',
    outputLabel: 'LinkedIn Caption',
    colors: {
      primary: 'bg-[#0A66C2]',
      primaryHover: 'hover:bg-[#004182]',
      glow: 'shadow-[#0A66C2]/30',
      gradient: 'from-[#0A66C2] to-[#004182]',
      accent: 'text-[#0A66C2]',
      ring: 'ring-[#0A66C2]/50',
      bg: 'bg-[#0A66C2]/10',
      bgGlow: 'bg-[#0A66C2]/20',
    },
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    description: 'Eye-catching captions for your visual stories',
    placeholder: 'Describe your photo, moment, or vibe...',
    outputLabel: 'Instagram Caption',
    colors: {
      primary: 'bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737]',
      primaryHover: 'hover:from-[#6B2D95] hover:via-[#C4285C] hover:to-[#D4652F]',
      glow: 'shadow-[#E1306C]/30',
      gradient: 'from-[#833AB4] via-[#E1306C] to-[#F77737]',
      accent: 'text-[#E1306C]',
      ring: 'ring-[#E1306C]/50',
      bg: 'bg-[#E1306C]/10',
      bgGlow: 'bg-[#E1306C]/20',
    },
  },
  twitter: {
    id: 'twitter',
    name: 'X (Twitter)',
    description: 'Punchy tweets that go viral',
    placeholder: 'What thought do you want to share with the world?',
    outputLabel: 'Tweet',
    colors: {
      primary: 'bg-[#1d9bf0]',
      primaryHover: 'hover:bg-[#1a8cd8]',
      glow: 'shadow-[#1d9bf0]/20',
      gradient: 'from-[#1d9bf0] to-[#1a8cd8]',
      accent: 'text-[#1d9bf0]',
      ring: 'ring-[#1d9bf0]/30',
      bg: 'bg-[#1d9bf0]/10',
      bgGlow: 'bg-[#1d9bf0]/5',
    },
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    description: 'Click-worthy titles that boost views',
    placeholder: 'Describe your video content or topic...',
    outputLabel: 'YouTube Title',
    colors: {
      primary: 'bg-[#FF0000]',
      primaryHover: 'hover:bg-[#CC0000]',
      glow: 'shadow-[#FF0000]/30',
      gradient: 'from-[#FF0000] to-[#CC0000]',
      accent: 'text-[#FF0000]',
      ring: 'ring-[#FF0000]/50',
      bg: 'bg-[#FF0000]/10',
      bgGlow: 'bg-[#FF0000]/20',
    },
  },
  twitch: {
    id: 'twitch',
    name: 'Twitch',
    description: 'Stream titles that attract viewers',
    placeholder: 'What are you streaming today?',
    outputLabel: 'Stream Title',
    colors: {
      primary: 'bg-[#9146FF]',
      primaryHover: 'hover:bg-[#772CE8]',
      glow: 'shadow-[#9146FF]/30',
      gradient: 'from-[#9146FF] to-[#772CE8]',
      accent: 'text-[#9146FF]',
      ring: 'ring-[#9146FF]/50',
      bg: 'bg-[#9146FF]/10',
      bgGlow: 'bg-[#9146FF]/20',
    },
  },
  meme: {
    id: 'meme',
    name: 'Meme Generator',
    description: 'Turn your thoughts into viral meme text',
    placeholder: 'Describe a funny situation or feeling...',
    outputLabel: 'Meme Text',
    colors: {
      primary: 'bg-[#00D26A]',
      primaryHover: 'hover:bg-[#00B85C]',
      glow: 'shadow-[#00D26A]/30',
      gradient: 'from-[#00D26A] to-[#00B85C]',
      accent: 'text-[#00D26A]',
      ring: 'ring-[#00D26A]/50',
      bg: 'bg-[#00D26A]/10',
      bgGlow: 'bg-[#00D26A]/20',
    },
  },
}

export const platformList = Object.values(platforms)
