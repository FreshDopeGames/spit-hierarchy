
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import HeaderNavigation from "@/components/HeaderNavigation";
import AuthHeader from "@/components/auth/AuthHeader";
// SOCIAL_AUTH_RESTORATION_POINT: Uncomment the line below to restore social auth
// import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import AuthForm from "@/components/auth/AuthForm";
import AuthToggle from "@/components/auth/AuthToggle";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  // SOCIAL_AUTH_RESTORATION_POINT: Uncomment the line below to restore social auth
  // const [socialLoading, setSocialLoading] = useState<string | null>(null);
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

  /* SOCIAL_AUTH_DISABLED - Social authentication function preserved for future restoration
  // SOCIAL_AUTH_RESTORATION_POINT: Uncomment this function to restore social auth
  const handleSocialAuth = async (provider: 'google' | 'facebook' | 'twitter') => {
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
  SOCIAL_AUTH_DISABLED */

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
              username,
              full_name: fullName
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
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
      <HeaderNavigation isScrolled={isScrolled} />

      <div className="pt-24 flex items-center justify-center p-4 min-h-screen">
        <Card className="w-full max-w-md bg-carbon-fiber border-rap-burgundy/50">
          <AuthHeader isLogin={isLogin} />
          
          <CardContent className="space-y-6">
            {/* SOCIAL_AUTH_DISABLED - Social authentication buttons temporarily removed
            SOCIAL_AUTH_RESTORATION_POINT: Uncomment the section below to restore social auth buttons
            
            <SocialAuthButtons 
              socialLoading={socialLoading}
              onSocialAuth={handleSocialAuth}
            />

            <div className="relative flex items-center">
              <div className="flex-grow border-t border-rap-smoke/50"></div>
              <span className="flex-shrink mx-4 text-rap-smoke font-merienda text-xs uppercase">
                Or continue with email
              </span>
              <div className="flex-grow border-t border-rap-smoke/50"></div>
            </div>
            
            SOCIAL_AUTH_DISABLED */}

            <AuthForm
              isLogin={isLogin}
              email={email}
              password={password}
              username={username}
              fullName={fullName}
              loading={loading}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onUsernameChange={setUsername}
              onFullNameChange={setFullName}
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
