import type { OutlineItem } from '../types';
import { Slugger } from './slugger';

/**
 * Parses markdown text to extract H1, H2, and H3 headings for an outline.
 * @param markdown The markdown content.
 * @returns An array of outline items.
 */
export const parseHeadings = (markdown: string): OutlineItem[] => {
  if (!markdown) return [];

  const headingRegex = /^(#{1,3})\s+(.*)/gm;
  // Instantiate a new slugger for each parse to ensure consistent ID generation
  // in case of duplicate heading text.
  const slugger = new Slugger();
  const items: OutlineItem[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length as 1 | 2 | 3;
    const text = match[2].trim();
    // Use the raw heading text for slug generation to match marked's internal behavior.
    const id = slugger.slug(match[2]);

    items.push({ level, text, id });
  }

  return items;
};
