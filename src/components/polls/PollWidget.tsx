import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
  const [showWriteIn, setShowWriteIn] = useState(false);
  
  const { submitVote, isSubmitting } = usePollVoting();
  const { data: results } = usePollResults(poll.id);
  const { data: userVotes } = useUserPollVotes(poll.id);

  const userHasVoted = userVotes && userVotes.length > 0;
  const shouldShowResults = showResults || hasVoted || userHasVoted;
  const hasResults = results && results.results.length > 0 && results.totalVotes > 0;

  const handleSingleChoice = (optionId: string) => {
    setSelectedOptions([optionId]);
  };

  const handleMultipleChoice = (optionId: string, checked: boolean) => {
    if (checked) {
      setSelectedOptions(prev => [...prev, optionId]);
    } else {
      setSelectedOptions(prev => prev.filter(id => id !== optionId));
    }
  };

  const handleSubmit = async () => {
    if (selectedOptions.length === 0 && !writeInOption.trim()) return;
    
    try {
      await submitVote({
        pollId: poll.id,
        optionIds: selectedOptions,
        writeInOption: writeInOption.trim() || undefined
      });
      setHasVoted(true);
    } catch (error) {
      // Error handled in the hook
    }
  };

  const sortedOptions = [...poll.poll_options].sort((a, b) => a.option_order - b.option_order);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{poll.title}</CardTitle>
        {poll.description && (
          <CardDescription>{poll.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {!user ? (
          // Non-authenticated users
          hasResults ? (
            // Show results if available
            <div className="space-y-4">
              {results?.results.map((result) => (
                <div key={result.optionId} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{result.optionText}</span>
                    <span className="text-sm text-muted-foreground">
                      {result.voteCount} votes ({result.percentage}%)
                    </span>
                  </div>
                  <Progress value={result.percentage} className="h-2" />
                </div>
              ))}
              
              <p className="text-sm text-muted-foreground text-center mt-4">
                Total votes: {results?.totalVotes}
              </p>
            </div>
          ) : (
            // No results available - show locked state
            <div className="text-center py-8 space-y-4">
              <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-semibold">Members Only</h3>
              <p className="text-muted-foreground">
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
                    <span className={`text-sm font-medium flex items-center gap-2 ${isUserChoice ? 'text-primary' : ''}`}>
                      {result.optionText}
                      {isUserChoice && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          Your choice
                        </span>
                      )}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {result.voteCount} votes ({result.percentage}%)
                    </span>
                  </div>
                  <Progress value={result.percentage} className="h-2" />
                </div>
              );
            })}
            
            <p className="text-sm text-muted-foreground text-center mt-4">
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
                    <Label htmlFor={option.id} className="flex-1">
                      {option.option_text}
                    </Label>
                  </div>
                ))}
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
                    <Label htmlFor={option.id} className="flex-1">
                      {option.option_text}
                    </Label>
                  </div>
                ))}
              </div>
            )}
            
            {poll.allow_write_in && (
              <div className="space-y-2">
                {!showWriteIn ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowWriteIn(true)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add your own option
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Input
                      placeholder="Enter your option..."
                      value={writeInOption}
                      onChange={(e) => setWriteInOption(e.target.value)}
                      maxLength={100}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowWriteIn(false);
                          setWriteInOption("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <Button 
              onClick={handleSubmit} 
              disabled={(selectedOptions.length === 0 && !writeInOption.trim()) || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Submitting..." : "Vote"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PollWidget;