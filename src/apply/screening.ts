export type Screening = {
  sectors: string[]
  stage: string
  score: number
  verdict: 'strong' | 'promising' | 'early' | 'weak'
  summary: string
  strengths: string[]
  flags: string[]
  matchedTheses: string[]
  needsFollowUp: boolean
  missingItems: string[]
}

export type ScreeningResultData = Omit<Screening, 'needsFollowUp' | 'missingItems'>
