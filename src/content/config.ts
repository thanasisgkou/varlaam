import { defineCollection, z } from 'astro:content';

const news = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string(),
    image: z.string().optional(),
    author: z.string().default('Σύλλογος Βαρλαάμ'),
  }),
});

const events = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    location: z.string(),
    excerpt: z.string(),
    image: z.string().optional(),
  }),
});

const gallery = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    titleEn: z.string().optional(),
    category: z.enum(['village', 'events', 'old-photos', 'nature', 'attractions']),
    theme: z.string().optional(),
    year: z.number().optional(),
    image: z.string(),
    description: z.string().optional(),
    descriptionEn: z.string().optional(),
    date: z.coerce.date().optional(),
  }),
});

const galleryAlbums = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    titleEn: z.string().optional(),
    year: z.number(),
    theme: z.enum(['feast', 'celebration', 'village', 'other']),
    description: z.string().optional(),
    descriptionEn: z.string().optional(),
    cover: z.string().optional(),
    order: z.number().default(0),
    photos: z.array(
      z.object({
        image: z.string(),
        caption: z.string().optional(),
        captionEn: z.string().optional(),
      })
    ).default([]),
  }),
});

const attractions = defineCollection({
  type: 'data',
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    titleEn: z.string(),
    order: z.number().default(0),
    summary: z.string(),
    summaryEn: z.string(),
    body: z.string(),
    bodyEn: z.string(),
    gps: z.object({ lat: z.number(), lng: z.number() }).optional(),
    externalUrl: z.string().optional(),
    photoFolder: z.string(),
    photoCount: z.number().default(0),
  }),
});

const diasporaStories = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    location: z.string(),
    date: z.coerce.date(),
    excerpt: z.string(),
    image: z.string().optional(),
  }),
});

const diasporaBulletin = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    author: z.string(),
    date: z.coerce.date(),
    approved: z.boolean().default(false),
  }),
});

const memories = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    category: z.enum(['summer', 'winter', 'dhloti', 'nicknames', 'dialect', 'first-time']),
    author: z.string().default('Ανώνυμος/η'),
    authorLocation: z.string().optional(),
    year: z.string().optional(),
    image: z.string().optional(),
    approved: z.boolean().default(false),
    submittedAt: z.coerce.date().optional(),
  }),
});

export const collections = {
  news,
  events,
  gallery,
  'gallery-albums': galleryAlbums,
  attractions,
  'diaspora-stories': diasporaStories,
  'diaspora-bulletin': diasporaBulletin,
  memories,
};
