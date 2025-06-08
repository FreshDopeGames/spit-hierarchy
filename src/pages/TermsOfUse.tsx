
import React, { useState, useEffect } from "react";
import HeaderNavigation from "@/components/HeaderNavigation";
import InternalPageHeader from "@/components/InternalPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
      <HeaderNavigation isScrolled={isScrolled} />
      
      <div className="pt-24">
        <InternalPageHeader 
          title="Terms of Use" 
          subtitle="Platform guidelines and user responsibilities"
        />
        
        <div className="max-w-4xl mx-auto p-6 pb-20">
          <Card className="bg-carbon-fiber border-rap-gold/30">
            <CardContent className="p-8 space-y-8">
              
              <div className="text-rap-smoke text-sm">
                Last updated: January 2025
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
                    <li>One vote per user per rapper ranking</li>
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
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">6. Account Responsibilities</h2>
                <p className="text-rap-platinum font-merienda leading-relaxed">
                  Users are responsible for maintaining the security of their accounts and all activities that occur under their account. 
                  Fresh Dope Biz LLC reserves the right to suspend or terminate accounts that violate these terms.
                </p>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">7. Limitation of Liability</h2>
                <p className="text-rap-platinum font-merienda leading-relaxed">
                  Fresh Dope Biz LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
                  resulting from your use of the platform. Rankings and content are provided "as is" without warranties.
                </p>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">8. Changes to Terms</h2>
                <p className="text-rap-platinum font-merienda leading-relaxed">
                  We reserve the right to modify these terms at any time. Users will be notified of significant changes, 
                  and continued use of the platform constitutes acceptance of modified terms.
                </p>
              </section>

              <Separator className="bg-rap-gold/20" />

              <section>
                <h2 className="text-2xl font-mogra text-rap-gold mb-4">9. Contact Information</h2>
                <p className="text-rap-platinum font-merienda leading-relaxed">
                  For questions about these Terms of Use, please contact Fresh Dope Biz LLC through our platform's support channels.
                </p>
              </section>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
