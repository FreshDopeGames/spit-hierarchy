
import React, { useState, useEffect } from "react";
import HeaderNavigation from "@/components/HeaderNavigation";
import InternalPageHeader from "@/components/InternalPageHeader";
import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";
import { Separator } from "@/components/ui/separator";
import SEOHead from "@/components/seo/SEOHead";
import Footer from "@/components/Footer";

const TermsOfUse = () => {
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
        title="Terms of Service - Spit Hierarchy"
        description="Review the terms and conditions for using Spit Hierarchy. Understand user responsibilities, content guidelines, and community rules."
        keywords={['terms of service', 'user agreement', 'community guidelines', 'legal terms']}
        canonicalUrl="/terms"
      />
      <HeaderNavigation isScrolled={isScrolled} />
      
      <div className="pt-24">
        <InternalPageHeader 
          title="Terms of Use" 
          subtitle="Platform guidelines and user responsibilities"
        />
        
        <div className="max-w-4xl mx-auto p-6 pb-20">
          <ThemedCard className="bg-[var(--theme-surface)] border-[var(--theme-primary)]/30">
            <ThemedCardContent className="p-8 space-y-8">
              
              <div className="text-rap-smoke text-sm">
                Last updated: March 2025
              </div>

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">1. Acceptance of Terms</h2>
                <p className="text-rap-platinum font-merienda leading-relaxed">
                  By accessing and using Spit Hierarchy ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. 
                  This platform is dedicated to ranking and celebrating hip-hop artists based on community input and official rankings.
                </p>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">2. Platform Usage</h2>
                <div className="space-y-4 text-rap-platinum font-merienda leading-relaxed">
                  <p>Spit Hierarchy is a community-driven platform for ranking hip-hop artists. Users may:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Vote on rapper rankings and provide feedback</li>
                    <li>View comprehensive statistics and analytics</li>
                    <li>Read and engage with hip-hop content and blogs</li>
                    <li>Create and maintain user profiles</li>
                  </ul>
                </div>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">3. User Conduct</h2>
                <div className="space-y-4 text-rap-platinum font-merienda leading-relaxed">
                  <p>Users must adhere to the following community standards:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Respect all artists and community members</li>
                    <li>Provide honest and thoughtful voting and feedback</li>
                    <li>No harassment, hate speech, or discriminatory content</li>
                    <li>No spam, manipulation of rankings, or fraudulent activity</li>
                    <li>Maintain the cultural integrity of hip-hop discussions</li>
                  </ul>
                </div>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">4. Voting Rules</h2>
                <div className="space-y-4 text-rap-platinum font-merienda leading-relaxed">
                  <p>Our ranking system operates under these guidelines:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>One vote per user per rapper ranking per day</li>
                    <li>Votes should reflect genuine artistic assessment</li>
                    <li>Vote manipulation or coordinated efforts are prohibited</li>
                    <li>Rankings are updated in real-time based on community input</li>
                  </ul>
                </div>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">5. Content Guidelines</h2>
                <div className="space-y-4 text-rap-platinum font-merienda leading-relaxed">
                  <p>All user-generated content must:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Be respectful and constructive</li>
                    <li>Stay relevant to hip-hop culture and artist rankings</li>
                    <li>Not infringe on intellectual property rights</li>
                    <li>Comply with applicable laws and regulations</li>
                  </ul>
                </div>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">6. User-Generated Content</h2>
                <div className="space-y-4 text-rap-platinum font-merienda leading-relaxed">
                  <p>
                    Spit Hierarchy allows users to create and share user-generated content ("UGC"), including but not limited to journal entries, 
                    comments, votes with notes, profile information, and any other content submitted to the platform.
                  </p>
                  <p>
                    <strong>WARNING — Do Not Share Personal Information:</strong> We strongly advise against disclosing any personally 
                    identifiable information ("PII") in your UGC. This includes, but is not limited to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Your real name, full legal name, or family members' names</li>
                    <li>Age, date of birth, or year of birth</li>
                    <li>Sex, gender identity, or sexual orientation</li>
                    <li>Physical address, city of residence, or specific location details</li>
                    <li>Phone number, email address, or other direct contact information</li>
                    <li>Social Security number, state ID number, driver's license number, or passport number</li>
                    <li>Financial information such as bank accounts, credit card numbers, or income</li>
                    <li>Medical or health information</li>
                    <li>School, workplace, or employer information</li>
                    <li>Photographs of yourself or others that reveal identity or location</li>
                    <li>Any other data that could be used to identify, locate, or contact you or others</li>
                  </ul>
                  <p>
                    <strong>Right to Remove Content:</strong> Fresh Dope Biz LLC reserves the right to remove, edit, or unpublish any UGC 
                    that contains personally identifiable information, at our sole discretion and without prior notice. This right extends to 
                    any content we deem may put a user or third party at risk, regardless of whether the content violates other platform rules.
                  </p>
                  <p>
                    <strong>Content License:</strong> By submitting UGC to Spit Hierarchy, you grant Fresh Dope Biz LLC a non-exclusive, 
                    royalty-free, worldwide license to display, distribute, moderate, and remove your content as necessary to operate and 
                    maintain the platform. You retain ownership of your original content, but acknowledge our right to manage it in accordance 
                    with these Terms.
                  </p>
                </div>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">7. Assumption of Risk & Liability Waiver</h2>
                <div className="space-y-4 text-rap-platinum font-merienda leading-relaxed">
                  <p>
                    <strong>BY USING SPIT HIERARCHY, YOU ACKNOWLEDGE AND AGREE THAT ANY INFORMATION YOU SHARE THROUGH THE PLATFORM IS 
                    SHARED VOLUNTARILY AND ENTIRELY AT YOUR OWN RISK.</strong>
                  </p>
                  <p>
                    Fresh Dope Biz LLC, its officers, directors, employees, agents, and affiliates shall not be held liable for any harm, 
                    damage, loss, claim, or consequence — whether direct, indirect, incidental, special, consequential, or punitive — 
                    arising from or related to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Identity theft, fraud, or misuse of personal data shared through UGC</li>
                    <li>Harassment, stalking, threats, or unwanted contact from other users or third parties</li>
                    <li>Physical harm, assault, or any in-person encounters resulting from information disclosed on the platform</li>
                    <li>Financial loss or damage resulting from shared financial or employment information</li>
                    <li>Emotional distress, reputational harm, or social consequences</li>
                    <li>Any online or offline interactions, communications, or relationships that originate from or are facilitated by the platform</li>
                    <li>Third-party misuse of publicly available UGC, including scraping or indexing by search engines</li>
                  </ul>
                  <p>
                    You assume full and sole responsibility for evaluating the risks associated with sharing any information on the platform. 
                    This assumption of risk applies regardless of whether Fresh Dope Biz LLC's moderation systems detect, flag, or remove 
                    the content in question. The platform is provided on an "as-is" and "as-available" basis without warranties of any kind.
                  </p>
                  <p>
                    This service is provided as a community platform for hip-hop culture discussion and ranking. It is not intended, designed, 
                    or authorized to be used as a vehicle for sharing sensitive personal data, and any such use constitutes a misuse of the service.
                  </p>
                </div>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">8. Prohibited Uses</h2>
                <div className="space-y-4 text-rap-platinum font-merienda leading-relaxed">
                  <p>
                    Spit Hierarchy is provided as a service for the enjoyment and engagement of the hip-hop community. 
                    The platform is not intended or designed to be abused. The following uses are strictly prohibited:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Using the platform to share, solicit, or collect sensitive personal data from other users</li>
                    <li>Using the platform as a communication tool for illegal activity, including but not limited to threats, extortion, or trafficking</li>
                    <li>Doxxing or publishing another person's private information without their consent</li>
                    <li>Impersonating another person or creating fraudulent accounts</li>
                    <li>Using automated tools, bots, or scripts to scrape user content or manipulate platform features</li>
                    <li>Any activity that violates applicable local, state, national, or international law</li>
                  </ul>
                  <p>
                    Violation of these prohibited uses constitutes grounds for immediate account suspension or permanent termination, 
                    at the sole discretion of Fresh Dope Biz LLC, without prior notice or refund of any kind.
                  </p>
                </div>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">9. Account Responsibilities</h2>
                <p className="text-rap-platinum font-merienda leading-relaxed">
                  Users are responsible for maintaining the security of their accounts and all activities that occur under their account. 
                  Fresh Dope Biz LLC reserves the right to suspend or terminate accounts that violate these terms.
                </p>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">10. Limitation of Liability</h2>
                <p className="text-rap-platinum font-merienda leading-relaxed">
                  Fresh Dope Biz LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
                  resulting from your use of the platform. Rankings and content are provided "as is" without warranties.
                </p>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">11. Push Notifications & Browser Permissions</h2>
                <div className="space-y-4 text-rap-platinum font-merienda leading-relaxed">
                  <p>
                    Spit Hierarchy may request permission to send push notifications to your device. By granting notification permissions, you consent to receive:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Updates on ranking changes for your favorite artists</li>
                    <li>Achievement and badge unlock notifications</li>
                    <li>New content alerts including blog posts and community activity</li>
                    <li>Important platform announcements and system updates</li>
                    <li>Reminders for voting streaks and engagement milestones</li>
                  </ul>
                  <p>
                    You may revoke notification permissions at any time through your browser or device settings. 
                    Notification preferences can also be managed in your account settings. We will not sell or share 
                    your notification tokens with third parties except as necessary to deliver notifications through 
                    standard browser APIs.
                  </p>
                </div>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">12. App Installation & Home Screen Access</h2>
                <div className="space-y-4 text-rap-platinum font-merienda leading-relaxed">
                  <p>
                    Spit Hierarchy can be installed as a Progressive Web App (PWA) on your device. By installing the app:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>You can access the platform directly from your home screen</li>
                    <li>The app will work offline for previously cached content</li>
                    <li>You may experience improved performance through local caching</li>
                    <li>The app will operate in fullscreen mode for an immersive experience</li>
                  </ul>
                  <p>
                    Installing the app is optional and does not grant additional data access beyond what is already 
                    collected through normal browser usage. You can uninstall the app at any time through your device's 
                    standard app management interface.
                  </p>
                </div>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">13. Changes to Terms</h2>
                <p className="text-rap-platinum font-merienda leading-relaxed">
                  We reserve the right to modify these terms at any time. Users will be notified of significant changes, 
                  and continued use of the platform constitutes acceptance of modified terms.
                </p>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">14. Contact Information</h2>
                <p className="text-rap-platinum font-merienda leading-relaxed">
                  For questions about these Terms of Use, please contact Fresh Dope Biz LLC through our platform's support channels.
                </p>
              </section>

            </ThemedCardContent>
          </ThemedCard>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsOfUse;
