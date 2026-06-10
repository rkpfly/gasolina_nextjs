'use server'

import { getThemes, getThemeBySlug } from "@/lib/database/db";

export async function fetchActiveThemes() {
  try {
    const themes = await getThemes();
    return themes;
  } catch (error) {
    console.error("Failed to fetch themes:", error);
    return [];
  }
}

export async function fetchThemeDetailsAction(slug: string) {
  try {
    const theme = await getThemeBySlug(slug);
    return theme;
  } catch (error) {
    console.error(`Failed to fetch theme for slug: ${slug}`, error);
    return null;
  }
}