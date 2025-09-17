
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import HeaderNavigation from "@/components/HeaderNavigation";
import AuthHeader from "@/components/auth/AuthHeader";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import AuthForm from "@/components/auth/AuthForm";
import AuthToggle from "@/components/auth/AuthToggle";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        window.location.href = '/';
      }
    };
    checkUser();

    // Handle scroll for header
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSocialAuth = async (provider: 'google') => {
    setSocialLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      if (error) throw error;

      // The redirect will handle the rest
    } catch (error: any) {
      toast.error(error.message || `An error occurred during ${provider} authentication.`);
    } finally {
      setSocialLoading(null);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        if (data.user) {
          toast.success("You've successfully logged in.");
          window.location.href = '/';
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              username
            }
          }
        });
        if (error) throw error;
        
        if (data.user) {
          if (data.user.email_confirmed_at) {
            toast.success("Welcome to Spit Hierarchy! You can now start ranking rap legends");
            window.location.href = '/';
          } else {
            toast.success("Please check your email and click the confirmation link to complete your registration.");
          }
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--theme-element-page-background-bg,var(--theme-background))]">
      <HeaderNavigation isScrolled={isScrolled} />

      <div className="pt-24 flex items-center justify-center p-4 min-h-screen">
        <Card className="w-full max-w-md bg-[var(--theme-element-card-bg,var(--theme-surface))] border-[var(--theme-element-card-border-color,var(--theme-border))]">
          <AuthHeader isLogin={isLogin} />
          
          <CardContent className="space-y-6">
            <SocialAuthButtons 
              socialLoading={socialLoading}
              onSocialAuth={handleSocialAuth}
            />

            <div className="relative flex items-center">
              <div className="flex-grow border-t border-[var(--theme-element-divider-color,var(--theme-border))]"></div>
              <span className="flex-shrink mx-4 text-[var(--theme-element-text-muted-color,var(--theme-text-secondary))] font-merienda text-xs uppercase">
                Or continue with email
              </span>
              <div className="flex-grow border-t border-[var(--theme-element-divider-color,var(--theme-border))]"></div>
            </div>

            <AuthForm
              isLogin={isLogin}
              email={email}
              password={password}
              username={username}
              loading={loading}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onUsernameChange={setUsername}
              onSubmit={handleAuth}
            />
            
            <AuthToggle 
              isLogin={isLogin}
              onToggle={() => setIsLogin(!isLogin)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
