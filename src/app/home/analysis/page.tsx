import { Suspense } from "react";
import Navbar, { NavbarFallback } from "@/components/layout/Navbar";
import Footer, { FooterFallback } from "@/components/layout/Footer";
import AnalysisFormView from "@/components/colorimetry/AnalysisFormView";

export const instant = false;

export default function AnalysisPage() {
  return (
    <>
      <Suspense fallback={<NavbarFallback />}>
        <Navbar />
      </Suspense>
      <AnalysisFormView />
      <Suspense fallback={<FooterFallback />}>
        <Footer />
      </Suspense>
    </>
  );
}
