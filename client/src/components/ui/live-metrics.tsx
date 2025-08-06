import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Server,
  Users,
  Clock
} from "lucide-react";

interface SystemMetrics {
  health: {
    score: number;
    status: string;
  };
  performance: {
    apiResponseTime: number;
    memoryUsage: number;
    throughput: number;
    errorRate: number;
  };
  business: {
    userEngagement: number;
    conversionRate: number;
    activeUsers: number;
  };
}

export function LiveMetrics() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/xm/status');
        const data = await response.json();
        
        if (data.success) {
          setMetrics({
            health: data.data.health,
            performance: {
              apiResponseTime: data.data.metrics.system.apiResponseTime,
              memoryUsage: data.data.metrics.system.memoryUsage,
              throughput: data.data.metrics.system.throughput,
              errorRate: data.data.metrics.system.errorRate
            },
            business: {
              userEngagement: data.data.metrics.business?.userEngagement || 0,
              conversionRate: data.data.metrics.business?.conversionRate || 0,
              activeUsers: data.data.metrics.business?.activeUsers || 0
            }
          });
          setLastUpdate(new Date());
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchMetrics();

    // Update every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);

    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getHealthIcon = (score: number) => {
    if (score >= 90) return CheckCircle;
    if (score >= 70) return AlertTriangle;
    return AlertTriangle;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-sm text-muted-foreground">Loading system metrics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Server className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Unable to load metrics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const HealthIcon = getHealthIcon(metrics.health.score);

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getHealthColor(metrics.health.score)}`}>
              <HealthIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">System Health</h3>
              <p className="text-xs text-muted-foreground">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={`${getHealthColor(metrics.health.score)} border-current`}
          >
            {metrics.health.score}/100
          </Badge>
        </div>

        <div className="space-y-4">
          {/* Health Score Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Overall Health</span>
              <span className="font-medium">{metrics.health.status}</span>
            </div>
            <Progress value={metrics.health.score} className="h-2" />
          </div>

          {/* Performance Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Zap className="h-4 w-4 text-blue-600 mr-1" />
                <span className="text-xs font-medium text-gray-600">Response</span>
              </div>
              <p className="text-lg font-bold text-foreground">{metrics.performance.apiResponseTime}ms</p>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Server className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-xs font-medium text-gray-600">Memory</span>
              </div>
              <p className="text-lg font-bold text-foreground">{metrics.performance.memoryUsage}MB</p>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="h-4 w-4 text-purple-600 mr-1" />
                <span className="text-xs font-medium text-gray-600">Throughput</span>
              </div>
              <p className="text-lg font-bold text-foreground">{Math.round(metrics.performance.throughput)}/min</p>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Users className="h-4 w-4 text-orange-600 mr-1" />
                <span className="text-xs font-medium text-gray-600">Engagement</span>
              </div>
              <p className="text-lg font-bold text-foreground">{Math.round(metrics.business.userEngagement * 100)}%</p>
            </div>
          </div>

          {/* Quick Status Indicators */}
          <div className="flex justify-between text-xs">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${metrics.performance.errorRate < 0.01 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-muted-foreground">
                Errors: {(metrics.performance.errorRate * 100).toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Activity className="h-3 w-3 text-blue-500" />
              <span className="text-muted-foreground">Live monitoring active</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}