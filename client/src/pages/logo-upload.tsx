import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, Upload, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Logo } from "@shared/schema";

export default function LogoUpload() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [logoName, setLogoName] = useState("");

  const { data: logos = [], isLoading } = useQuery<Logo[]>({
    queryKey: ["/api/logos", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/logos?userId=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch logos');
      return response.json();
    },
    enabled: !!user?.id,
  });

  const { data: activeLogo } = useQuery<Logo | null>({
    queryKey: ["/api/logos/active", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await fetch(`/api/logos/active?userId=${user.id}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!user?.id,
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/logos", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/logos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/logos", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/logos/active", user?.id] });
      toast({
        title: "Logo uploaded successfully",
        description: "Your logo is now available for use in brochures.",
      });
      setSelectedFile(null);
      setLogoName("");
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your logo.",
        variant: "destructive",
      });
    },
  });

  const activateMutation = useMutation({
    mutationFn: async (logoId: number) => {
      const response = await fetch(`/api/logos/${logoId}/activate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
      if (!response.ok) {
        throw new Error("Activation failed");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/logos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/logos", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/logos/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/logos/active", user?.id] });
      toast({
        title: "Logo activated",
        description: "This logo is now your active company logo.",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!logoName) {
        setLogoName(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !logoName || !user) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("name", logoName);
    formData.append("userId", user.id.toString());

    uploadMutation.mutate(formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Company Logo Upload</h1>
        <p className="text-gray-600 mt-2">Upload and manage your company logos</p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="logo-file">Logo File</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-primary/50 transition-colors">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Upload Company Logos
                </h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop your logo files here, or click to browse
                </p>
                <input
                  id="logo-file"
                  type="file"
                  accept=".png,.jpg,.jpeg,.svg"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("logo-file")?.click()}
                >
                  Choose Files
                </Button>
                <p className="text-xs text-gray-500 mt-3">
                  Supports: PNG, JPG, SVG (Max 10MB, Transparent backgrounds recommended)
                </p>
              </div>
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="logo-name">Logo Name</Label>
              <Input
                id="logo-name"
                value={logoName}
                onChange={(e) => setLogoName(e.target.value)}
                placeholder="Enter logo name"
                className="mt-2"
              />
            </div>

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !logoName || uploadMutation.isPending}
              className="w-full"
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload Logo"}
            </Button>
          </div>
        </CardContent>
      </Card>



      {/* Logo Library */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Logo Library</h2>
        </div>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4 animate-pulse">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : logos.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No logos uploaded</h3>
              <p className="text-gray-600">Upload your first logo to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {logos.map((logo: Logo) => (
                <div
                  key={logo.id}
                  className="border border-gray-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 overflow-hidden">
                    <img 
                      src={logo.filePath ? `/uploads/${logo.filePath.split('/').pop()}` : ''}
                      alt={logo.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.removeAttribute('style');
                      }}
                    />
                    <Building className="w-8 h-8 text-primary" style={{display: 'none'}} />
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{logo.name}</p>
                  <div className="flex justify-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary text-xs p-1"
                      onClick={() => activateMutation.mutate(logo.id)}
                      disabled={activateMutation.isPending}
                    >
                      {logo.isActive ? "Active" : "Use"}
                    </Button>
                    <span className="text-gray-300">•</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 text-xs p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
