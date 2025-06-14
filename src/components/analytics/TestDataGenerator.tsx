
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Loader2 } from "lucide-react";
import { generateTestVotes, generateTestUserRankings } from "@/utils/generateTestData";
import { useToast } from "@/hooks/use-toast";

const TestDataGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateVotes = async () => {
    setIsGenerating(true);
    try {
      const inserted = await generateTestVotes(2000);
      toast({
        title: "Test votes generated!",
        description: `Successfully created ${inserted} test votes.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate test votes.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateRankings = async () => {
    setIsGenerating(true);
    try {
      const created = await generateTestUserRankings(30);
      toast({
        title: "Test rankings generated!",
        description: `Successfully created ${created} test user rankings.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate test rankings.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="bg-carbon-fiber/90 border-rap-gold/30 shadow-lg shadow-rap-gold/20 mb-6">
      <CardHeader>
        <CardTitle className="text-rap-gold font-mogra flex items-center gap-2">
          <Database className="w-5 h-5" />
          Test Data Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={handleGenerateVotes}
            disabled={isGenerating}
            className="bg-rap-gold hover:bg-rap-gold-light text-rap-carbon font-mogra"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Test Votes"
            )}
          </Button>
          
          <Button
            onClick={handleGenerateRankings}
            disabled={isGenerating}
            className="bg-rap-forest hover:bg-rap-forest-light text-rap-platinum font-mogra"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Test Rankings"
            )}
          </Button>
        </div>
        <p className="text-rap-smoke text-sm mt-4">
          Use these buttons to generate test data for development and testing purposes.
        </p>
      </CardContent>
    </Card>
  );
};

export default TestDataGenerator;
