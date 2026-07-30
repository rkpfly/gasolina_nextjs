'use server';

import {
  getThemes as dbGetThemes,
  createTheme as dbCreateTheme,
  updateTheme as dbUpdateTheme,
  deleteTheme as dbDeleteTheme,
} from '@/lib/database/db';
export async function getThemes() {
  return dbGetThemes();
}

function normalizeData(data: {
  slug: string;
  title: string;
  short_description: string;
  description: string;
  detailed_content: Record<string, unknown>;
  hero_image: string;
  thumbnail_url: string;
  gallery: unknown[];
  template_name: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string | string[];
}) {
  const keywords = Array.isArray(data.seo_keywords)
    ? data.seo_keywords
    : data.seo_keywords.split(',');
  return {
    ...data,
    seo_keywords: keywords.map((k) => k.trim()).filter(Boolean),
  };
}

export async function createTheme(data: {
  slug: string;
  title: string;
  short_description: string;
  description: string;
  detailed_content: Record<string, unknown>;
  hero_image: string;
  thumbnail_url: string;
  gallery: unknown[];
  template_name: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
}) {
  return dbCreateTheme(normalizeData(data));
}

export async function updateTheme(
  id: string,
  data: {
    slug: string;
    title: string;
    short_description: string;
    description: string;
    detailed_content: Record<string, unknown>;
    hero_image: string;
    thumbnail_url: string;
    gallery: unknown[];
    template_name: string;
    seo_title: string;
    seo_description: string;
    seo_keywords: string;
  }
) {
  return dbUpdateTheme(id, normalizeData(data));
}

export async function deleteTheme(id: string) {
  return dbDeleteTheme(id);
}