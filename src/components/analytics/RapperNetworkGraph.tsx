
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, Users, Star, TrendingUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface NetworkNode {
  id: string;
  name: string;
  totalVotes: number;
  averageRating: number;
  x?: number;
  y?: number;
  connections: string[];
}

interface NetworkEdge {
  source: string;
  target: string;
  strength: number;
}

const RapperNetworkGraph = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);

  const { data: networkData, isLoading } = useQuery({
    queryKey: ["rapper-network"],
    queryFn: async () => {
      // Get voting patterns - users who vote on similar rappers
      const { data: votes, error: votesError } = await supabase
        .from("votes")
        .select(`
          user_id,
          rapper_id,
          rating,
          rappers!inner(id, name, total_votes, average_rating)
        `)
        .order("rating", { ascending: false });

      if (votesError) throw votesError;

      // Group votes by user to find voting patterns
      const userVotes: { [userId: string]: { [rapperId: string]: number } } = {};
      const rapperData: { [rapperId: string]: NetworkNode } = {};

      votes?.forEach((vote: any) => {
        if (!userVotes[vote.user_id]) {
          userVotes[vote.user_id] = {};
        }
        userVotes[vote.user_id][vote.rapper_id] = vote.rating;

        if (!rapperData[vote.rapper_id]) {
          rapperData[vote.rapper_id] = {
            id: vote.rapper_id,
            name: vote.rappers.name,
            totalVotes: vote.rappers.total_votes || 0,
            averageRating: vote.rappers.average_rating || 0,
            connections: []
          };
        }
      });

      // Calculate rapper relationships based on shared voters
      const edges: NetworkEdge[] = [];
      const rapperIds = Object.keys(rapperData);

      for (let i = 0; i < rapperIds.length; i++) {
        for (let j = i + 1; j < rapperIds.length; j++) {
          const rapper1 = rapperIds[i];
          const rapper2 = rapperIds[j];
          
          // Find users who voted on both rappers
          let sharedVoters = 0;
          let ratingCorrelation = 0;
          let validComparisons = 0;

          Object.keys(userVotes).forEach(userId => {
            if (userVotes[userId][rapper1] && userVotes[userId][rapper2]) {
              sharedVoters++;
              // Calculate rating similarity (inverse of difference)
              const ratingDiff = Math.abs(userVotes[userId][rapper1] - userVotes[userId][rapper2]);
              ratingCorrelation += (5 - ratingDiff); // 5 is max rating difference
              validComparisons++;
            }
          });

          if (sharedVoters >= 3) { // Minimum threshold for meaningful connection
            const avgCorrelation = validComparisons > 0 ? ratingCorrelation / validComparisons : 0;
            const strength = (sharedVoters * avgCorrelation) / 100; // Normalize

            if (strength > 0.1) { // Only include meaningful connections
              edges.push({
                source: rapper1,
                target: rapper2,
                strength
              });
              
              rapperData[rapper1].connections.push(rapper2);
              rapperData[rapper2].connections.push(rapper1);
            }
          }
        }
      }

      return {
        nodes: Object.values(rapperData),
        edges
      };
    }
  });

  // Simple force-directed layout simulation
  useEffect(() => {
    if (!networkData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Initialize node positions randomly
    const nodes = networkData.nodes.map(node => ({
      ...node,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0
    }));

    // Simple physics simulation
    const simulate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw edges
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 1;
      networkData.edges.forEach(edge => {
        const source = nodes.find(n => n.id === edge.source);
        const target = nodes.find(n => n.id === edge.target);
        if (source && target) {
          ctx.globalAlpha = edge.strength * 2; // Make stronger connections more visible
          ctx.beginPath();
          ctx.moveTo(source.x || 0, source.y || 0);
          ctx.lineTo(target.x || 0, target.y || 0);
          ctx.stroke();
        }
      });

      // Draw nodes
      nodes.forEach(node => {
        ctx.globalAlpha = 1;
        const radius = Math.max(5, Math.min(15, (node.totalVotes || 0) / 10));
        
        // Node color based on average rating
        const rating = node.averageRating || 0;
        if (rating >= 4) {
          ctx.fillStyle = '#10b981'; // Green for high rated
        } else if (rating >= 3) {
          ctx.fillStyle = '#f59e0b'; // Yellow for medium rated
        } else {
          ctx.fillStyle = '#6b7280'; // Gray for low rated
        }

        if (hoveredNode?.id === node.id) {
          ctx.fillStyle = '#ec4899'; // Pink for hovered
        }

        ctx.beginPath();
        ctx.arc(node.x || 0, node.y || 0, radius, 0, 2 * Math.PI);
        ctx.fill();

        // Draw node labels for popular rappers
        if ((node.totalVotes || 0) > 20) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(node.name, node.x || 0, (node.y || 0) + 20);
        }
      });
    };

    // Handle mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const hoveredNode = nodes.find(node => {
        const distance = Math.sqrt(
          Math.pow((node.x || 0) - mouseX, 2) + Math.pow((node.y || 0) - mouseY, 2)
        );
        return distance < 20;
      });

      setHoveredNode(hoveredNode || null);
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const clickedNode = nodes.find(node => {
        const distance = Math.sqrt(
          Math.pow((node.x || 0) - mouseX, 2) + Math.pow((node.y || 0) - mouseY, 2)
        );
        return distance < 20;
      });

      setSelectedNode(clickedNode || null);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    const animationFrame = setInterval(simulate, 100);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      clearInterval(animationFrame);
    };
  }, [networkData, hoveredNode]);

  if (isLoading) {
    return (
      <Card className="bg-black/40 border-purple-500/20 animate-pulse">
        <CardContent className="p-6">
          <div className="h-96 bg-gray-700 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Network Graph */}
      <Card className="lg:col-span-2 bg-black/40 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Network className="w-5 h-5" />
            Rapper Network Graph
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Connections based on shared voting patterns. Node size = total votes, color = average rating
          </p>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              className="w-full border border-purple-500/20 rounded-lg cursor-pointer"
              style={{ maxHeight: '400px' }}
            />
            <div className="absolute top-2 right-2 text-xs text-gray-400 bg-black/60 p-2 rounded">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>High rated (4.0+)</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Medium rated (3.0-3.9)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span>Lower rated (&lt;3.0)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Node Details Panel */}
      <Card className="bg-black/40 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            {selectedNode ? 'Rapper Details' : hoveredNode ? 'Hovered Rapper' : 'Network Insights'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(selectedNode || hoveredNode) ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-bold text-lg">
                  {(selectedNode || hoveredNode)?.name}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="bg-blue-600/20 text-blue-300">
                    <Star className="w-3 h-3 mr-1" />
                    {Number((selectedNode || hoveredNode)?.averageRating || 0).toFixed(1)}
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                    {(selectedNode || hoveredNode)?.totalVotes} votes
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="text-gray-300 font-medium mb-2">Connected Artists</h4>
                <p className="text-gray-400 text-sm">
                  {(selectedNode || hoveredNode)?.connections.length || 0} connections
                </p>
                {networkData && (selectedNode || hoveredNode)?.connections.slice(0, 5).map(connId => {
                  const connRapper = networkData.nodes.find(n => n.id === connId);
                  return connRapper ? (
                    <div key={connId} className="text-gray-300 text-sm py-1">
                      • {connRapper.name}
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">
                  Click or hover on nodes to explore rapper connections
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="text-gray-300 text-sm">
                  <strong>Total Rappers:</strong> {networkData?.nodes.length || 0}
                </div>
                <div className="text-gray-300 text-sm">
                  <strong>Connections:</strong> {networkData?.edges.length || 0}
                </div>
                <div className="text-gray-300 text-sm">
                  <strong>Network Density:</strong> {
                    networkData?.nodes.length && networkData?.edges.length 
                      ? ((networkData.edges.length * 2) / (networkData.nodes.length * (networkData.nodes.length - 1)) * 100).toFixed(1)
                      : 0
                  }%
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RapperNetworkGraph;
