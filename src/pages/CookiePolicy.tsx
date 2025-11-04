import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HeaderNavigation from "@/components/HeaderNavigation";
import InternalPageHeader from "@/components/InternalPageHeader";
import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useCookieConsent } from "@/contexts/CookieConsentContext";
import { CookiePreferencesModal } from "@/components/CookiePreferencesModal";
import SEOHead from "@/components/seo/SEOHead";
import Footer from "@/components/Footer";

const CookiePolicy = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const { consentState } = useCookieConsent();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <SEOHead
        title="Cookie Policy - Spit Hierarchy"
        description="Learn about how Spit Hierarchy uses cookies, your preferences, and your rights under GDPR and CCPA. Manage your cookie consent and understand our data practices."
        keywords={['cookie policy', 'GDPR compliance', 'CCPA privacy', 'cookie consent', 'data privacy']}
        canonicalUrl="/cookies"
      />
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
        <HeaderNavigation isScrolled={isScrolled} />
        
        <div className="pt-24">
          <InternalPageHeader 
            title="Cookie Policy" 
            subtitle="Understanding how we use cookies on our platform"
          />
          
          <div className="max-w-4xl mx-auto p-6 pb-20">
            <ThemedCard className="bg-[var(--theme-surface)] border-[var(--theme-primary)]/30">
              <ThemedCardContent className="p-8 space-y-8">
                
                <div className="flex items-center justify-between">
                  <div className="text-rap-smoke text-sm">
                    Last updated: January 2025
                  </div>
                  <Button 
                    onClick={() => setIsPreferencesOpen(true)}
                    variant="outline"
                    size="sm"
                  >
                    Manage Cookie Preferences
                  </Button>
                </div>

                <section>
                  <h2 className="text-2xl font-mogra text-rap-gold mb-4">What Are Cookies?</h2>
                  <p className="text-rap-platinum font-merienda leading-relaxed">
                    Cookies are small text files that are placed on your device when you visit our website. 
                    They help us provide you with a better experience by remembering your preferences and 
                    understanding how you use our platform.
                  </p>
                </section>

                <Separator className="bg-rap-gold/20" />

                <section>
                  <h2 className="text-2xl font-mogra text-rap-gold mb-4">Types of Cookies We Use</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-mogra text-rap-gold/90 mb-3">1. Necessary Cookies</h3>
                      <p className="text-rap-platinum font-merienda leading-relaxed mb-2">
                        <strong>Always Active</strong> - These cookies are essential for the website to function properly.
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4 text-rap-platinum font-merienda">
                        <li><code className="text-rap-gold">sb-access-token</code> - Authentication session token</li>
                        <li><code className="text-rap-gold">sb-refresh-token</code> - Session refresh token</li>
                        <li><code className="text-rap-gold">cookie-consent-v1</code> - Stores your cookie preferences</li>
                      </ul>
                      <p className="text-rap-smoke text-sm mt-2">
                        Duration: Session cookies expire when you close your browser; persistent cookies remain up to 12 months.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-mogra text-rap-gold/90 mb-3">2. Functional Cookies</h3>
                      <p className="text-rap-platinum font-merienda leading-relaxed mb-2">
                        <strong>Status: {consentState?.functional ? '✓ Enabled' : '✗ Disabled'}</strong>
                      </p>
                      <p className="text-rap-platinum font-merienda leading-relaxed">
                        These cookies enable enhanced functionality and personalization, such as remembering your 
                        theme preferences, favorite rappers, and customized rankings.
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4 text-rap-platinum font-merienda mt-2">
                        <li><code className="text-rap-gold">user-preferences</code> - UI preferences and settings</li>
                        <li><code className="text-rap-gold">onboarding-dismissed</code> - Tracks onboarding completion</li>
                      </ul>
                      <p className="text-rap-smoke text-sm mt-2">Duration: Up to 12 months</p>
                    </div>

                    <div>
                      <h3 className="text-xl font-mogra text-rap-gold/90 mb-3">3. Analytics Cookies</h3>
                      <p className="text-rap-platinum font-merienda leading-relaxed mb-2">
                        <strong>Status: {consentState?.analytics ? '✓ Enabled' : '✗ Disabled'}</strong>
                      </p>
                      <p className="text-rap-platinum font-merienda leading-relaxed">
                        These cookies help us understand how visitors interact with our website by collecting 
                        and reporting information anonymously.
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4 text-rap-platinum font-merienda mt-2">
                        <li><code className="text-rap-gold">_ga</code> - Google Analytics main cookie</li>
                        <li><code className="text-rap-gold">_ga_*</code> - Google Analytics property-specific</li>
                        <li><code className="text-rap-gold">_gid</code> - Google Analytics identifier</li>
                      </ul>
                      <p className="text-rap-smoke text-sm mt-2">Duration: Up to 2 years (Google Analytics)</p>
                    </div>

                    <div>
                      <h3 className="text-xl font-mogra text-rap-gold/90 mb-3">4. Advertising Cookies</h3>
                      <p className="text-rap-platinum font-merienda leading-relaxed mb-2">
                        <strong>Status: {consentState?.advertising ? '✓ Enabled' : '✗ Disabled'}</strong>
                      </p>
                      <p className="text-rap-platinum font-merienda leading-relaxed">
                        These cookies are used to deliver advertisements that are relevant to you and your interests. 
                        They are also used to limit the number of times you see an ad.
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4 text-rap-platinum font-merienda mt-2">
                        <li><code className="text-rap-gold">_gcl_au</code> - Google AdSense conversion tracking</li>
                        <li><code className="text-rap-gold">IDE</code> - Google advertising cookie</li>
                        <li><code className="text-rap-gold">test_cookie</code> - Tests browser cookie support</li>
                      </ul>
                      <p className="text-rap-smoke text-sm mt-2">Duration: Up to 2 years</p>
                    </div>
                  </div>
                </section>

                <Separator className="bg-rap-gold/20" />

                <section>
                  <h2 className="text-2xl font-mogra text-rap-gold mb-4">Third-Party Cookies</h2>
                  <div className="space-y-4 text-rap-platinum font-merienda leading-relaxed">
                    <p>We use the following third-party services that may set cookies:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>Supabase:</strong> Authentication and database services</li>
                      <li><strong>Google AdSense:</strong> Advertisement delivery (Publisher ID: ca-pub-2518650700414992)</li>
                      <li><strong>Google Analytics:</strong> Website analytics and usage tracking (if implemented)</li>
                    </ul>
                    <p className="text-sm text-rap-smoke mt-4">
                      These third-party services have their own privacy policies and cookie policies. We recommend 
                      reviewing their policies to understand how they use cookies.
                    </p>
                  </div>
                </section>

                <Separator className="bg-rap-gold/20" />

                <section>
                  <h2 className="text-2xl font-mogra text-rap-gold mb-4">Managing Your Cookie Preferences</h2>
                  <div className="space-y-4 text-rap-platinum font-merienda leading-relaxed">
                    <p>You have several options to manage cookies:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>Use Our Cookie Preferences Tool:</strong> Click the button at the top of this page to customize your preferences</li>
                      <li><strong>Browser Settings:</strong> Most browsers allow you to refuse or delete cookies through their settings</li>
                      <li><strong>Do Not Track:</strong> We respect the Do Not Track (DNT) browser setting</li>
                    </ul>
                    <p className="text-sm text-rap-smoke mt-4">
                      <strong>Important:</strong> Blocking necessary cookies will prevent the website from functioning properly. 
                      Blocking other cookies may limit your experience on our platform.
                    </p>
                  </div>
                </section>

                <Separator className="bg-rap-gold/20" />

                <section>
                  <h2 className="text-2xl font-mogra text-rap-gold mb-4">Your Rights Under GDPR & CCPA</h2>
                  <div className="space-y-4 text-rap-platinum font-merienda leading-relaxed">
                    <p><strong>EU/EEA Residents (GDPR):</strong></p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Right to access your data</li>
                      <li>Right to rectification and erasure</li>
                      <li>Right to restrict processing</li>
                      <li>Right to data portability</li>
                      <li>Right to object to processing</li>
                      <li>Right to withdraw consent at any time</li>
                    </ul>
                    
                    <p className="mt-4"><strong>California Residents (CCPA):</strong></p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Right to know what personal information is collected</li>
                      <li>Right to delete personal information</li>
                      <li>Right to opt-out of the sale of personal information</li>
                      <li>Right to non-discrimination for exercising your rights</li>
                    </ul>
                  </div>
                </section>

                <Separator className="bg-rap-gold/20" />

                <section>
                  <h2 className="text-2xl font-mogra text-rap-gold mb-4">Cookie Consent Audit</h2>
                  <p className="text-rap-platinum font-merienda leading-relaxed">
                    We maintain a detailed audit log of all cookie consent actions in compliance with GDPR Article 7.1. 
                    This includes timestamps, consent choices, and the method of consent collection. If you'd like to 
                    review your consent history, please contact us through our support channels.
                  </p>
                </section>

                <Separator className="bg-rap-gold/20" />

                <section>
                  <h2 className="text-2xl font-mogra text-rap-gold mb-4">Changes to This Policy</h2>
                  <p className="text-rap-platinum font-merienda leading-relaxed">
                    We may update this Cookie Policy periodically to reflect changes in our practices or for legal, 
                    operational, or regulatory reasons. We will notify you of significant changes and may request 
                    renewed consent where required.
                  </p>
                </section>

                <Separator className="bg-rap-gold/20" />

                <section>
                  <h2 className="text-2xl font-mogra text-rap-gold mb-4">Contact Us</h2>
                  <p className="text-rap-platinum font-merienda leading-relaxed">
                    For questions about this Cookie Policy or to exercise your rights, contact Fresh Dope Biz LLC 
                    through our platform's support channels or admin panel.
                  </p>
                  <div className="mt-4 space-x-4">
                    <Link to="/privacy" className="text-rap-gold hover:text-rap-gold/80 underline">
                      Privacy Policy
                    </Link>
                    <Link to="/terms" className="text-rap-gold hover:text-rap-gold/80 underline">
                      Terms of Use
                    </Link>
                  </div>
                </section>

              </ThemedCardContent>
            </ThemedCard>
          </div>
        </div>
      </div>

      <Footer />

      <CookiePreferencesModal 
        isOpen={isPreferencesOpen} 
        onClose={() => setIsPreferencesOpen(false)} 
      />
    </>
  );
};

export default CookiePolicy;
