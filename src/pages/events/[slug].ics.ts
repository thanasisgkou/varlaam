import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { buildIcs } from '../../utils/ics';

export async function getStaticPaths() {
  const events = await getCollection('events');
  return events.map((entry) => ({
    params: { slug: entry.slug },
    props: { entry },
  }));
}

export const GET: APIRoute = ({ props, site }) => {
  const { entry } = props as { entry: Awaited<ReturnType<typeof getCollection<'events'>>>[number] };
  const data = entry.data;
  const base = site?.toString().replace(/\/$/, '') ?? 'https://varlaam.netlify.app';
  const ics = buildIcs([
    {
      uid: `${entry.slug}@varlaam.gr`,
      title: data.title,
      description: data.excerpt,
      location: data.location,
      start: data.date,
      end: data.endDate,
      url: `${base}/events/${entry.slug}/`,
    },
  ]);
  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${entry.slug}.ics"`,
    },
  });
};
