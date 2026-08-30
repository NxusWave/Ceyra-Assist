import { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import LogoStrip from './components/LogoStrip';
import FeaturedSupportAI from './components/FeaturedSupportAI';
import HowItWorks from './components/HowItWorks';
import CapabilitiesBento from './components/CapabilitiesBento';
import IndustriesSection from './components/IndustriesSection';
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
  const [selectedPlanOrProduct, setSelectedPlanOrProduct] = useState<string>('Ceyra Assist');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>('en');

  const handleOpenDemo = (planOrProduct?: string) => {
    if (planOrProduct) {
      setSelectedPlanOrProduct(planOrProduct);
    }
    setDemoModalOpen(true);
  };

  const handleExploreProducts = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-100 selection:bg-violet-600 selection:text-white flex flex-col relative font-sans isolate overflow-hidden">
      {/* Background radial atmosphere & subtle grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f2315_1px,transparent_1px),linear-gradient(to_bottom,#1f1f2315_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      {/* Section-positioned ambient glow lights */}
      <div className="absolute top-[2%] left-[-100px] w-[600px] h-[600px] bg-violet-600/25 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[18%] right-[-150px] w-[550px] h-[550px] bg-blue-600/22 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[36%] left-[-150px] w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[54%] right-[-100px] w-[550px] h-[550px] bg-violet-600/22 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[72%] left-[-100px] w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-[-150px] right-[-100px] w-[600px] h-[600px] bg-purple-600/25 blur-[130px] rounded-full pointer-events-none -z-10" />

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
          onOpenDemo={() => handleOpenDemo('Ceyra Assist')}
          onExploreProducts={handleExploreProducts}
          selectedLang={currentLang}
          onSelectLang={setCurrentLang}
        />

        {/* 3. Slim Trusted-by Logo Strip */}
        <LogoStrip />

        {/* 4. Featured Ceyra Assist Section */}
        <FeaturedSupportAI onOpenDemo={handleOpenDemo} />

        {/* 5. Three-Step "How It Works" Section */}
        <HowItWorks onOpenDemo={() => handleOpenDemo('Ceyra Fast Setup')} />

        {/* 6. Capabilities Bento Grid */}
        <CapabilitiesBento />

        {/* 7. Industry / Use-Case Cards */}
        <IndustriesSection onOpenDemo={handleOpenDemo} />

        {/* 8. Testimonials Section */}
        <TestimonialsSection />

        {/* 9. Pricing Preview Section */}
        <PricingSection onSelectPlan={(plan) => handleOpenDemo(plan)} />

        {/* 10. Final CTA Section */}
        <FinalCTA onOpenDemo={handleOpenDemo} />
      </main>

      {/* 11. Minimal Footer */}
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
