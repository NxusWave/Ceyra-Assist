import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import LogoStrip from '../components/LogoStrip';
import FeaturedSupportAI from '../components/FeaturedSupportAI';
import HowItWorks from '../components/HowItWorks';
import CapabilitiesBento from '../components/CapabilitiesBento';
import IndustriesSection from '../components/IndustriesSection';
import TestimonialsSection from '../components/TestimonialsSection';
import PricingSection from '../components/PricingSection';
import FinalCTA from '../components/FinalCTA';
import Footer from '../components/Footer';
import DemoModal, { SIGNUP_PRODUCT } from '../components/DemoModal';
import LoginModal from '../components/LoginModal';
import ContactModal from '../components/ContactModal';
import FloatingChatTester from '../components/FloatingChatTester';
import { Language } from '../types';
import { supabase } from '../lib/supabaseClient';
import { computeTrial } from '../lib/trial';

export default function LandingPage() {
  const navigate = useNavigate();
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [selectedPlanOrProduct, setSelectedPlanOrProduct] = useState<string>('Ceyra Assist');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>('en');

  const handleOpenDemo = (planOrProduct?: string) => {
    // Always set explicitly so a previous selection can't leak into an
    // unrelated CTA (e.g. open Growth, close, then click navbar Get started).
    setSelectedPlanOrProduct(planOrProduct ? planOrProduct : 'starter');
    setDemoModalOpen(true);
  };

  const handlePlanSelect = async (planId: string) => {
    if (planId === 'enterprise') {
      setContactModalOpen(true);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      handleOpenDemo(planId);
      return;
    }

    try {
      const { data: packages } = await supabase
        .from('packages')
        .select('id, plan, status, created_at')
        .eq('user_id', session.user.id)
        .eq('product', SIGNUP_PRODUCT);

      const trialPkg = (packages || []).find((p) => p.status === 'trial');

      if (trialPkg) {
        const trial = computeTrial(trialPkg.created_at);

        if (trial?.state !== 'expired') {
          // Still trialing — switching plans is free, trial timer
          // is untouched, only which plan applies changes.
          if (trialPkg.plan !== planId) {
            await supabase.from('packages').update({ plan: planId }).eq('id', trialPkg.id);
          }
          navigate('/dashboard');
          return;
        }

        // Trial expired, never converted — needs real billing.
        navigate('/dashboard/account');
        return;
      }

      const hasActivePaid = (packages || []).some((p) => p.status === 'active');
      if (hasActivePaid) {
        // Paid customer changing/adding plans — needs real billing.
        navigate('/dashboard/account');
        return;
      }

      // Fallback — no recognizable package state, safest default.
      navigate('/dashboard');
    } catch (err) {
      console.warn('Plan select check failed:', err);
      navigate('/dashboard');
    }
  };

  const handleExploreProducts = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Send visitors to the pricing cards instead of the signup modal.
  const handleViewPricing = () => {
    const el = document.getElementById('pricing');
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
        onOpenDemo={handleViewPricing}
        onOpenLogin={() => setLoginModalOpen(true)}
        currentLang={currentLang}
        onChangeLang={setCurrentLang}
      />

      <main className="flex-grow">
        {/* 2. Hero Section */}
        <HeroSection
          onOpenDemo={handleViewPricing}
          onExploreProducts={handleExploreProducts}
          selectedLang={currentLang}
          onSelectLang={setCurrentLang}
        />

        {/* 3. Slim Trusted-by Logo Strip */}
        <LogoStrip />

        {/* 4. Featured Ceyra Assist Section */}
        <FeaturedSupportAI onOpenDemo={handleViewPricing} />

        {/* 5. Three-Step "How It Works" Section */}
        <HowItWorks onOpenDemo={handleViewPricing} />

        {/* 6. Capabilities Bento Grid */}
        <CapabilitiesBento />

        {/* 7. Industry / Use-Case Cards */}
        <IndustriesSection onOpenDemo={handleViewPricing} />

        {/* 8. Testimonials Section */}
        <TestimonialsSection />

        {/* 9. Pricing Preview Section */}
        <PricingSection onSelectPlan={handlePlanSelect} />

        {/* 10. Final CTA Section */}
        <FinalCTA onOpenDemo={handleViewPricing} onContact={() => setContactModalOpen(true)} />
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
        onOpenRegister={handleViewPricing}
      />

      <ContactModal isOpen={contactModalOpen} onClose={() => setContactModalOpen(false)} />

      <FloatingChatTester />
    </div>
  );
}
