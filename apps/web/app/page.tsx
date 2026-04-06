import PublicLayout from '@/components/public/public-layout'
import HeroSection from '@/components/public/hero-section'
import BentoGrid from '@/components/public/bento-grid'
import GalleryMarquee from '@/components/public/gallery-marquee'
import ContactSection from '@/components/public/contact-section'

export default function Home() {
  return (
    <PublicLayout>
      <HeroSection />
      <BentoGrid />
      <GalleryMarquee />
      <ContactSection />
    </PublicLayout>
  )
}
