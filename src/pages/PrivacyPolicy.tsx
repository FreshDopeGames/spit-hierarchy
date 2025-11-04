
import React, { useState, useEffect } from "react";
import HeaderNavigation from "@/components/HeaderNavigation";
import InternalPageHeader from "@/components/InternalPageHeader";
import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";
import { Separator } from "@/components/ui/separator";

const PrivacyPolicy = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
      <HeaderNavigation isScrolled={isScrolled} />
      
      <div className="pt-24">
        <InternalPageHeader 
          title="Privacy Policy" 
          subtitle="How we protect and use your information"
        />
        
        <div className="max-w-4xl mx-auto p-6 pb-20">
          <ThemedCard className="bg-[var(--theme-surface)] border-[var(--theme-primary)]/30">
            <ThemedCardContent className="p-8 space-y-8">
              
              <div className="text-rap-smoke text-sm">
                Last updated: January 2025
              </div>

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">1. Information We Collect</h2>
                <div className="space-y-4 text-rap-platinum font-merienda leading-relaxed">
                  <p>We collect information to provide better services to our users:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Account Information:</strong> Email address, username, and profile data</li>
                    <li><strong>Usage Data:</strong> Voting patterns, page views, and platform interactions</li>
                    <li><strong>Device Information:</strong> Browser type, IP address, and device characteristics</li>
                    <li><strong>Cookies:</strong> Session data and user preferences</li>
                  </ul>
                </div>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">2. How We Use Your Information</h2>
                <div className="space-y-4 text-rap-platinum font-merienda leading-relaxed">
                  <p>Your information helps us:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Provide and maintain our hip-hop ranking services</li>
                    <li>Process your votes and maintain ranking accuracy</li>
                    <li>Generate analytics and community insights</li>
                    <li>Improve user experience and platform functionality</li>
                    <li>Communicate important updates and notifications</li>
                    <li>Prevent fraud and maintain platform security</li>
                  </ul>
                </div>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">3. Information Sharing</h2>
                <div className="space-y-4 text-rap-platinum font-merienda leading-relaxed">
                  <p>We do not sell your personal information. We may share information:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>With your consent or at your direction</li>
                    <li>For legal compliance or law enforcement</li>
                    <li>With service providers who assist in platform operations</li>
                    <li>In aggregated, anonymized form for analytics</li>
                  </ul>
                </div>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">4. Data Security</h2>
                <p className="text-rap-platinum font-merienda leading-relaxed">
                  We implement appropriate security measures to protect your personal information against unauthorized access, 
                  alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security assessments.
                </p>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">5. Cookies and Tracking</h2>
                <div className="space-y-4 text-rap-platinum font-merienda leading-relaxed">
                  <p>We use cookies and similar technologies to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Remember your preferences and login status</li>
                    <li>Analyze platform usage and performance</li>
                    <li>Provide personalized content and rankings</li>
                    <li>Serve relevant advertisements through third-party partners</li>
                  </ul>
                  <p className="mt-4">
                    For detailed information about the cookies we use and your choices, please see our{' '}
                    <a href="/cookies" className="text-rap-gold hover:text-rap-gold/80 underline">Cookie Policy</a>.
                  </p>
                  <p className="text-sm text-rap-smoke mt-2">
                    <strong>Cookie Consent Duration:</strong> Your cookie preferences are stored for 12 months, 
                    after which we will request your consent again.
                  </p>
                </div>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">6. Third-Party Services</h2>
                <div className="space-y-4 text-rap-platinum font-merienda leading-relaxed">
                  <p>Our platform integrates with third-party services that process data on our behalf:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Supabase:</strong> Database hosting, authentication services, and secure data storage</li>
                    <li><strong>Google AdSense:</strong> Advertisement delivery (Publisher ID: ca-pub-2518650700414992)</li>
                    <li><strong>Analytics providers:</strong> Usage tracking and insights (requires consent)</li>
                  </ul>
                  <p className="mt-4">
                    <strong>Data Retention:</strong> We retain your personal information only as long as necessary 
                    to provide our services or as required by law. Profile data is retained while your account is active. 
                    Voting and ranking data may be retained indefinitely for historical analytics.
                  </p>
                  <p className="text-sm text-rap-smoke mt-2">
                    These third-party services have their own privacy policies. We recommend reviewing their policies 
                    to understand how they handle your data.
                  </p>
                </div>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">7. Your Rights</h2>
                <div className="space-y-4 text-rap-platinum font-merienda leading-relaxed">
                  <p><strong>All Users:</strong></p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Access and update your personal information through your profile settings</li>
                    <li>Delete your account and associated data via your account settings</li>
                    <li>Opt out of non-essential communications and marketing emails</li>
                    <li>Withdraw cookie consent at any time through our Cookie Preferences tool</li>
                  </ul>
                  
                  <p className="mt-4"><strong>EU/EEA Residents (GDPR Rights):</strong></p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Right of Access:</strong> Request a copy of your personal data we hold</li>
                    <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
                    <li><strong>Right to Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
                    <li><strong>Right to Restriction:</strong> Limit how we process your data in certain circumstances</li>
                    <li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
                    <li><strong>Right to Object:</strong> Object to processing based on legitimate interests or for direct marketing</li>
                    <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for data processing at any time</li>
                    <li><strong>Right to Lodge a Complaint:</strong> File a complaint with your local data protection authority</li>
                  </ul>
                  
                  <p className="mt-4"><strong>California Residents (CCPA Rights):</strong></p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Right to Know:</strong> Request disclosure of categories and specific pieces of personal information collected</li>
                    <li><strong>Right to Delete:</strong> Request deletion of personal information we've collected</li>
                    <li><strong>Right to Opt-Out:</strong> Opt-out of the sale of personal information (Note: We do not sell personal information)</li>
                    <li><strong>Right to Non-Discrimination:</strong> You will not be discriminated against for exercising your privacy rights</li>
                  </ul>
                  
                  <p className="mt-4 text-sm text-rap-smoke">
                    <strong>How to Exercise Your Rights:</strong> To exercise any of these rights, please contact us through 
                    our support channels or admin panel. We will respond to verifiable requests within 30 days (45 days for CCPA requests).
                  </p>
                </div>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">8. Children's Privacy</h2>
                <p className="text-rap-platinum font-merienda leading-relaxed">
                  Our platform is not intended for children under 13. We do not knowingly collect personal information from children under 13. 
                  If we become aware of such collection, we will take steps to delete the information.
                </p>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">9. Changes to Privacy Policy</h2>
                <p className="text-rap-platinum font-merienda leading-relaxed">
                  We may update this Privacy Policy periodically. We will notify users of significant changes via email or platform notification. 
                  Your continued use constitutes acceptance of the updated policy.
                </p>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">10. Contact Us</h2>
                <div className="space-y-4 text-rap-platinum font-merienda leading-relaxed">
                  <p>
                    For questions about this Privacy Policy, to exercise your privacy rights, or for general data privacy inquiries, 
                    please contact Fresh Dope Biz LLC:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Through our platform's support channels</li>
                    <li>Via the admin panel contact form</li>
                    <li>Email: privacy@spithierarchy.com (if applicable)</li>
                  </ul>
                  <p className="text-sm text-rap-smoke mt-4">
                    <strong>Data Protection Officer (if applicable):</strong> For EU/EEA residents with GDPR-related inquiries, 
                    please specify "GDPR Request" in your communication subject line.
                  </p>
                </div>
              </section>

            </ThemedCardContent>
          </ThemedCard>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
