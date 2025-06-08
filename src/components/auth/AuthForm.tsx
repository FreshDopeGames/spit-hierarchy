
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock } from "lucide-react";

interface AuthFormProps {
  isLogin: boolean;
  email: string;
  password: string;
  username: string;
  fullName: string;
  loading: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onUsernameChange: (username: string) => void;
  onFullNameChange: (fullName: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const AuthForm = ({
  isLogin,
  email,
  password,
  username,
  fullName,
  loading,
  onEmailChange,
  onPasswordChange,
  onUsernameChange,
  onFullNameChange,
  onSubmit
}: AuthFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {!isLogin && (
        <>
          <div className="space-y-2">
            <Label htmlFor="username" className="text-rap-platinum font-kaushan">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rap-smoke w-4 h-4" />
              <Input 
                id="username" 
                type="text" 
                placeholder="Enter your username" 
                value={username} 
                onChange={(e) => onUsernameChange(e.target.value)} 
                required={!isLogin} 
                className="pl-10 bg-rap-carbon/50 border-rap-burgundy/30 text-rap-silver placeholder-rap-smoke focus:border-rap-burgundy font-kaushan" 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-rap-platinum font-kaushan">Full Name</Label>
            <div className="relative font-merienda text-rap-gold">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rap-smoke w-4 h-4" />
              <Input 
                id="fullName" 
                type="text" 
                placeholder="Enter your full name" 
                value={fullName} 
                onChange={(e) => onFullNameChange(e.target.value)} 
                className="pl-10 bg-rap-carbon/50 border-rap-burgundy/30 text-rap-silver placeholder-rap-smoke focus:border-rap-burgundy font-kaushan" 
              />
            </div>
          </div>
        </>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-rap-platinum font-kaushan">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rap-smoke w-4 h-4" />
          <Input 
            id="email" 
            type="email" 
            placeholder="Enter your email" 
            value={email} 
            onChange={(e) => onEmailChange(e.target.value)} 
            required 
            className="pl-10 bg-rap-carbon/50 border-rap-burgundy/30 text-rap-silver placeholder-rap-smoke focus:border-rap-burgundy font-merienda" 
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-rap-platinum font-kaushan">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rap-smoke w-4 h-4" />
          <Input 
            id="password" 
            type="password" 
            placeholder="Enter your password" 
            value={password} 
            onChange={(e) => onPasswordChange(e.target.value)} 
            required 
            className="pl-10 bg-rap-carbon/50 border-rap-burgundy/30 text-rap-silver placeholder-rap-smoke focus:border-rap-burgundy font-merienda" 
          />
        </div>
      </div>
      
      <Button type="submit" disabled={loading} className="w-full font-merienda bg-rap-gold text-black font-extrabold text-2xl">
        {loading ? "Processing..." : isLogin ? "Sign In" : "Join the Hierarchy"}
      </Button>
    </form>
  );
};

export default AuthForm;
