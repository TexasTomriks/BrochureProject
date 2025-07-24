import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Eye } from "lucide-react";

export default function Statistics() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery<{
    totalCampaigns: number;
    activeCampaigns: number;
    totalTemplates: number;
    totalDownloads: number;
  }>({
    queryKey: ["/api/statistics", user?.id],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
          <p className="text-gray-600 mt-2">Track your campaign performance</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const mockEngagementData = [
    { platform: "Email", views: 1250, clicks: 89 },
    { platform: "Social Media", views: 2340, clicks: 156 },
    { platform: "Direct Link", views: 890, clicks: 67 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
        <p className="text-gray-600 mt-2">Track your campaign performance and analytics</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalCampaigns || 0}</p>
                <p className="text-xs text-green-600 mt-1">↗ +12% this month</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">4,580</p>
                <p className="text-xs text-green-600 mt-1">↗ +24% this month</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Engagement Rate</p>
                <p className="text-2xl font-bold text-gray-900">6.8%</p>
                <p className="text-xs text-green-600 mt-1">↗ +3.2% this month</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Downloads</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalDownloads || 0}</p>
                <p className="text-xs text-green-600 mt-1">↗ +18% this month</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Breakdown */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Engagement by Platform</h2>
        </div>
        <CardContent className="p-6">
          <div className="space-y-4">
            {mockEngagementData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">{item.platform}</h3>
                  <p className="text-sm text-gray-600">{item.views} views • {item.clicks} clicks</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {((item.clicks / item.views) * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">CTR</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon */}
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
          <p className="text-gray-600">
            Detailed analytics including conversion tracking, A/B testing results, and more insights coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
