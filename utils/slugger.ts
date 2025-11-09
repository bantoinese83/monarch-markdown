/**
 * Simple slugger utility to generate URL-friendly IDs from text.
 * This replaces the need for marked's Slugger which isn't exported in v17.
 */
export class Slugger {
  private seen: Record<string, number> = {};

  slug(text: string): string {
    let slug = text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

    if (!slug) {
      slug = 'heading';
    }

    const originalSlug = slug;
    if (this.seen[slug] !== undefined) {
      const count = this.seen[slug];
      this.seen[slug] = count + 1;
      slug = `${originalSlug}-${count + 1}`;
    } else {
      this.seen[slug] = 0;
    }

    return slug;
  }
}

