
interface AuthToggleProps {
  isLogin: boolean;
  onToggle: () => void;
}

const AuthToggle = ({ isLogin, onToggle }: AuthToggleProps) => {
  return (
    <div className="text-center space-y-3">
      <button 
        onClick={onToggle} 
        className="text-rap-silver hover:text-rap-platinum transition-colors font-kaushan"
      >
        {isLogin ? "New to the game? Join the culture" : "Already in the crew? Sign in"}
      </button>
      
      <div className="text-xs text-rap-smoke font-kaushan">
        <button 
          onClick={() => window.location.href = '/about'} 
          className="hover:text-rap-silver transition-colors"
        >
          Learn more about Spit Hierarchy
        </button>
      </div>
    </div>
  );
};

export default AuthToggle;
