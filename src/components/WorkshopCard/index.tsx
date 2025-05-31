"use client";

import Image from 'next/image';

interface WorkshopCardProps {
  title: string;
  description: string;
  imageUrl: string;
  workshopUrl: string; // URL to the workshop itself
}

export function WorkshopCard({ title, description, imageUrl, workshopUrl }: WorkshopCardProps) {
  return (
    <a
      href={workshopUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out overflow-hidden bg-white dark:bg-gray-800"
    >
      <div className="relative w-full h-48">
        <Image
          src={imageUrl}
          alt={title}
          layout="fill"
          objectFit="cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </a>
  );
}
