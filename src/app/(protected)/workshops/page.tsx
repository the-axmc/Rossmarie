"use client";

import { WorkshopCard } from '@/components/WorkshopCard'; // Adjust path if necessary
import { Page } from '@/components/PageLayout'; // Assuming this is your standard page layout

const mockWorkshops = [
  {
    id: '1',
    title: 'Introduction to DeFi Staking',
    description: 'Learn the basics of staking in decentralized finance and how to earn passive income.',
    imageUrl: 'https://images.unsplash.com/photo-1639754394405-895582801b45?q=80&w=800&auto=format&fit=crop', // Placeholder
    workshopUrl: '#',
  },
  {
    id: '2',
    title: 'NFT Security Best Practices',
    description: 'Understand common security risks in the NFT space and how to protect your assets.',
    imageUrl: 'https://images.unsplash.com/photo-1640032966308-39f085957dcc?q=80&w=800&auto=format&fit=crop', // Placeholder
    workshopUrl: '#',
  },
  {
    id: '3',
    title: 'Advanced Yield Farming Strategies',
    description: 'Explore complex yield farming techniques for maximizing returns.',
    imageUrl: 'https://images.unsplash.com/photo-1639754394405-895582801b45?q=80&w=800&auto=format&fit=crop', // Placeholder
    workshopUrl: '#',
  },
];

export default function WorkshopsPage() {
  return (
    <Page>
      <Page.Header title="Available Workshops" />
      <Page.Body>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
          {mockWorkshops.map((workshop) => (
            <WorkshopCard
              key={workshop.id}
              title={workshop.title}
              description={workshop.description}
              imageUrl={workshop.imageUrl}
              workshopUrl={workshop.workshopUrl}
            />
          ))}
        </div>
      </Page.Body>
    </Page>
  );
}
