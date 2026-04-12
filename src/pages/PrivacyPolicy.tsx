
import React, { useState, useEffect } from "react";
import HeaderNavigation from "@/components/HeaderNavigation";
import InternalPageHeader from "@/components/InternalPageHeader";
import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";
import { Separator } from "@/components/ui/separator";
import SEOHead from "@/components/seo/SEOHead";
import Footer from "@/components/Footer";

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
      <SEOHead
        title="Privacy Policy - Spit Hierarchy"
        description="Read our comprehensive privacy policy covering data collection, usage, security, and your rights under GDPR and CCPA. Learn how we protect your information."
        keywords={['privacy policy', 'data protection', 'GDPR', 'CCPA', 'user privacy', 'data security']}
        canonicalUrl="/privacy"
      />
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
                Last updated: April 2026
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
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">4. User-Generated Content & Personal Information</h2>
                <div className="space-y-4 text-rap-platinum font-merienda leading-relaxed">
                  <p>
                    Spit Hierarchy allows users to create and share content including journal entries, comments, profile information, and other 
                    user-generated content ("UGC"). We strongly advise all users against disclosing personally identifiable information ("PII") 
                    in any UGC on the platform.
                  </p>
                  <p><strong>You should never share the following in any UGC:</strong></p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Your real name or full legal name</li>
                    <li>Age, date of birth, or year of birth</li>
                    <li>Sex, gender identity, or sexual orientation</li>
                    <li>Physical address, city of residence, or specific location details</li>
                    <li>Phone number, email address, or other contact information</li>
                    <li>Social Security number, state ID number, driver's license number, or passport number</li>
                    <li>Financial information including bank account numbers, credit card numbers, or income details</li>
                    <li>Medical or health information</li>
                    <li>School, workplace, or employer details</li>
                    <li>Any other information that could be used to identify, locate, or contact you</li>
                  </ul>
                  <p>
                    <strong>Content Visibility:</strong> UGC that is marked as public (such as public journal entries or comments) may be visible 
                    to all platform users and may be indexed by third-party search engines. Once information is shared publicly, it may be 
                    difficult or impossible to fully remove from the internet.
                  </p>
                  <p>
                    <strong>Right to Remove PII:</strong> Fresh Dope Biz LLC reserves the right to remove, edit, or unpublish any UGC that 
                    contains personally identifiable information, at our sole discretion and without prior notice. This action is taken to 
                    protect users and maintain the safety of the community, and does not constitute censorship or editorial control over 
                    non-PII content.
                  </p>
                </div>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">5. Assumption of Risk</h2>
                <div className="space-y-4 text-rap-platinum font-merienda leading-relaxed">
                  <p>
                    By using Spit Hierarchy and creating or sharing any user-generated content, you acknowledge and agree that you do so 
                    entirely at your own risk. You are solely responsible for any information you choose to disclose through the platform, 
                    whether in journal entries, comments, profile data, or any other form of UGC.
                  </p>
                  <p>
                    <strong>Fresh Dope Biz LLC shall not be held liable for any harm, damage, loss, or consequence — whether online or 
                    offline — that results from your decision to share personal information through the platform.</strong> This includes, 
                    but is not limited to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Identity theft or fraudulent use of your personal data</li>
                    <li>Harassment, stalking, or unwanted contact from other users or third parties</li>
                    <li>Financial loss or damage resulting from shared financial information</li>
                    <li>Physical harm or threats arising from disclosed location or identity details</li>
                    <li>Emotional distress, reputational harm, or social consequences</li>
                    <li>Any interactions — online or offline — that result from information shared on the platform</li>
                  </ul>
                  <p>
                    You voluntarily assume all risks associated with sharing any personal information on Spit Hierarchy. This assumption 
                    of risk applies regardless of whether the platform's moderation systems detect or remove the content in question.
                  </p>
                </div>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">6. Data Security</h2>
                <p className="text-rap-platinum font-merienda leading-relaxed">
                  We implement appropriate security measures to protect your personal information against unauthorized access, 
                  alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security assessments.
                </p>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">7. Cookies and Tracking</h2>
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
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">8. IP-Based Geolocation</h2>
                <div className="space-y-4 text-rap-platinum font-merienda leading-relaxed">
                  <p>
                    To provide geographic voting analytics and regional community insights, we collect approximate 
                    geographic location data derived from your IP address.
                  </p>
                  <p><strong>What We Collect:</strong></p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Approximate country of origin</li>
                    <li>State or region (e.g., US states, Canadian provinces)</li>
                    <li>Approximate city</li>
                  </ul>
                  <p><strong>How We Collect It:</strong></p>
                  <p>
                    When you interact with the platform while logged in, a server-side geolocation lookup is 
                    performed using your IP address. This lookup occurs automatically and does not require any 
                    action on your part.
                  </p>
                  <p><strong>What We Store:</strong></p>
                  <p>
                    We store only the derived location information (country, region, and city). <strong>Your raw 
                    IP address is not stored</strong> in our location database. The geolocation lookup is performed 
                    server-side via a third-party geolocation service, and only the resulting geographic data is retained.
                  </p>
                  <p><strong>Purpose:</strong></p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>To generate geographic voting analytics (e.g., most popular rappers by state or country)</li>
                    <li>To provide regional community insights and trends</li>
                    <li>To improve the relevance and accuracy of platform rankings</li>
                  </ul>
                  <p><strong>Legal Basis:</strong></p>
                  <p>
                    Under GDPR, we process this data based on our legitimate interest in providing meaningful 
                    geographic analytics to our community. Under CCPA, this collection is disclosed in this 
                    Privacy Policy as required.
                  </p>
                  <p><strong>Your Rights:</strong></p>
                  <p>
                    Your location data is subject to the same access, correction, and deletion rights described 
                    in Section 10 below. You may request deletion of your stored location data at any time by 
                    contacting us through our support channels.
                  </p>
                </div>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">9. Third-Party Services</h2>
                <div className="space-y-4 text-rap-platinum font-merienda leading-relaxed">
                  <p>Our platform integrates with third-party services that process data on our behalf:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Supabase:</strong> Database hosting, authentication services, and secure data storage</li>
                    <li><strong>Google AdSense:</strong> Advertisement delivery (Publisher ID: ca-pub-2518650700414992)</li>
                    <li><strong>IP Geolocation Service:</strong> Server-side geographic lookup for voter analytics (IP addresses are not stored)</li>
                    <li><strong>Analytics providers:</strong> Usage tracking and insights (requires consent)</li>
                  </ul>
                  <p className="mt-4">
                    <strong>Data Retention:</strong> We retain your personal information only as long as necessary 
                    to provide our services or as required by law. Profile data is retained while your account is active. 
                    Voting and ranking data may be retained indefinitely for historical analytics. Geographic location 
                    data is retained while your account is active and deleted upon account deletion.
                  </p>
                  <p className="text-sm text-rap-smoke mt-2">
                    These third-party services have their own privacy policies. We recommend reviewing their policies 
                    to understand how they handle your data.
                  </p>
                </div>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">10. Your Rights</h2>
                <div className="space-y-4 text-rap-platinum font-merienda leading-relaxed">
                  <p><strong>All Users:</strong></p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Access and update your personal information through your profile settings</li>
                    <li>Delete your account and associated data via your account settings</li>
                    <li>Opt out of non-essential communications and marketing emails</li>
                    <li>Withdraw cookie consent at any time through our Cookie Preferences tool</li>
                    <li>Request deletion of your geographic location data</li>
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
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">11. Children's Privacy</h2>
                <p className="text-rap-platinum font-merienda leading-relaxed">
                  Our platform is not intended for children under 13. We do not knowingly collect personal information from children under 13. 
                  If we become aware of such collection, we will take steps to delete the information.
                </p>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">12. Changes to Privacy Policy</h2>
                <p className="text-rap-platinum font-merienda leading-relaxed">
                  We may update this Privacy Policy periodically. We will notify users of significant changes via email or platform notification. 
                  Your continued use constitutes acceptance of the updated policy.
                </p>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">13. Contact Us</h2>
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

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
