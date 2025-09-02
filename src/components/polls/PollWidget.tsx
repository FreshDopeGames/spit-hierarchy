import { useState } from "react";
import { ThemedCard, ThemedCardContent, ThemedCardDescription, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";
import { ThemedButton } from "@/components/ui/themed-button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ThemedProgress } from "@/components/ui/themed-progress";
import { Input } from "@/components/ui/input";
import { Plus, Lock } from "lucide-react";
import { usePollVoting } from "@/hooks/usePollVoting";
import { usePollResults, useUserPollVotes } from "@/hooks/usePollResults";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import GuestCallToAction from "@/components/GuestCallToAction";

interface PollOption {
  id: string;
  option_text: string;
  option_order: number;
}

interface Poll {
  id: string;
  title: string;
  description?: string;
  type: 'single_choice' | 'multiple_choice';
  allow_write_in?: boolean;
  poll_options: PollOption[];
}

interface PollWidgetProps {
  poll: Poll;
  showResults?: boolean;
}

const PollWidget = ({ poll, showResults = false }: PollWidgetProps) => {
  const { user } = useSecureAuth();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [writeInOption, setWriteInOption] = useState("");
  
  const { submitVote, isSubmitting } = usePollVoting();
  const { data: results } = usePollResults(poll.id);
  const { data: userVotes } = useUserPollVotes(poll.id);

  const userHasVoted = userVotes && userVotes.length > 0;
  const shouldShowResults = showResults || hasVoted || userHasVoted;
  const hasResults = results && results.results.length > 0 && results.totalVotes > 0;

  const handleSingleChoice = (optionId: string) => {
    setSelectedOptions([optionId]);
    if (optionId !== 'write-in') {
      setWriteInOption('');
    }
  };

  const handleMultipleChoice = (optionId: string, checked: boolean) => {
    if (checked) {
      setSelectedOptions(prev => [...prev, optionId]);
    } else {
      setSelectedOptions(prev => prev.filter(id => id !== optionId));
      if (optionId === 'write-in') {
        setWriteInOption('');
      }
    }
  };

  const handleSubmit = async () => {
    if (selectedOptions.length === 0 && !writeInOption.trim()) return;
    
    try {
      const finalOptionIds = selectedOptions.filter(id => id !== 'write-in');
      const finalWriteIn = selectedOptions.includes('write-in') ? writeInOption.trim() : undefined;
      
      await submitVote({
        pollId: poll.id,
        optionIds: finalOptionIds,
        writeInOption: finalWriteIn || undefined
      });
      setHasVoted(true);
    } catch (error) {
      // Error handled in the hook
    }
  };

  const sortedOptions = [...poll.poll_options].sort((a, b) => a.option_order - b.option_order);

  return (
    <ThemedCard variant="primary">
      <ThemedCardHeader>
        <ThemedCardTitle className="text-2xl font-bold text-black">{poll.title}</ThemedCardTitle>
        {poll.description && (
          <ThemedCardDescription className="font-bold text-black">{poll.description}</ThemedCardDescription>
        )}
      </ThemedCardHeader>
      <ThemedCardContent>
        {!user ? (
          // Non-authenticated users
          hasResults ? (
            // Show results if available
            <div className="space-y-4">
              {results?.results.map((result) => (
                <div key={result.optionId} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-black">{result.optionText}</span>
                    <span className="text-sm font-bold text-black">
                      {result.voteCount} votes ({result.percentage}%)
                    </span>
                  </div>
                  <ThemedProgress value={result.percentage} className="h-2" />
                </div>
              ))}
              
              <p className="text-sm font-bold text-black text-center mt-4">
                Total votes: {results?.totalVotes}
              </p>
            </div>
          ) : (
            // No results available - show locked state
            <div className="text-center py-8 space-y-4">
              <Lock className="h-12 w-12 text-black mx-auto" />
              <h3 className="text-lg font-bold text-black">Members Only</h3>
              <p className="font-bold text-black">
                Sign up to participate in this poll and see results
              </p>
              <GuestCallToAction />
            </div>
          )
        ) : shouldShowResults ? (
          // Authenticated users - show results
          <div className="space-y-4">
            {results?.results.map((result) => {
              const isUserChoice = userVotes?.some(vote => vote.optionId === result.optionId);
              
              return (
                <div key={result.optionId} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-bold flex items-center gap-2 text-black ${isUserChoice ? 'text-black' : ''}`}>
                      {result.optionText}
                      {isUserChoice && (
                        <span className="text-xs bg-[var(--theme-background)]/20 text-black px-2 py-1 rounded font-bold">
                          Your choice
                        </span>
                      )}
                    </span>
                    <span className="text-sm font-bold text-black">
                      {result.voteCount} votes ({result.percentage}%)
                    </span>
                  </div>
                  <ThemedProgress value={result.percentage} className="h-2" />
                </div>
              );
            })}
            
            <p className="text-sm font-bold text-black text-center mt-4">
              Total votes: {results?.totalVotes || 0}
            </p>
          </div>
        ) : (
          // Authenticated users - voting interface
          <div className="space-y-4">
            {poll.type === 'single_choice' ? (
              <RadioGroup value={selectedOptions[0] || ""} onValueChange={handleSingleChoice}>
                {sortedOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="flex-1 font-bold text-black">
                      {option.option_text}
                    </Label>
                  </div>
                ))}
                {poll.allow_write_in && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="write-in" id="write-in" />
                      <Label htmlFor="write-in" className="cursor-pointer font-bold text-black">
                        Other
                      </Label>
                    </div>
                    {selectedOptions.includes('write-in') && (
                      <Input
                        value={writeInOption}
                        onChange={(e) => setWriteInOption(e.target.value)}
                        placeholder="Other"
                        className="ml-6"
                        maxLength={100}
                      />
                    )}
                  </div>
                )}
              </RadioGroup>
            ) : (
              <div className="space-y-3">
                {sortedOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={selectedOptions.includes(option.id)}
                      onCheckedChange={(checked) => 
                        handleMultipleChoice(option.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={option.id} className="flex-1 font-bold text-black">
                      {option.option_text}
                    </Label>
                  </div>
                ))}
                {poll.allow_write_in && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="write-in-multiple"
                        checked={selectedOptions.includes('write-in')}
                        onCheckedChange={(checked) => 
                          handleMultipleChoice('write-in', checked as boolean)
                        }
                      />
                      <Label htmlFor="write-in-multiple" className="cursor-pointer font-bold text-black">
                        Other
                      </Label>
                    </div>
                    {selectedOptions.includes('write-in') && (
                      <Input
                        value={writeInOption}
                        onChange={(e) => setWriteInOption(e.target.value)}
                        placeholder="Other"
                        className="ml-6"
                        maxLength={100}
                      />
                    )}
                  </div>
                )}
              </div>
            )}
            
            <ThemedButton 
              onClick={handleSubmit} 
              disabled={
                (selectedOptions.length === 0) || 
                (selectedOptions.includes('write-in') && !writeInOption.trim()) || 
                isSubmitting
              }
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold border-black border"
              variant="accent"
            >
              {isSubmitting ? "Submitting..." : "Vote"}
            </ThemedButton>
          </div>
        )}
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default PollWidget;