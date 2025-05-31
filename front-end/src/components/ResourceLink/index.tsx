"use client";

import { ArrowRight } from 'iconoir-react'; // Using an icon from the existing library

interface ResourceLinkProps {
  title: string;
  url: string;
  description?: string;
}

export function ResourceLink({ title, url, description }: ResourceLinkProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 mb-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out"
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h4>
          {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
      </div>
    </a>
  );
}
