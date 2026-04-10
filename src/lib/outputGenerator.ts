import type { TranscriptChunk, Marker, Insight, CallOutput } from '@/shared/types';
import { formatTimestamp } from './utils';

/**
 * Local (non-AI) output generation for MVP.
 * Produces structured outputs from raw session data.
 * AI-powered generation will be added in v0.2 via backend extraction service.
 */

export function generateLocalOutput(
  type: CallOutput['type'],
  chunks: TranscriptChunk[],
  markers: Marker[],
  insights: Insight[],
): string {
  switch (type) {
    case 'executive-summary':
      return generateExecutiveSummary(chunks, markers, insights);
    case 'categorized-notes':
      return generateCategorizedNotes(markers, insights);
    case 'follow-up-email':
      return generateFollowUpEmail(chunks, markers, insights);
    case 'crm-note':
      return generateCRMNote(chunks, markers, insights);
    default:
      return '';
  }
}

function generateExecutiveSummary(
  chunks: TranscriptChunk[],
  markers: Marker[],
  insights: Insight[],
): string {
  const duration = chunks.length > 0
    ? formatTimestamp(chunks[chunks.length - 1].timestamp)
    : '0:00';

  const speakers = new Set(chunks.map((c) => c.speaker));

  let summary = `# Call Summary\n\n`;
  summary += `**Duration:** ${duration}\n`;
  summary += `**Participants:** ${[...speakers].join(', ') || 'Unknown'}\n`;
  summary += `**Tags:** ${markers.length}\n\n`;

  if (insights.length > 0) {
    const painPoints = insights.filter((i) => i.category === 'pain-point');
    const outcomes = insights.filter((i) => i.category === 'desired-outcome');
    const objections = insights.filter((i) => i.category === 'objection');
    const buyingSignals = insights.filter((i) => i.category === 'buying-signal');
    const followUps = insights.filter((i) => i.category === 'follow-up');

    if (painPoints.length > 0) {
      summary += `## Pain Points\n`;
      painPoints.forEach((p) => { summary += `- ${p.text}\n`; });
      summary += '\n';
    }

    if (outcomes.length > 0) {
      summary += `## Desired Outcomes\n`;
      outcomes.forEach((o) => { summary += `- ${o.text}\n`; });
      summary += '\n';
    }

    if (objections.length > 0) {
      summary += `## Objections\n`;
      objections.forEach((o) => { summary += `- ${o.text}\n`; });
      summary += '\n';
    }

    if (buyingSignals.length > 0) {
      summary += `## Buying Signals\n`;
      buyingSignals.forEach((b) => { summary += `- ${b.text}\n`; });
      summary += '\n';
    }

    if (followUps.length > 0) {
      summary += `## Follow-ups\n`;
      followUps.forEach((f) => { summary += `- ${f.text}\n`; });
      summary += '\n';
    }
  }

  // Key moments from markers
  if (markers.length > 0) {
    summary += `## Key Moments\n`;
    markers.forEach((m) => {
      summary += `- **${formatTimestamp(m.timestamp)}** [${m.label}]${m.note ? ` — ${m.note}` : ''}\n`;
    });
  }

  return summary;
}

function generateCategorizedNotes(markers: Marker[], insights: Insight[]): string {
  let notes = '# Categorized Notes\n\n';

  // Group markers by type
  const markersByType = new Map<string, Marker[]>();
  for (const m of markers) {
    const list = markersByType.get(m.type) || [];
    list.push(m);
    markersByType.set(m.type, list);
  }

  for (const [type, items] of markersByType) {
    notes += `## ${type.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}\n`;
    items.forEach((m) => {
      notes += `- [${formatTimestamp(m.timestamp)}] ${m.label}${m.note ? `: ${m.note}` : ''}\n`;
    });
    notes += '\n';
  }

  // Group insights by category
  if (insights.length > 0) {
    notes += '---\n\n# AI Insights\n\n';
    const byCategory = new Map<string, Insight[]>();
    for (const i of insights) {
      const list = byCategory.get(i.category) || [];
      list.push(i);
      byCategory.set(i.category, list);
    }

    for (const [cat, items] of byCategory) {
      notes += `## ${cat.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}\n`;
      items.forEach((i) => {
        const tag = i.source === 'direct' ? '[Direct]' : '[Inferred]';
        notes += `- ${tag} ${i.text}`;
        if (i.evidenceQuote) notes += ` ("${i.evidenceQuote}")`;
        notes += '\n';
      });
      notes += '\n';
    }
  }

  return notes;
}

function generateFollowUpEmail(
  chunks: TranscriptChunk[],
  markers: Marker[],
  insights: Insight[],
): string {
  const actionItems = markers.filter((m) => m.type === 'action-item');
  const followUps = insights.filter((i) => i.category === 'follow-up');

  let email = `Subject: Follow-up from our call\n\n`;
  email += `Hi [Name],\n\n`;
  email += `Thank you for taking the time to meet today. Here's a quick recap of what we discussed:\n\n`;

  if (actionItems.length > 0 || followUps.length > 0) {
    email += `**Next Steps:**\n`;
    actionItems.forEach((a) => {
      email += `- ${a.note || a.label}\n`;
    });
    followUps.forEach((f) => {
      email += `- ${f.text}\n`;
    });
    email += '\n';
  }

  const painPoints = insights.filter((i) => i.category === 'pain-point');
  if (painPoints.length > 0) {
    email += `**Key challenges we discussed:**\n`;
    painPoints.forEach((p) => {
      email += `- ${p.text}\n`;
    });
    email += '\n';
  }

  email += `Please let me know if I missed anything or if you have any questions.\n\n`;
  email += `Best,\n[Your Name]`;

  return email;
}

function generateCRMNote(
  chunks: TranscriptChunk[],
  markers: Marker[],
  insights: Insight[],
): string {
  const data: Record<string, unknown> = {
    callDate: new Date().toISOString(),
    duration: chunks.length > 0
      ? formatTimestamp(chunks[chunks.length - 1].timestamp)
      : '0:00',
    participants: [...new Set(chunks.map((c) => c.speaker))],
    painPoints: insights
      .filter((i) => i.category === 'pain-point')
      .map((i) => i.text),
    objections: insights
      .filter((i) => i.category === 'objection')
      .map((i) => i.text),
    buyingSignals: insights
      .filter((i) => i.category === 'buying-signal')
      .map((i) => i.text),
    nextSteps: [
      ...markers.filter((m) => m.type === 'action-item').map((m) => m.note || m.label),
      ...insights.filter((i) => i.category === 'follow-up').map((i) => i.text),
    ],
    budget: insights
      .filter((i) => i.category === 'budget')
      .map((i) => i.text),
    authority: insights
      .filter((i) => i.category === 'authority')
      .map((i) => i.text),
    urgency: insights
      .filter((i) => i.category === 'urgency')
      .map((i) => i.text),
    markerCount: markers.length,
    insightCount: insights.length,
  };

  return JSON.stringify(data, null, 2);
}
