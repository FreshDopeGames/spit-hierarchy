import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { usePollVoting } from "@/hooks/usePollVoting";
import { usePollResults, useUserPollVotes } from "@/hooks/usePollResults";
import { useSecureAuth } from "@/hooks/useSecureAuth";

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
  
  const { submitVote, isSubmitting } = usePollVoting();
  const { data: results } = usePollResults(poll.id);
  const { data: userVotes } = useUserPollVotes(poll.id);

  const userHasVoted = userVotes && userVotes.length > 0;
  const shouldShowResults = showResults || hasVoted || userHasVoted;

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
    if (selectedOptions.length === 0) return;
    
    try {
      await submitVote({
        pollId: poll.id,
        optionIds: selectedOptions
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
      <CardContent className="space-y-4">
        {shouldShowResults ? (
          <div className="space-y-3">
            {sortedOptions.map((option) => {
              const result = results?.results.find(r => r.optionId === option.id);
              const isUserChoice = userVotes?.some(vote => vote.optionId === option.id);
              
              return (
                <div key={option.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isUserChoice ? 'font-semibold text-primary' : ''}`}>
                      {option.option_text}
                      {isUserChoice && ' ✓'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {result?.voteCount || 0} votes ({result?.percentage || 0}%)
                    </span>
                  </div>
                  <Progress value={result?.percentage || 0} className="h-2" />
                </div>
              );
            })}
            <p className="text-sm text-muted-foreground text-center mt-4">
              Total votes: {results?.totalVotes || 0}
            </p>
          </div>
        ) : (
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
            
            <Button
              onClick={handleSubmit}
              disabled={selectedOptions.length === 0 || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Submitting..." : "Vote"}
            </Button>
            
            {!user && (
              <p className="text-xs text-muted-foreground text-center">
                Sign in to save your vote permanently
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PollWidget;