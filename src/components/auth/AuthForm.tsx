
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { validatePassword, validateEmail, validateUsername, sanitizeInput } from "@/utils/securityUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AuthFormProps {
  isLogin: boolean;
  email: string;
  password: string;
  username: string;
  loading: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onUsernameChange: (username: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const AuthForm = ({
  isLogin,
  email,
  password,
  username,
  loading,
  onEmailChange,
  onPasswordChange,
  onUsernameChange,
  onSubmit
}: AuthFormProps) => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touchedFields, setTouchedFields] = useState<{
    email: boolean;
    password: boolean;
    username: boolean;
  }>({
    email: false,
    password: false,
    username: false
  });

  const handleEmailChange = (value: string) => {
    const sanitized = sanitizeInput(value);
    onEmailChange(sanitized);
    
    // Clear errors when user starts typing again
    if (touchedFields.email && validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleEmailBlur = () => {
    setTouchedFields(prev => ({ ...prev, email: true }));
    
    if (email && !validateEmail(email)) {
      setValidationErrors(['Please enter a valid email address']);
    } else {
      setValidationErrors([]);
    }
  };

  const handlePasswordChange = (value: string) => {
    onPasswordChange(value);
    
    // Clear errors when user starts typing again
    if (touchedFields.password && validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handlePasswordBlur = () => {
    setShowPasswordRequirements(false);
    setTouchedFields(prev => ({ ...prev, password: true }));
    
    if (!isLogin && password) {
      const validation = validatePassword(password);
      setValidationErrors(validation.errors);
    } else {
      setValidationErrors([]);
    }
  };

  const handleUsernameChange = (value: string) => {
    const sanitized = sanitizeInput(value);
    onUsernameChange(sanitized);
    
    // Clear errors when user starts typing again
    if (touchedFields.username && validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleUsernameBlur = () => {
    setTouchedFields(prev => ({ ...prev, username: true }));
    
    if (username) {
      const validation = validateUsername(username);
      setValidationErrors(validation.errors);
    } else {
      setValidationErrors([]);
    }
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
            <Label htmlFor="username" className="text-[var(--theme-text)] font-[var(--theme-font-body)]">Username *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input 
                id="username" 
                type="text" 
                placeholder="Enter your username (3-30 characters)" 
                value={username} 
                onChange={(e) => handleUsernameChange(e.target.value)}
                onBlur={handleUsernameBlur}
                required={!isLogin} 
                maxLength={30}
                className="pl-10 bg-white border-[var(--theme-border)]/30 text-black placeholder-gray-500 focus:border-[var(--theme-secondary)] font-[var(--theme-font-body)]"
              />
            </div>
          </div>
          
        </>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-[var(--theme-text)] font-[var(--theme-font-body)]">Email *</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <Input 
            id="email" 
            type="email" 
            placeholder="Enter your email" 
            value={email} 
            onChange={(e) => handleEmailChange(e.target.value)}
            onBlur={handleEmailBlur}
            required 
            maxLength={254}
            className="pl-10 bg-white border-[var(--theme-border)]/30 text-black placeholder-gray-500 focus:border-[var(--theme-secondary)] font-[var(--theme-font-body)]" 
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-[var(--theme-text)] font-[var(--theme-font-body)]">Password *</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <Input 
            id="password" 
            type={showPassword ? "text" : "password"}
            placeholder={isLogin ? "Enter your password" : "Enter a strong password"} 
            value={password} 
            onChange={(e) => handlePasswordChange(e.target.value)} 
            onFocus={() => !isLogin && setShowPasswordRequirements(true)}
            onBlur={handlePasswordBlur}
            required 
            maxLength={128}
            className="pl-10 pr-10 bg-white border-[var(--theme-border)]/30 text-black placeholder-gray-500 focus:border-[var(--theme-secondary)] font-[var(--theme-font-body)]" 
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        
        {!isLogin && showPasswordRequirements && (
          <div className="text-xs text-[var(--theme-textMuted)] bg-[var(--theme-background)]/30 p-3 rounded border border-[var(--theme-border)]/20">
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
        className="w-full font-[var(--theme-font-body)] bg-[var(--theme-primary)] text-[var(--theme-background)] font-extrabold text-2xl disabled:opacity-50"
      >
        {loading ? "Processing..." : isLogin ? "Sign In" : "Join the Hierarchy"}
      </Button>
    </form>
  );
};

export default AuthForm;
