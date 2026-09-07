import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Shield,
  CreditCard,
  ArrowLeft,
  LayoutDashboard,
  Home,
  LogOut,
  Upload,
  Trash2,
  Check,
  AlertCircle,
  Loader2,
  Lock,
  Mail,
  Phone,
  Info,
  X,
} from 'lucide-react';
import CeyraLogo from '../components/CeyraLogo';
import BusinessAvatar from '../components/BusinessAvatar';
import { supabase } from '../lib/supabaseClient';

export default function AccountPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active section tab
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'billing'>('profile');

  // Auth & loading states
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);

  // Profile Form State
  const [businessName, setBusinessName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoRemoved, setLogoRemoved] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Security Form State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securitySaving, setSecuritySaving] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);

  // Payment method placeholder modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // 1. Session check & business retrieval
  useEffect(() => {
    let isMounted = true;

    async function loadAccountData() {
      try {
        setLoading(true);
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session || !session.user) {
          navigate('/', { replace: true });
          return;
        }

        const currentUser = session.user;
        if (!isMounted) return;
        setUser(currentUser);

        // Fetch business row for current user
        const { data: bizRows, error: bizError } = await supabase
          .from('businesses')
          .select('*')
          .eq('owner_id', currentUser.id);

        if (bizError) {
          console.warn('Notice loading business in account:', bizError.message);
        }

        let currentBiz: any = null;
        if (bizRows && bizRows.length > 0) {
          currentBiz = bizRows[0];
        } else {
          // If no business row exists, create or default
          const defaultName =
            currentUser.user_metadata?.company ||
            currentUser.user_metadata?.business_name ||
            currentUser.user_metadata?.full_name ||
            'My Business';

          const { data: newBiz } = await supabase
            .from('businesses')
            .insert([
              {
                owner_id: currentUser.id,
                name: defaultName,
              },
            ])
            .select()
            .single();

          currentBiz = newBiz || {
            owner_id: currentUser.id,
            name: defaultName,
          };
        }

        if (isMounted) {
          setBusiness(currentBiz);
          setBusinessName(
            currentBiz?.name ||
              currentBiz?.business_name ||
              currentUser.user_metadata?.company ||
              'My Business'
          );
          setContactEmail(
            currentBiz?.contact_email ||
              currentBiz?.email ||
              currentUser.email ||
              ''
          );
          setPhoneNumber(
            currentBiz?.phone ||
              currentBiz?.contact_phone ||
              currentUser.user_metadata?.phone ||
              ''
          );
          setAvatarPreview(currentBiz?.logo_url || null);
        }
      } catch (err) {
        console.error('Account load error:', err);
        if (isMounted) navigate('/', { replace: true });
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAccountData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Logo file upload handler
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileError(null);
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setProfileError('Logo image must be under 2MB.');
        return;
      }
      setLogoFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setLogoRemoved(false);
    }
  };

  // Profile save handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileSaving(true);
    setProfileSuccess(null);
    setProfileError(null);

    const trimmedName = businessName.trim();
    if (!trimmedName) {
      setProfileError('Business name cannot be empty.');
      setProfileSaving(false);
      return;
    }

    try {
      let finalLogoUrl: string | null | undefined = undefined;

      // 1. If a new logo file was selected, upload it to Supabase Storage first
      if (logoFile) {
        const business_id = business?.id || user.id;
        const fileExt = logoFile.name.split('.').pop() || 'png';
        const path = `business-logos/${business_id}/logo-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('chatbot-avatars')
          .upload(path, logoFile, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Failed to upload logo: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('chatbot-avatars')
          .getPublicUrl(path);

        finalLogoUrl = publicUrlData?.publicUrl || null;
      } else if (logoRemoved) {
        finalLogoUrl = null;
      }

      // 2. Update businesses table row with logo_url (not avatar_url)
      const updatePayload: Record<string, any> = {
        name: trimmedName,
        contact_email: contactEmail.trim(),
        phone: phoneNumber.trim(),
      };

      // Only include logo_url if a new logo was uploaded (or explicitly removed),
      // otherwise omit this field so the existing saved value isn't overwritten
      if (finalLogoUrl !== undefined) {
        updatePayload.logo_url = finalLogoUrl;
      }

      let { error: updateError } = await supabase
        .from('businesses')
        .update(updatePayload)
        .eq('owner_id', user.id);

      // Graceful column fallback if schema has fewer columns
      if (updateError && updateError.message.includes('column')) {
        const fallbackPayload: Record<string, any> = {
          name: trimmedName,
        };
        if (finalLogoUrl !== undefined) {
          fallbackPayload.logo_url = finalLogoUrl;
        }
        const fallbackRes = await supabase
          .from('businesses')
          .update(fallbackPayload)
          .eq('owner_id', user.id);
        updateError = fallbackRes.error;
      }

      if (updateError) {
        throw updateError;
      }

      // 3. Also keep user_metadata in sync so auth session reflects new business name
      await supabase.auth.updateUser({
        data: {
          company: trimmedName,
          phone: phoneNumber.trim(),
        },
      });

      // Update local state
      setBusiness((prev: any) => ({
        ...prev,
        name: trimmedName,
        contact_email: contactEmail.trim(),
        phone: phoneNumber.trim(),
        ...(finalLogoUrl !== undefined ? { logo_url: finalLogoUrl } : {}),
      }));

      if (finalLogoUrl !== undefined) {
        setAvatarPreview(finalLogoUrl);
      }
      setLogoFile(null);
      setLogoRemoved(false);

      setProfileSuccess('Business profile details saved successfully.');
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      setProfileError(err.message || 'Failed to save changes. Please try again.');
    } finally {
      setProfileSaving(false);
    }
  };

  // Password change handler
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecuritySaving(true);
    setSecuritySuccess(null);
    setSecurityError(null);

    if (newPassword.length < 6) {
      setSecurityError('Password must be at least 6 characters long.');
      setSecuritySaving(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityError('New password and confirm password do not match.');
      setSecuritySaving(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      setSecuritySuccess('Your password has been changed successfully.');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSecuritySuccess(null), 5000);
    } catch (err: any) {
      console.error('Failed to update password:', err);
      setSecurityError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setSecuritySaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-gray-100 flex flex-col items-center justify-center relative font-sans isolate overflow-hidden">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.12),rgba(255,255,255,0))] pointer-events-none -z-10" />
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <CeyraLogo className="w-12 h-12 animate-pulse" />
            <div className="absolute -inset-2 bg-violet-600/20 blur-lg rounded-full -z-10" />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
            <span>Loading Account Settings...</span>
          </div>
        </div>
      </div>
    );
  }

  const currentDisplayName =
    business?.name ||
    business?.business_name ||
    user?.user_metadata?.company ||
    businessName ||
    'My Business';

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-100 flex flex-col font-sans selection:bg-violet-600 selection:text-white isolate">
      {/* Ambient background glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.12),rgba(255,255,255,0))] pointer-events-none -z-10" />
      <div className="fixed inset-0 bg-radial-grid opacity-30 pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#0E0E12]/90 border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <CeyraLogo className="w-8 h-8 group-hover:scale-105 transition-transform" />
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white">CEYRA</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400 bg-violet-600/15 px-2 py-0.5 rounded-full border border-violet-500/25">
                  Account Settings
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
              <Link
                to="/dashboard"
                className="px-3 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.03] transition-colors flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-gray-500" />
                <span>Dashboard Hub</span>
              </Link>
              <Link
                to="/"
                className="px-3 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.03] transition-colors flex items-center gap-1"
              >
                <span>Back to Home</span>
                <Home className="w-3 h-3 text-gray-500" />
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Standardized Round Business Badge */}
            <div
              id="account-header-business-badge"
              className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs"
            >
              <BusinessAvatar
                name={currentDisplayName}
                avatarUrl={avatarPreview || business?.logo_url}
                size="xs"
              />
              <span className="text-gray-200 font-medium max-w-[150px] truncate">
                {currentDisplayName}
              </span>
            </div>

            <button
              onClick={handleSignOut}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/25 text-gray-400 hover:text-rose-300 text-xs font-medium transition-all flex items-center gap-1.5"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 text-gray-400" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Breadcrumb navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 text-violet-400 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard Hub</span>
          </Link>
        </div>

        {/* Page Title & Overview */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Account & Organization
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Manage your registered business profile, credentials, and payment methods.
          </p>
        </div>

        {/* Grid Layout: Left Nav Tabs + Right Content Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Navigation Tabs */}
          <div className="lg:col-span-4 space-y-4">
            {/* Identity Card */}
            <div className="p-5 rounded-3xl glass-panel border border-white/10 shadow-xl flex items-center gap-4">
              <BusinessAvatar
                name={currentDisplayName}
                avatarUrl={avatarPreview || business?.logo_url}
                size="xl"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-white truncate">
                  {currentDisplayName}
                </h3>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider text-violet-400 bg-violet-600/15 border border-violet-500/25 px-2 py-0.5 rounded-full">
                  Pro Workspace
                </span>
              </div>
            </div>

            {/* Section Tab Buttons */}
            <div className="p-2 rounded-2xl glass-panel border border-white/10 space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'profile'
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Building2 className="w-4 h-4 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-semibold">Profile Details</div>
                  <div
                    className={`text-[10px] font-normal ${
                      activeTab === 'profile' ? 'text-violet-200' : 'text-gray-500'
                    }`}
                  >
                    Business name, email & logo
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'security'
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Shield className="w-4 h-4 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-semibold">Security</div>
                  <div
                    className={`text-[10px] font-normal ${
                      activeTab === 'security' ? 'text-violet-200' : 'text-gray-500'
                    }`}
                  >
                    Change password & credentials
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('billing')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'billing'
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <CreditCard className="w-4 h-4 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-semibold">Payment Methods</div>
                  <div
                    className={`text-[10px] font-normal ${
                      activeTab === 'billing' ? 'text-violet-200' : 'text-gray-500'
                    }`}
                  >
                    Cards & billing overview
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Right Content Panels */}
          <div className="lg:col-span-8 space-y-6">
            {/* SECTION A: PROFILE DETAILS */}
            {activeTab === 'profile' && (
              <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 shadow-2xl space-y-6">
                <div className="border-b border-white/10 pb-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-violet-400" />
                    <span>Business Profile Details</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Keep your business entity and contact information up to date across your AI products.
                  </p>
                </div>

                {profileSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300 animate-in fade-in">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{profileSuccess}</span>
                  </div>
                )}

                {profileError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Avatar / Logo Upload */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-300 block">
                      Business Logo / Avatar
                    </label>
                    <p className="text-[11px] text-gray-400">
                      Displayed in the navigation bar, dashboard header, and customer chatbot widget.
                    </p>

                    <div className="flex items-center gap-4 pt-2">
                      <BusinessAvatar
                        name={businessName || 'Business'}
                        avatarUrl={avatarPreview}
                        size="2xl"
                      />

                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarUpload}
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 transition-colors flex items-center gap-1.5"
                          >
                            <Upload className="w-3.5 h-3.5 text-violet-400" />
                            <span>Upload New Logo</span>
                          </button>
                          {avatarPreview && (
                            <button
                              type="button"
                              onClick={() => {
                                setAvatarPreview(null);
                                setLogoFile(null);
                                setLogoRemoved(true);
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = '';
                                }
                              }}
                              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                              title="Remove Logo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500">
                          Recommended: 256x256 PNG or JPG with transparent or dark background (Max 2MB).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Business Name Field */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="business-name-input"
                      className="text-xs font-semibold text-gray-300 flex items-center gap-1.5"
                    >
                      <Building2 className="w-3.5 h-3.5 text-gray-400" />
                      <span>Business Name</span>
                      <span className="text-violet-400">*</span>
                    </label>
                    <input
                      id="business-name-input"
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Colombo Bakery & Cafe"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                    />
                  </div>

                  {/* Contact Email Field */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-email-input"
                      className="text-xs font-semibold text-gray-300 flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span>Contact Email</span>
                    </label>
                    <input
                      id="contact-email-input"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="e.g. support@colombobakery.lk"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                    />
                    <p className="text-[11px] text-gray-500">
                      Used for critical alerts, weekly chatbot analytics reports, and escalation handoffs.
                    </p>
                  </div>

                  {/* Phone Number Field */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-phone-input"
                      className="text-xs font-semibold text-gray-300 flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>Phone Number</span>
                    </label>
                    <input
                      id="contact-phone-input"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. +94 77 123 4567"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                    />
                    <p className="text-[11px] text-gray-500">
                      Used for WhatsApp escalation routing and SMS status alerts.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-full shadow-lg shadow-violet-600/25 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
                    >
                      {profileSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      <span>{profileSaving ? 'Saving Changes...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SECTION B: SECURITY */}
            {activeTab === 'security' && (
              <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 shadow-2xl space-y-6">
                <div className="border-b border-white/10 pb-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-violet-400" />
                    <span>Security & Password</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Manage your login password and authentication security settings.
                  </p>
                </div>

                {securitySuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300 animate-in fade-in">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{securitySuccess}</span>
                  </div>
                )}

                {securityError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{securityError}</span>
                  </div>
                )}

                <form onSubmit={handleSavePassword} className="space-y-5">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
                    <Info className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-gray-300 leading-relaxed">
                      Logged in as <span className="font-semibold text-white">{user?.email}</span>.
                      Your session will remain valid across devices until you manually log out or sign in with your new password.
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="new-password-input"
                      className="text-xs font-semibold text-gray-300 flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5 text-gray-400" />
                      <span>New Password</span>
                      <span className="text-violet-400">*</span>
                    </label>
                    <input
                      id="new-password-input"
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="confirm-password-input"
                      className="text-xs font-semibold text-gray-300 flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5 text-gray-400" />
                      <span>Confirm New Password</span>
                      <span className="text-violet-400">*</span>
                    </label>
                    <input
                      id="confirm-password-input"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                    />
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={securitySaving}
                      className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-full shadow-lg shadow-violet-600/25 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
                    >
                      {securitySaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                      <span>{securitySaving ? 'Updating Password...' : 'Update Password'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SECTION C: PAYMENT METHODS (UI-only Placeholder) */}
            {activeTab === 'billing' && (
              <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 shadow-2xl space-y-6">
                <div className="border-b border-white/10 pb-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-violet-400" />
                    <span>Payment Methods</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Manage your billing cards, payment preferences, and subscription invoices.
                  </p>
                </div>

                {/* Empty State Card */}
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-600/15 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto shadow-inner">
                    <CreditCard className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">
                      No payment method on file
                    </h3>
                    <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                      Your organization is currently enjoying an active 7-day free trial.
                      No credit card is required to explore all trilingual AI features and deploy your assistant.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(true)}
                      className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-full shadow-lg shadow-violet-600/25 transition-all flex items-center gap-2 mx-auto active:scale-98"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Add Payment Method</span>
                    </button>
                  </div>
                </div>

                {/* Billing note card */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                    <Info className="w-4 h-4 text-violet-400" />
                    <span>Billing in Sri Lanka</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    We accept Visa, MasterCard, and direct corporate bank transfers in Sri Lankan Rupees (LKR) with official tax receipts.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Payment Integration Coming Soon Modal (UI Placeholder only) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0E0E12] border border-white/10 p-6 sm:p-8 shadow-2xl text-center space-y-5">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 text-violet-400 flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">
                Payment Integration Coming Soon
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Payment integration coming soon — you'll be able to add a card here once billing is enabled.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-full shadow-lg shadow-violet-600/25 transition-all"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
