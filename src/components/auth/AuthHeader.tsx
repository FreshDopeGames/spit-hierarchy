
import { ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";

interface AuthHeaderProps {
  isLogin: boolean;
}

const AuthHeader = ({ isLogin }: AuthHeaderProps) => {
  return (
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
  );
};

export default AuthHeader;
