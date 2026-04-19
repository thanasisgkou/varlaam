export interface IcsEvent {
  uid: string;
  title: string;
  description: string;
  location: string;
  start: Date;
  end?: Date;
  url?: string;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function formatIcsDate(d: Date): string {
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
}

function escapeIcs(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function foldLine(line: string): string {
  // RFC 5545: lines MUST NOT exceed 75 octets; long lines folded with CRLF + space
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  let i = 0;
  while (i < line.length) {
    const size = i === 0 ? 75 : 74;
    chunks.push(line.slice(i, i + size));
    i += size;
  }
  return chunks.join('\r\n ');
}

export function buildIcs(events: IcsEvent[]): string {
  const now = new Date();
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Varlaam Ioannina//varlaam.netlify.app//EL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Βαρλαάμ — Εκδηλώσεις',
    'X-WR-TIMEZONE:Europe/Athens',
  ];
  for (const e of events) {
    const end = e.end ?? new Date(e.start.getTime() + 2 * 60 * 60 * 1000);
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${e.uid}`);
    lines.push(`DTSTAMP:${formatIcsDate(now)}`);
    lines.push(`DTSTART:${formatIcsDate(e.start)}`);
    lines.push(`DTEND:${formatIcsDate(end)}`);
    lines.push(`SUMMARY:${escapeIcs(e.title)}`);
    lines.push(`DESCRIPTION:${escapeIcs(e.description)}`);
    lines.push(`LOCATION:${escapeIcs(e.location)}`);
    if (e.url) lines.push(`URL:${e.url}`);
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.map(foldLine).join('\r\n') + '\r\n';
}
