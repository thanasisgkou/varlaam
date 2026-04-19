import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { buildIcs } from '../../utils/ics';

export const GET: APIRoute = async ({ site }) => {
  const events = await getCollection('events');
  const base = site?.toString().replace(/\/$/, '') ?? 'https://varlaam.netlify.app';
  const ics = buildIcs(
    events
      .sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf())
      .map((e) => ({
        uid: `${e.slug}@varlaam.gr`,
        title: e.data.title,
        description: e.data.excerpt,
        location: e.data.location,
        start: e.data.date,
        end: e.data.endDate,
        url: `${base}/events/${e.slug}/`,
      }))
  );
  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="varlaam-events.ics"',
    },
  });
};
