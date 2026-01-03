import React from 'react';
import { Helmet } from 'react-helmet-async';
import HeaderNavigation from '@/components/HeaderNavigation';
import Footer from '@/components/Footer';
import QuizContainer from '@/components/quiz/QuizContainer';
import QuizBadgeDisplay from '@/components/quiz/QuizBadgeDisplay';
import { useAuth } from '@/hooks/useAuth';
const Quiz: React.FC = () => {
  const {
    user
  } = useAuth();
  return <>
      <Helmet>
        <title>Rapper Quiz - Test Your Hip-Hop Knowledge | Spit Hierarchy</title>
        <meta name="description" content="Test your rap knowledge with our interactive quiz! Answer questions about rappers, albums, and hip-hop history to earn badges and prove your expertise." />
      </Helmet>

      <main className="min-h-screen bg-gradient-to-br from-[hsl(var(--theme-background))] via-[hsl(var(--theme-backgroundLight))] to-[hsl(var(--theme-background))]">
        <HeaderNavigation isScrolled={false} />
        
        <div className="relative z-10 max-w-4xl mx-auto p-6 pt-28 pb-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="font-[var(--theme-font-heading)] mb-2 text-primary md:text-5xl text-5xl">
              🎤 Rapper Knowledge Quiz
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Put your hip-hop knowledge to the test. Answer questions about your favorite rappers, 
              their albums, origins, and career milestones. Earn badges and climb the ranks!
            </p>
          </div>

          {/* Quiz Container */}
          <div className="mb-8">
            <QuizContainer />
          </div>

          {/* Badge Progress Display */}
          {user && <div className="mt-8">
              <QuizBadgeDisplay userId={user.id} showProgress={true} title="Your Quiz Badge Progress" />
            </div>}
        </div>

        <Footer />
      </main>
    </>;
};
export default Quiz;