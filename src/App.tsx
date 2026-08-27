import { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import LogoStrip from './components/LogoStrip';
import ProductsBentoGrid from './components/ProductsBentoGrid';
import FeaturedSupportAI from './components/FeaturedSupportAI';
import HowItWorks from './components/HowItWorks';
import CapabilitiesBento from './components/CapabilitiesBento';
import IndustriesSection from './components/IndustriesSection';
import EcosystemSection from './components/EcosystemSection';
import TestimonialsSection from './components/TestimonialsSection';
import PricingSection from './components/PricingSection';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import DemoModal from './components/DemoModal';
import LoginModal from './components/LoginModal';
import FloatingChatTester from './components/FloatingChatTester';
import { Language } from './types';

export default function App() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [selectedPlanOrProduct, setSelectedPlanOrProduct] = useState<string>('Ceyra Support AI');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>('en');

  const handleOpenDemo = (planOrProduct?: string) => {
    if (planOrProduct) {
      setSelectedPlanOrProduct(planOrProduct);
    }
    setDemoModalOpen(true);
  };

  const handleExploreProducts = () => {
    const el = document.getElementById('products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-100 selection:bg-violet-600 selection:text-white flex flex-col relative font-sans overflow-x-hidden">
      {/* Professional Polish ambient glow lights */}
      <div className="fixed top-[-200px] left-[-100px] w-[500px] h-[500px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-[-100px] right-[-50px] w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* 1. Sticky Navigation */}
      <Navbar
        onOpenDemo={handleOpenDemo}
        onOpenLogin={() => setLoginModalOpen(true)}
        currentLang={currentLang}
        onChangeLang={setCurrentLang}
      />

      <main className="flex-grow">
        {/* 2. Hero Section */}
        <HeroSection
          onOpenDemo={() => handleOpenDemo('Ceyra Support AI')}
          onExploreProducts={handleExploreProducts}
          selectedLang={currentLang}
          onSelectLang={setCurrentLang}
        />

        {/* 3. Slim Trusted-by Logo Strip */}
        <LogoStrip />

        {/* 4. Products Bento Grid */}
        <ProductsBentoGrid onOpenDemo={handleOpenDemo} />

        {/* 5. Featured Ceyra Support AI Section */}
        <FeaturedSupportAI onOpenDemo={handleOpenDemo} />

        {/* 6. Three-Step "How It Works" Section */}
        <HowItWorks onOpenDemo={() => handleOpenDemo('Ceyra Fast Setup')} />

        {/* 7. Capabilities Bento Grid */}
        <CapabilitiesBento />

        {/* 8. Industry / Use-Case Cards */}
        <IndustriesSection onOpenDemo={handleOpenDemo} />

        {/* 9. One Connected AI Platform Ecosystem Section */}
        <EcosystemSection onOpenDemo={handleOpenDemo} />

        {/* 10. Testimonials Section */}
        <TestimonialsSection />

        {/* 11. Pricing Preview Section */}
        <PricingSection onSelectPlan={(plan) => handleOpenDemo(plan)} />

        {/* 12. Final CTA Section */}
        <FinalCTA onOpenDemo={handleOpenDemo} />
      </main>

      {/* 13. Minimal Footer */}
      <Footer />

      {/* Interactive Modals & Floating Tester */}
      <DemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        initialProductOrPlan={selectedPlanOrProduct}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onOpenRegister={() => handleOpenDemo('starter')}
      />

      <FloatingChatTester />
    </div>
  );
}
