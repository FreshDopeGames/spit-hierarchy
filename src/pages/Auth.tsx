import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { User, Mail, Lock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import HeaderNavigation from "@/components/HeaderNavigation";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const {
    toast
  } = useToast();
  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
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
  const handleSocialAuth = async (provider: 'google' | 'facebook' | 'twitter') => {
    setSocialLoading(provider);
    try {
      const {
        data,
        error
      } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;

      // The redirect will handle the rest
    } catch (error: any) {
      console.error(`${provider} auth error:`, error);
      toast({
        title: "Authentication Error",
        description: error.message || `An error occurred during ${provider} authentication.`,
        variant: "destructive"
      });
    } finally {
      setSocialLoading(null);
    }
  };
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const {
          data,
          error
        } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        if (data.user) {
          toast({
            title: "Welcome back!",
            description: "You've successfully logged in."
          });
          window.location.href = '/';
        }
      } else {
        const {
          data,
          error
        } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              full_name: fullName
            }
          }
        });
        if (error) throw error;
        if (data.user) {
          toast({
            title: "Account created!",
            description: "Welcome to Spit Hierarchy! You can now start ranking rap legends"
          });
          window.location.href = '/';
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: "Authentication Error",
        description: error.message || "An error occurred during authentication.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
      <HeaderNavigation isScrolled={isScrolled} />

      <div className="pt-24 flex items-center justify-center p-4 min-h-screen">
        <Card className="w-full max-w-md bg-carbon-fiber border-rap-burgundy/50">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <img 
                  src="/lovable-uploads/49d79e00-3ea3-454a-a173-8770856c02ac.png" 
                  alt="Spit Hierarchy Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <h1 className="font-ceviche bg-gradient-to-r from-rap-silver to-rap-platinum bg-clip-text text-transparent text-3xl font-normal">
                Spit Hierarchy
              </h1>
            </div>
            <CardTitle className="text-rap-silver font-ceviche font-thin text-5xl">
              {isLogin ? "Welcome Back" : "Join The Culture"}
            </CardTitle>
            <p className="font-merienda text-sm mt-2 text-rap-platinum">
              {isLogin ? "Sign in to vote and rank your favorite MCs" : "Create your account to start ranking rap legends"}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Social Login Buttons */}
            <div className="space-y-3">
              <Button onClick={() => handleSocialAuth('google')} disabled={socialLoading === 'google'} variant="outline" className="w-full bg-rap-carbon/50 border-rap-silver/30 text-rap-silver hover:bg-rap-burgundy/20 font-merienda ">
                {socialLoading === 'google' ? "Connecting..." : <>
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </>}
              </Button>

              <Button onClick={() => handleSocialAuth('facebook')} disabled={socialLoading === 'facebook'} variant="outline" className="w-full bg-blue-600/20 border-blue-500/30 text-rap-silver hover:bg-blue-600/30 font-merienda ">
                {socialLoading === 'facebook' ? "Connecting..." : <>
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Continue with Facebook
                  </>}
              </Button>

              <Button onClick={() => handleSocialAuth('twitter')} disabled={socialLoading === 'twitter'} variant="outline" className="w-full bg-rap-carbon/20 border-rap-smoke/30 text-rap-silver hover:bg-rap-carbon/30 font-merienda ">
                {socialLoading === 'twitter' ? "Connecting..." : <>
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Continue with X
                  </>}
              </Button>
            </div>

            <div className="relative flex items-center">
              <div className="flex-grow border-t border-rap-smoke/50"></div>
              <span className="flex-shrink mx-4 text-rap-smoke font-merienda text-xs uppercase">
                Or continue with email
              </span>
              <div className="flex-grow border-t border-rap-smoke/50"></div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && <>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-rap-platinum font-kaushan">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rap-smoke w-4 h-4" />
                      <Input id="username" type="text" placeholder="Enter your username" value={username} onChange={e => setUsername(e.target.value)} required={!isLogin} className="pl-10 bg-rap-carbon/50 border-rap-burgundy/30 text-rap-silver placeholder-rap-smoke focus:border-rap-burgundy font-kaushan" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-rap-platinum font-kaushan">Full Name</Label>
                    <div className="relative font-merienda text-rap-gold">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rap-smoke w-4 h-4" />
                      <Input id="fullName" type="text" placeholder="Enter your full name" value={fullName} onChange={e => setFullName(e.target.value)} className="pl-10 bg-rap-carbon/50 border-rap-burgundy/30 text-rap-silver placeholder-rap-smoke focus:border-rap-burgundy font-kaushan" />
                    </div>
                  </div>
                </>}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-rap-platinum font-kaushan">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rap-smoke w-4 h-4" />
                  <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required className="pl-10 bg-rap-carbon/50 border-rap-burgundy/30 text-rap-silver placeholder-rap-smoke focus:border-rap-burgundy font-merienda " />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-rap-platinum font-kaushan">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rap-smoke w-4 h-4" />
                  <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required className="pl-10 bg-rap-carbon/50 border-rap-burgundy/30 text-rap-silver placeholder-rap-smoke focus:border-rap-burgundy font-merienda " />
                </div>
              </div>
              
              <Button type="submit" disabled={loading} className="w-full font-merienda bg-rap-gold text-black font-extrabold text-2xl">
                {loading ? "Processing..." : isLogin ? "Sign In" : "Join the Hierarchy"}
              </Button>
            </form>
            
            <div className="text-center space-y-3">
              <button onClick={() => setIsLogin(!isLogin)} className="text-rap-silver hover:text-rap-platinum transition-colors font-kaushan">
                {isLogin ? "New to the game? Join the culture" : "Already in the crew? Sign in"}
              </button>
              
              <div className="text-xs text-rap-smoke font-kaushan">
                <button onClick={() => window.location.href = '/about'} className="hover:text-rap-silver transition-colors">
                  Learn more about Spit Hierarchy
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
