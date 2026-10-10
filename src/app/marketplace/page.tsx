import { Suspense } from "react";
import Footer, { FooterFallback } from "@/components/layout/Footer";
import MarketplaceSection from "@/components/marketplace/MarketplaceSection";
import Navbar, { NavbarFallback } from "@/components/layout/Navbar";

export const instant = false;

interface MarketplacePageProps {
  searchParams: Promise<{ category?: string }>;
}

export default function MarketplacePage({ searchParams }: MarketplacePageProps) {
  return (
    <>
      <Suspense fallback={<NavbarFallback />}>
        <Navbar />
      </Suspense>
      <MarketplaceSection searchParams={searchParams} />
      <Suspense fallback={<FooterFallback />}>
        <Footer />
      </Suspense>
    </>
  );
}
