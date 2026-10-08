export interface SpeechPiece {
  isFinal: boolean;
  transcript: string;
}

/** One recognition pass, rebuilt from the full result list so a resent final is not appended again. */
export function readSession(pieces: SpeechPiece[]): { finalText: string; interim: string } {
  let finalText = "";
  let interim = "";
  for (const piece of pieces) {
    const transcript = piece?.transcript ?? "";
    if (!transcript) continue;
    if (piece.isFinal) {
      finalText = appendSpeech(finalText, transcript);
    } else if (!interim.endsWith(transcript)) {
      interim += transcript;
    }
  }
  if (interim && (finalText.endsWith(interim) || finalText === interim)) interim = "";
  return { finalText, interim };
}

/** Adds new speech without copying a phrase that is already at the end. */
export function appendSpeech(committed: string, addition: string): string {
  const extra = addition ?? "";
  if (!extra) return committed;
  if (!committed) return undoubleTranscript(extra);
  if (committed.endsWith(extra)) return committed;
  const limit = Math.min(committed.length, extra.length);
  for (let size = limit; size > 0; size -= 1) {
    if (committed.endsWith(extra.slice(0, size))) return undoubleTranscript(committed + extra.slice(size));
  }
  return undoubleTranscript(committed + extra);
}

/** Collapses a transcript that is the same phrase printed twice. */
export function undoubleTranscript(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length < 8 || trimmed.length % 2 !== 0) return text;
  const half = trimmed.length / 2;
  if (trimmed.slice(0, half) !== trimmed.slice(half)) return text;
  const lead = text.length - text.trimStart().length;
  return text.slice(lead, lead + half);
}

export function commitInterim(finalText: string, interim: string): string {
  return appendSpeech(finalText, interim);
}
