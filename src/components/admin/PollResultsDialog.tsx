import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemedProgress } from "@/components/ui/themed-progress";
import { usePollAdminResults } from "@/hooks/usePollAdminResults";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, Vote, TrendingUp, Trophy, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface PollResultsDialogProps {
  pollId: string | null;
  onClose: () => void;
}

const CHART_COLORS = ['#FFD700', '#FFA500', '#FF8C00', '#FF6347', '#FF4500', '#DC143C'];

export const PollResultsDialog = ({ pollId, onClose }: PollResultsDialogProps) => {
  const { data: results, isLoading } = usePollAdminResults(pollId);

  if (!results) return null;

  const { pollDetails, results: optionResults, totalVotes, uniqueVoters, topOption, writeInResponses } = results;

  // Prepare data for charts
  const chartData = optionResults.map(option => ({
    name: option.option_text.length > 20 ? option.option_text.substring(0, 20) + '...' : option.option_text,
    fullName: option.option_text,
    votes: option.votes || 0,
    percentage: option.percentage || 0
  }));

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: "default",
      draft: "secondary",
      completed: "destructive"
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <Dialog open={!!pollId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-black border-4 border-rap-gold">
        <DialogHeader>
          <DialogTitle className="text-3xl sm:text-4xl font-mogra text-rap-gold">
            {pollDetails.title}
          </DialogTitle>
          {pollDetails.description && (
            <p className="text-sm text-rap-smoke font-kaushan mt-2">{pollDetails.description}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            {getStatusBadge(pollDetails.status)}
            <Badge variant="outline" className="border-rap-gold/50 text-rap-gold">
              {pollDetails.type === 'single_choice' ? 'Single Choice' : 'Multiple Choice'}
            </Badge>
            {pollDetails.is_featured && (
              <Badge variant="outline" className="border-rap-gold text-rap-gold">Featured</Badge>
            )}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8 text-rap-smoke">Loading results...</div>
        ) : (
          <div className="space-y-6 mt-6">
            {/* Hero Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-4 border-rap-gold/30 bg-black">
                <CardContent className="pt-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-rap-gold/70 mb-2">
                    <Vote className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-bold text-rap-platinum font-mogra">{totalVotes}</div>
                  <div className="text-xs text-rap-smoke font-kaushan">Total Votes</div>
                </CardContent>
              </Card>

              <Card className="border-4 border-rap-gold/30 bg-black">
                <CardContent className="pt-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-rap-gold/70 mb-2">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-bold text-rap-platinum font-mogra">{uniqueVoters}</div>
                  <div className="text-xs text-rap-smoke font-kaushan">Unique Voters</div>
                </CardContent>
              </Card>

              <Card className="border-4 border-rap-gold/30 bg-black">
                <CardContent className="pt-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-rap-gold/70 mb-2">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-bold text-rap-platinum font-mogra">{optionResults.length}</div>
                  <div className="text-xs text-rap-smoke font-kaushan">Options</div>
                </CardContent>
              </Card>

              <Card className="border-4 border-rap-gold/30 bg-black">
                <CardContent className="pt-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-rap-gold/70 mb-2">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div className="text-lg font-bold text-rap-platinum font-mogra truncate px-2">
                    {topOption?.votes || 0}
                  </div>
                  <div className="text-xs text-rap-smoke font-kaushan">Top Votes</div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            {totalVotes > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <Card className="border-4 border-rap-gold/30 bg-black">
                  <CardHeader>
                    <CardTitle className="text-xl font-mogra text-rap-gold">Vote Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis type="number" stroke="#9CA3AF" />
                        <YAxis dataKey="name" type="category" width={100} stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#000', 
                            border: '2px solid #FFD700',
                            borderRadius: '8px'
                          }}
                          labelStyle={{ color: '#FFD700' }}
                          formatter={(value: any, name: any, props: any) => [
                            `${value} votes (${props.payload.percentage.toFixed(1)}%)`,
                            props.payload.fullName
                          ]}
                        />
                        <Bar dataKey="votes" fill="#FFD700" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Pie Chart */}
                <Card className="border-4 border-rap-gold/30 bg-black">
                  <CardHeader>
                    <CardTitle className="text-xl font-mogra text-rap-gold">Percentage Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="votes"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#000', 
                            border: '2px solid #FFD700',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Detailed Breakdown */}
            <Card className="border-4 border-rap-gold/30 bg-black">
              <CardHeader>
                <CardTitle className="text-xl font-mogra text-rap-gold">Detailed Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {optionResults.map((option, index) => (
                  <div key={option.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-kaushan text-rap-smoke">
                          {option.option_text}
                        </span>
                        {topOption?.id === option.id && (
                          <Badge variant="outline" className="border-rap-gold text-rap-gold text-xs">
                            <Trophy className="w-3 h-3 mr-1" />
                            Top Choice
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-rap-platinum font-mogra">
                          {option.votes}
                        </span>
                        <span className="text-xs text-rap-smoke ml-2">
                          ({option.percentage?.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <ThemedProgress value={option.percentage || 0} className="h-3" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Write-in Responses */}
            {writeInResponses && writeInResponses.length > 0 && (
              <Card className="border-4 border-rap-gold/30 bg-black">
                <CardHeader>
                  <CardTitle className="text-xl font-mogra text-rap-gold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Write-in Responses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {writeInResponses.map((response, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-rap-gold/5 rounded border border-rap-gold/20">
                        <span className="text-sm font-kaushan text-rap-platinum">{response.text}</span>
                        <Badge variant="outline" className="border-rap-gold/50 text-rap-gold">
                          {response.count} {response.count === 1 ? 'vote' : 'votes'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Metadata Footer */}
            <div className="text-center text-xs text-rap-smoke font-kaushan pt-4 border-t border-rap-gold/20">
              <p>Poll created: {format(new Date(pollDetails.created_at), 'PPP')}</p>
              {pollDetails.expires_at && (
                <p>Expires: {format(new Date(pollDetails.expires_at), 'PPP')}</p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
