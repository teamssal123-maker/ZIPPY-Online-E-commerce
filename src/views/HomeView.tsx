import React from 'react';
import { HeroSlider } from '../components/home/HeroSlider';
import { CategoryShowcase } from '../components/home/CategoryShowcase';
import { FeaturedTabsSection } from '../components/home/FeaturedTabsSection';
import { PromoCampaignBanner } from '../components/home/PromoCampaignBanner';
import { BrandStorySection } from '../components/home/BrandStorySection';

export const HomeView: React.FC = () => {
  return (
    <div className="min-h-screen">
      <HeroSlider />
      <CategoryShowcase />
      <FeaturedTabsSection />
      <PromoCampaignBanner />
      <BrandStorySection />
    </div>
  );
};
