import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Trophy, Award, TrendingUp, Sparkles } from 'lucide-react';
import HeaderNavigation from '@/components/HeaderNavigation';
import Footer from '@/components/Footer';
import QuizContainer from '@/components/quiz/QuizContainer';
import QuizBadgeDisplay from '@/components/quiz/QuizBadgeDisplay';
import RotatingRapperMosaic from '@/components/quiz/RotatingRapperMosaic';
import { ThemedCard, ThemedCardContent } from '@/components/ui/themed-card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const QuizGuestCTA: React.FC = () => (
  <ThemedCard variant="dark" className="border-[hsl(var(--theme-primary))]/40 shadow-2xl shadow-[hsl(var(--theme-primary))]/20 relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-1 bg-[hsl(var(--theme-primary))]" />
    <ThemedCardContent className="p-8 md:p-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[hsl(var(--theme-primary))]/10 border-2 border-[hsl(var(--theme-primary))]/40 mb-6">
        <Trophy className="w-8 h-8 text-[hsl(var(--theme-primary))]" />
      </div>
      <h2 className="text-3xl md:text-4xl font-[var(--theme-font-heading)] text-[hsl(var(--theme-primary))] mb-3">
        Ready to Take the Quiz?
      </h2>
      <p className="text-[hsl(var(--theme-text))]/80 max-w-xl mx-auto mb-8 font-[var(--theme-font-body)]">
        Join the culture to test your hip-hop knowledge, earn exclusive badges, and prove you know your rap history.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
        <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-[hsl(var(--theme-primary))]/5 border border-[hsl(var(--theme-primary))]/20">
          <Award className="w-6 h-6 text-[hsl(var(--theme-primary))]" />
          <span className="text-sm text-[hsl(var(--theme-text))] font-semibold">Earn Badges</span>
        </div>
        <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-[hsl(var(--theme-primary))]/5 border border-[hsl(var(--theme-primary))]/20">
          <Sparkles className="w-6 h-6 text-[hsl(var(--theme-primary))]" />
          <span className="text-sm text-[hsl(var(--theme-text))] font-semibold">Flex Your Knowledge</span>
        </div>
        <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-[hsl(var(--theme-primary))]/5 border border-[hsl(var(--theme-primary))]/20">
          <TrendingUp className="w-6 h-6 text-[hsl(var(--theme-primary))]" />
          <span className="text-sm text-[hsl(var(--theme-text))] font-semibold">Track Progress</span>
        </div>
      </div>

      <Link to="/auth">
        <Button variant="gradient" size="lg" className="font-[var(--theme-font-heading)] shadow-xl shadow-[hsl(var(--theme-primary))]/40">
          Sign Up Free to Play
        </Button>
      </Link>
      <p className="text-sm text-[hsl(var(--theme-textMuted))] mt-4 font-[var(--theme-font-body)]">
        Already joined?{' '}
        <Link to="/auth" className="text-[hsl(var(--theme-primary))] hover:text-[hsl(var(--theme-primaryLight))] font-semibold underline">
          Sign in
        </Link>
      </p>
    </ThemedCardContent>
  </ThemedCard>
);
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
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Put your hip-hop knowledge to the test. Answer questions about your favorite rappers, 
              their albums, origins, and career milestones. Earn badges and climb the ranks!
            </p>
            <RotatingRapperMosaic />
          </div>

          {/* Quiz Container */}
          <div className="mb-8">
            {user ? <QuizContainer /> : <QuizGuestCTA />}
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