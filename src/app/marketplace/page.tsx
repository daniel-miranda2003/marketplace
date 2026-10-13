import { Suspense } from "react";
import Footer, { FooterFallback } from "@/components/layout/Footer";
import MarketplaceSection from "@/components/marketplace/MarketplaceSection";
import Navbar, { NavbarFallback } from "@/components/layout/Navbar";
import ColorimetryFab from "@/components/colorimetry/ColorimetryFab";

export const instant = false;

interface MarketplacePageProps {
  searchParams: Promise<{
    category?: string;
    gender?: string;
    season?: string;
    product?: string;
  }>;
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
      <ColorimetryFab />
    </>
  );
}
