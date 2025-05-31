"use client";

import { ResourceLink } from '@/components/ResourceLink'; // Adjust path if necessary
import { Page } from '@/components/PageLayout'; // Assuming this is your standard page layout

const mockResources = [
  {
    id: '1',
    title: 'Official Ethereum Whitepaper',
    description: 'The foundational document explaining Ethereum and its vision.',
    url: 'https://ethereum.org/en/whitepaper/',
  },
  {
    id: '2',
    title: 'OpenZeppelin Contracts Documentation',
    description: 'Comprehensive guide to using OpenZeppelin for secure smart contract development.',
    url: 'https://docs.openzeppelin.com/contracts/5.x/',
  },
  {
    id: '3',
    title: 'Viem Documentation',
    description: 'Learn how to use Viem, a TypeScript interface for Ethereum.',
    url: 'https://viem.sh/',
  },
  {
    id: '4',
    title: 'RainbowKit Documentation',
    description: 'Guides and API reference for integrating RainbowKit wallet connections.',
    url: 'https://www.rainbowkit.com/docs',
  },
];

export default function ResourcesPage() {
  return (
    <Page>
      <Page.Header title="Helpful Resources" />
      <Page.Body>
        <div className="p-4">
          {mockResources.map((resource) => (
            <ResourceLink
              key={resource.id}
              title={resource.title}
              description={resource.description}
              url={resource.url}
            />
          ))}
        </div>
      </Page.Body>
    </Page>
  );
}
