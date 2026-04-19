import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
  const news = (await getCollection('news')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );
  return rss({
    title: 'Βαρλαάμ Ιωαννίνων — Ανακοινώσεις',
    description:
      'Τα τελευταία νέα και ανακοινώσεις από τον Σύλλογο Βαρλαάμ Ιωαννίνων.',
    site: site ?? 'https://varlaam.netlify.app',
    items: news.map((post) => ({
      title: post.data.title,
      description: post.data.excerpt,
      pubDate: post.data.date,
      link: `/news/${post.slug}/`,
      author: post.data.author,
    })),
    customData: `<language>el-GR</language>`,
  });
};
