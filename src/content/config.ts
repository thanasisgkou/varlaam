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
    category: z.enum(['village', 'events', 'old-photos', 'nature']),
    image: z.string(),
    description: z.string().optional(),
    date: z.coerce.date().optional(),
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

export const collections = {
  news,
  events,
  gallery,
  'diaspora-stories': diasporaStories,
  'diaspora-bulletin': diasporaBulletin,
};
