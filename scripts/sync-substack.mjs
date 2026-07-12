import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const feeds = [
  { url: 'https://tvpian.substack.com/feed', publication: 'Personal notes' },
  { url: 'https://humanintheloom.substack.com/feed', publication: 'Human in the Loom' },
];

const decode = (value = '') => value
  .replace(/^\s*<!\[CDATA\[|\]\]>\s*$/g, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&apos;|&#39;/g, "'")
  .replace(/\s+/g, ' ')
  .trim();

const field = (xml, tag) => {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return decode(match?.[1]);
};

const entries = (xml, publication) => [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map(([, item]) => {
  const published = field(item, 'pubDate');
  return {
    publication,
    title: field(item, 'title'),
    description: field(item, 'description'),
    url: field(item, 'link'),
    date: new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(published)),
    published: new Date(published).toISOString(),
  };
});

const all = [];
for (const feed of feeds) {
  const response = await fetch(feed.url, { headers: { 'user-agent': 'tvpian.github.io feed sync' } });
  if (!response.ok) throw new Error(`Unable to fetch ${feed.url}: ${response.status}`);
  all.push(...entries(await response.text(), feed.publication));
}

const essays = all
  .filter(({ title, description, url, published }) => title && description && url && published)
  .sort((a, b) => b.published.localeCompare(a.published))
  .slice(0, 10);

if (essays.length < 2) throw new Error('Feed sync returned too few essays; keeping the previous snapshot.');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'human-in-the-loom', 'essays.json');
await writeFile(output, `${JSON.stringify({ updatedAt: essays[0].published, essays }, null, 2)}\n`);
console.log(`Synced ${essays.length} essays from ${feeds.length} Substack feeds.`);
