'use client';

import { TabItem, Tabs } from '@worldcoin/mini-apps-ui-kit-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Home, Presentation, BookStack, QuestionMarkCircle } from 'iconoir-react'; // Added QuestionMarkCircle
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * This component uses the UI Kit to navigate between pages
 * Bottom navigation is the most common navigation pattern in Mini Apps
 * We require mobile first design patterns for mini apps
 * Read More: https://docs.world.org/mini-apps/design/app-guidelines#mobile-first
 */

export const Navigation = () => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    // Update active tab based on current path
    if (pathname === '/home') {
      setActiveTab('home');
    } else if (pathname === '/workshops') {
      setActiveTab('workshops');
    } else if (pathname === '/resources') {
      setActiveTab('resources');
    } else if (pathname === '/quiz') { // Added quiz path
      setActiveTab('quiz');
    }
  }, [pathname]);

  // The Tabs component from @worldcoin/mini-apps-ui-kit-react
  // might not be designed for Next.js Link integration directly within TabItem.
  // If TabItem click doesn't navigate, this approach may need rethinking,
  // possibly by using onValueChange to trigger router.push or by styling Links to look like TabItems.
  // For now, we proceed by wrapping TabItem with Link.

  return (
    <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <Tabs value={activeTab} onValueChange={(tabValue) => setActiveTab(tabValue)} className="flex-grow">
        <Link href="/home" passHref legacyBehavior>
          <TabItem value="home" icon={<Home />} label="Home" as="a" />
        </Link>
        <Link href="/workshops" passHref legacyBehavior>
          <TabItem value="workshops" icon={<Presentation />} label="Workshops" as="a" />
        </Link>
        <Link href="/resources" passHref legacyBehavior>
          <TabItem value="resources" icon={<BookStack />} label="Resources" as="a" />
        </Link>
        <Link href="/quiz" passHref legacyBehavior>
          <TabItem value="quiz" icon={<QuestionMarkCircle />} label="Quiz" as="a" />
        </Link>
      </Tabs>
      <div className="ml-2 shrink-0"> {/* Added shrink-0 to prevent ConnectButton from shrinking */}
        <ConnectButton showBalance={false} accountStatus="address" />
      </div>
    </div>
  );
};
