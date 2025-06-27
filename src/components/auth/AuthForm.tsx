
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, AlertCircle } from "lucide-react";
import { useState } from "react";
import { validatePassword, validateEmail, validateUsername, sanitizeInput } from "@/utils/securityUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const handleEmailChange = (value: string) => {
    const sanitized = sanitizeInput(value);
    onEmailChange(sanitized);
    
    if (sanitized && !validateEmail(sanitized)) {
      setValidationErrors(['Please enter a valid email address']);
    } else {
      setValidationErrors([]);
    }
  };

  const handlePasswordChange = (value: string) => {
    onPasswordChange(value);
    
    if (!isLogin && value) {
      const validation = validatePassword(value);
      setValidationErrors(validation.errors);
    } else {
      setValidationErrors([]);
    }
  };

  const handleUsernameChange = (value: string) => {
    const sanitized = sanitizeInput(value);
    onUsernameChange(sanitized);
    
    if (sanitized) {
      const validation = validateUsername(sanitized);
      setValidationErrors(validation.errors);
    } else {
      setValidationErrors([]);
    }
  };

  const handleFullNameChange = (value: string) => {
    const sanitized = sanitizeInput(value);
    onFullNameChange(sanitized);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation before submit
    const errors: string[] = [];
    
    if (!validateEmail(email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (!isLogin) {
      const passwordValidation = validatePassword(password);
      const usernameValidation = validateUsername(username);
      
      errors.push(...passwordValidation.errors);
      errors.push(...usernameValidation.errors);
    }
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setValidationErrors([]);
    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {validationErrors.length > 0 && (
        <Alert className="border-red-500 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {!isLogin && (
        <>
          <div className="space-y-2">
            <Label htmlFor="username" className="text-rap-platinum font-kaushan">Username *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rap-smoke w-4 h-4" />
              <Input 
                id="username" 
                type="text" 
                placeholder="Enter your username (3-30 characters)" 
                value={username} 
                onChange={(e) => handleUsernameChange(e.target.value)} 
                required={!isLogin} 
                maxLength={30}
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
                onChange={(e) => handleFullNameChange(e.target.value)} 
                maxLength={100}
                className="pl-10 bg-rap-carbon/50 border-rap-burgundy/30 text-rap-silver placeholder-rap-smoke focus:border-rap-burgundy font-kaushan" 
              />
            </div>
          </div>
        </>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-rap-platinum font-kaushan">Email *</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rap-smoke w-4 h-4" />
          <Input 
            id="email" 
            type="email" 
            placeholder="Enter your email" 
            value={email} 
            onChange={(e) => handleEmailChange(e.target.value)} 
            required 
            maxLength={254}
            className="pl-10 bg-rap-carbon/50 border-rap-burgundy/30 text-rap-silver placeholder-rap-smoke focus:border-rap-burgundy font-merienda" 
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-rap-platinum font-kaushan">Password *</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rap-smoke w-4 h-4" />
          <Input 
            id="password" 
            type="password" 
            placeholder={isLogin ? "Enter your password" : "Enter a strong password"} 
            value={password} 
            onChange={(e) => handlePasswordChange(e.target.value)} 
            onFocus={() => !isLogin && setShowPasswordRequirements(true)}
            onBlur={() => setShowPasswordRequirements(false)}
            required 
            maxLength={128}
            className="pl-10 bg-rap-carbon/50 border-rap-burgundy/30 text-rap-silver placeholder-rap-smoke focus:border-rap-burgundy font-merienda" 
          />
        </div>
        
        {!isLogin && showPasswordRequirements && (
          <div className="text-xs text-rap-smoke bg-rap-carbon/30 p-3 rounded border border-rap-burgundy/20">
            <p className="font-semibold mb-2">Password Requirements:</p>
            <ul className="space-y-1">
              <li>• At least 8 characters long</li>
              <li>• Contains uppercase and lowercase letters</li>
              <li>• Contains at least one number</li>
              <li>• Contains at least one special character</li>
              <li>• Avoid common passwords</li>
            </ul>
          </div>
        )}
      </div>
      
      <Button 
        type="submit" 
        disabled={loading || validationErrors.length > 0} 
        className="w-full font-merienda bg-rap-gold text-black font-extrabold text-2xl disabled:opacity-50"
      >
        {loading ? "Processing..." : isLogin ? "Sign In" : "Join the Hierarchy"}
      </Button>
    </form>
  );
};

export default AuthForm;

