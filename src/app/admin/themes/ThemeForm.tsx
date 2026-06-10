'use client';

import { saveThemeAction } from './actions';
import Link from 'next/link';

export default function ThemeForm({ initialData }: { initialData?: any }) {
  const isEditing = !!initialData;

  return (
    <form action={saveThemeAction} className="bg-white shadow rounded-lg p-6 max-w-4xl mx-auto space-y-6">
      <input type="hidden" name="id" value={initialData?.id || 'new'} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input type="text" name="title" defaultValue={initialData?.title} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Slug</label>
          <input type="text" name="slug" defaultValue={initialData?.slug} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Short Description</label>
          <textarea name="short_description" defaultValue={initialData?.short_description} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Template Name</label>
          <input type="text" name="template_name" defaultValue={initialData?.template_name} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Hero Image URL</label>
          <input type="url" name="hero_image" defaultValue={initialData?.hero_image} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Detailed Content (JSON)</label>
          <textarea name="detailed_content" defaultValue={initialData ? JSON.stringify(initialData.detailed_content, null, 2) : '{\n  \n}'} rows={5} className="mt-1 block w-full rounded-md border-gray-300 font-mono text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" placeholder="{}" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Gallery (JSON Array)</label>
          <textarea name="gallery" defaultValue={initialData ? JSON.stringify(initialData.gallery, null, 2) : '[\n  \n]'} rows={5} className="mt-1 block w-full rounded-md border-gray-300 font-mono text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" placeholder="[]" />
        </div>

        <div className="md:col-span-2 pt-4 border-t">
          <h3 className="text-lg font-medium mb-4">SEO Settings</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">SEO Title</label>
          <input type="text" name="seo_title" defaultValue={initialData?.seo_title} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">SEO Keywords (comma separated)</label>
          <input type="text" name="seo_keywords" defaultValue={initialData?.seo_keywords?.join(', ')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">SEO Description</label>
          <textarea name="seo_description" defaultValue={initialData?.seo_description} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t mt-6">
        <Link href="/admin/themes" className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          Cancel
        </Link>
        <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
          {isEditing ? 'Update Theme' : 'Create Theme'}
        </button>
      </div>
    </form>
  );
}