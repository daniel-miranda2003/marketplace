import { Suspense } from "react";
import Footer, { FooterFallback } from "@/components/layout/Footer";
import Navbar, { NavbarFallback } from "@/components/layout/Navbar";
import HomeShowcase, {
  HomeShowcaseFallback,
} from "@/components/home/HomeShowcase";

export default function Home() {
  return (
    <>
      <Suspense fallback={<NavbarFallback />}>
        <Navbar />
      </Suspense>
      <Suspense fallback={<HomeShowcaseFallback />}>
        <HomeShowcase />
      </Suspense>
      <Suspense fallback={<FooterFallback />}>
        <Footer />
      </Suspense>
    </>
  );
}
