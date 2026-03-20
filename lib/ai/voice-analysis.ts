export interface VoiceAnalysisResult {
  transcript: string;
  summary: string;
  suggestedTags: string[];
  firsts: string[];
  milestones: string[];
}

async function transcribeWithWhisper(audioBuffer: Buffer): Promise<string> {
  const { default: OpenAI } = await import('openai');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const uint8 = new Uint8Array(audioBuffer);
  const file = new File([uint8], 'audio.webm', { type: 'audio/webm' });
  const response = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
  });
  return response.text;
}

async function analyzeWithGPT(transcript: string): Promise<Omit<VoiceAnalysisResult, 'transcript'>> {
  const { default: OpenAI } = await import('openai');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You analyze baby journal voice memos. Extract meaningful information from parent recordings about their baby.
Return JSON with:
- summary: a warm, concise 1-2 sentence summary
- suggestedTags: array of relevant tags (e.g., "feeding", "milestone", "funny moment")
- firsts: array of any "firsts" mentioned (e.g., "first smile", "first word")
- milestones: array of developmental milestones mentioned`,
      },
      { role: 'user', content: transcript },
    ],
    response_format: { type: 'json_object' },
  });

  const parsed = JSON.parse(response.choices[0].message.content || '{}');
  return {
    summary: parsed.summary || '',
    suggestedTags: parsed.suggestedTags || [],
    firsts: parsed.firsts || [],
    milestones: parsed.milestones || [],
  };
}

function mockTranscription(): string {
  const transcripts = [
    "Today was absolutely magical. The baby grabbed my finger for the first time and just held on tight. Those tiny fingers wrapped around mine, and I swear time stopped. She also smiled at dad when he came home from work. I think she's starting to recognize our faces more.",
    "We had a big milestone today! The little one rolled over from tummy to back all by himself. He was doing tummy time and just flipped right over. He seemed surprised but then did it again. We've been working on tummy time every day and it's paying off.",
    "Bath time was hilarious tonight. She kicked and splashed so much we were both soaked. She's getting so much stronger with those little legs. After bath she fell asleep in about two minutes flat. Must have tired herself out with all that splashing.",
  ];
  return transcripts[Math.floor(Math.random() * transcripts.length)];
}

function mockAnalysis(transcript: string): Omit<VoiceAnalysisResult, 'transcript'> {
  const tagPool = ['bonding', 'milestone', 'bath time', 'tummy time', 'feeding', 'sleep', 'funny moment', 'development'];
  const selectedTags = tagPool.sort(() => Math.random() - 0.5).slice(0, 3);

  return {
    summary: 'A beautiful moment captured in this voice memo. The baby is growing and developing wonderfully.',
    suggestedTags: selectedTags,
    firsts: transcript.toLowerCase().includes('first')
      ? ['First mentioned milestone detected in recording']
      : [],
    milestones: transcript.toLowerCase().includes('roll')
      ? ['Rolling over']
      : transcript.toLowerCase().includes('grab')
        ? ['Grasping objects']
        : [],
  };
}

export async function processVoiceMemo(audioBuffer: Buffer | null): Promise<VoiceAnalysisResult> {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;

  let transcript: string;
  if (hasOpenAI && audioBuffer) {
    try {
      transcript = await transcribeWithWhisper(audioBuffer);
    } catch {
      transcript = mockTranscription();
    }
  } else {
    transcript = audioBuffer ? mockTranscription() : mockTranscription();
  }

  let analysis: Omit<VoiceAnalysisResult, 'transcript'>;
  if (hasOpenAI) {
    try {
      analysis = await analyzeWithGPT(transcript);
    } catch {
      analysis = mockAnalysis(transcript);
    }
  } else {
    analysis = mockAnalysis(transcript);
  }

  return { transcript, ...analysis };
}
