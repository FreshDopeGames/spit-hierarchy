
import React, { useState, useEffect } from "react";
import HeaderNavigation from "@/components/HeaderNavigation";
import InternalPageHeader from "@/components/InternalPageHeader";
import { Card, CardContent } from "@/components/ui/card";
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
          <Card className="bg-carbon-fiber border-rap-gold/30">
            <CardContent className="p-8 space-y-8">
              
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
                </div>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">6. Third-Party Services</h2>
                <div className="space-y-4 text-rap-platinum font-merienda leading-relaxed">
                  <p>Our platform integrates with third-party services:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Supabase:</strong> Database and authentication services</li>
                    <li><strong>Google AdMob:</strong> Advertisement delivery</li>
                    <li><strong>Analytics providers:</strong> Usage tracking and insights</li>
                  </ul>
                  <p>These services have their own privacy policies governing data use.</p>
                </div>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">7. Your Rights</h2>
                <div className="space-y-4 text-rap-platinum font-merienda leading-relaxed">
                  <p>You have the right to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Access and update your personal information</li>
                    <li>Delete your account and associated data</li>
                    <li>Opt out of non-essential communications</li>
                    <li>Request data portability where applicable</li>
                    <li>Object to certain data processing activities</li>
                  </ul>
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
                <p className="text-rap-platinum font-merienda leading-relaxed">
                  For questions about this Privacy Policy or our data practices, please contact Fresh Dope Biz LLC 
                  through our platform's support channels or admin panel.
                </p>
              </section>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
