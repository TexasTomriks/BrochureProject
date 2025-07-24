import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CloudUpload, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Template } from "@shared/schema";

export default function TemplateUpload() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");

  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/templates?userId=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    },
    enabled: !!user?.id,
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/templates", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/templates", user?.id] });
      toast({
        title: "Template uploaded successfully",
        description: "Your template is now available for use in campaigns.",
      });
      setSelectedFile(null);
      setTemplateName("");
      setTemplateDescription("");
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your template.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!templateName) {
        setTemplateName(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !templateName || !user) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("name", templateName);
    formData.append("description", templateDescription);
    formData.append("userId", user.id.toString());

    uploadMutation.mutate(formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Template Upload</h1>
        <p className="text-gray-600 mt-2">Upload and manage your brochure templates</p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="template-file">Template File</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-primary/50 transition-colors">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CloudUpload className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Upload Template Files
                </h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop your template files here, or click to browse
                </p>
                <input
                  id="template-file"
                  type="file"
                  accept=".pdf,.ai,.psd,.svg,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("template-file")?.click()}
                >
                  Choose Files
                </Button>
                <p className="text-xs text-gray-500 mt-3">
                  Supports: PDF, AI, PSD, SVG, JPG, JPEG, PNG, GIF, WEBP (Max 50MB)
                </p>
              </div>
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Describe your template"
                  className="mt-2"
                />
              </div>
            </div>

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !templateName || uploadMutation.isPending}
              className="w-full"
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload Template"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Uploaded Templates</h2>
        </div>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4 animate-pulse">
                  <div className="w-full h-40 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CloudUpload className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates uploaded</h3>
              <p className="text-gray-600">Upload your first template to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template: Template) => (
                <div key={template.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="w-full h-40 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                    {template.filePath ? (
                      <img 
                        src={`/uploads/${template.filePath}`}
                        alt={template.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDIwMCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NS41IDYwTDk1IDQ5LjVMMTA0LjUgNjBMOTUgNzBMODUuNSA2MFoiIGZpbGw9IiM5Q0E4QjQiLz4KPHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCA4MCAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjQiIGZpbGw9IiNFNUU3RUIiLz4KPHJlY3QgeT0iOCIgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQiIGZpbGw9IiNFNUU3RUIiLz4KPC9zdmc+Cjwvc3ZnPgo=";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <CloudUpload className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {template.description || "No description"}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : ""}
                    </span>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" className="text-primary">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
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
