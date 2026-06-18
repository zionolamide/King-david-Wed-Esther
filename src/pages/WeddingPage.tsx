import { Navigation } from '@/components/wedding/Navigation';
import { HeroSection } from '@/components/wedding/HeroSection';
import { DateRevealSection } from '@/components/wedding/DateRevealSection';
import { StorySection } from '@/components/wedding/StorySection';
import { GallerySection } from '@/components/wedding/GallerySection';
import { DetailsSection } from '@/components/wedding/DetailsSection';
import { DressCodeSection } from '@/components/wedding/DressCodeSection';
import { GiftsSection } from '@/components/wedding/GiftsSection';
import { GuestNoticeSection } from '@/components/wedding/GuestNoticeSection';
import { RSVPSection } from '@/components/wedding/RSVPSection';
import { FooterSection } from '@/components/wedding/FooterSection';

export default function WeddingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: '#fbf6ed' }}>
      <Navigation />
      <HeroSection />
      <DateRevealSection />
      <StorySection />
      <GallerySection />
      <DetailsSection />
      <DressCodeSection />
      <GiftsSection />
      <GuestNoticeSection />
      <RSVPSection />
      <FooterSection />
    </div>
  );
}
