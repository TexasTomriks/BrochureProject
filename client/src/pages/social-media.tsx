import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function SocialMedia() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Social Media</h1>
        <p className="text-gray-600 mt-2">Share your campaigns across social platforms</p>
      </div>

      {/* Coming Soon */}
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Share2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Social Media Integration</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Connect your social media accounts to share campaigns directly from the platform.
            This feature is coming soon!
          </p>
          
          <div className="flex justify-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Facebook className="w-6 h-6 text-blue-600" />
            </div>
            <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
              <Twitter className="w-6 h-6 text-sky-600" />
            </div>
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <Instagram className="w-6 h-6 text-pink-600" />
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Linkedin className="w-6 h-6 text-blue-700" />
            </div>
          </div>
          
          <Button disabled>
            Coming Soon
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
