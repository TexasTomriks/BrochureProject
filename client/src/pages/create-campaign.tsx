import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import ProductSearch from "@/components/products/product-search";
import SelectedProducts from "@/components/products/selected-products";
import BrochureEditor from "@/components/brochure/brochure-editor";
import { Layout, Users, FileText, ArrowLeft, ArrowRight, CheckCircle, Package } from "lucide-react";
import type { Product, CampaignProduct, Template } from "@shared/schema";

type CreationStep = 'products' | 'pages' | 'templates' | 'editor';

export default function CreateCampaign() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [selectedProducts, setSelectedProducts] = useState<(CampaignProduct & { product: Product })[]>([]);
  const [currentCampaign, setCurrentCampaign] = useState<any>(null);
  
  // New campaign creation flow state
  const [creationStep, setCreationStep] = useState<CreationStep>('products');
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [pageTemplates, setPageTemplates] = useState<Record<number, number | null>>({});

  // Check if we're editing an existing campaign
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const campaignId = urlParams.get('campaignId');
  const isEditing = !!campaignId;

  // Fetch campaign data if editing
  const { data: campaign } = useQuery({
    queryKey: ["/api/campaigns", campaignId],
    queryFn: async () => {
      const response = await fetch(`/api/campaigns/${campaignId}`);
      if (!response.ok) throw new Error('Failed to fetch campaign');
      return response.json();
    },
    enabled: isEditing && !!campaignId,
  });

  // Fetch campaign products if editing
  const { data: campaignProducts } = useQuery({
    queryKey: ["/api/campaigns", campaignId, "products"],
    queryFn: async () => {
      const response = await fetch(`/api/campaigns/${campaignId}/products`);
      if (!response.ok) throw new Error('Failed to fetch campaign products');
      return response.json();
    },
    enabled: isEditing && !!campaignId,
  });

  // Fetch templates for layout selection
  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ["/api/templates", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/templates?userId=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Load campaign data when editing
  useEffect(() => {
    if (isEditing && campaign) {
      setCurrentCampaign(campaign);
    }
  }, [campaign, isEditing]);

  // Load campaign products when editing
  useEffect(() => {
    if (isEditing && campaignProducts) {
      setSelectedProducts(campaignProducts);
      // Skip to editor step if editing existing campaign
      setCreationStep('editor');
    }
  }, [campaignProducts, isEditing]);

  // Auto-distribute products when moving to editor step
  const handleProceedToEditor = () => {
    if (selectedProducts.length > 0) {
      // Auto-distribute products across the selected page count and set pages for brochure editor
      const updatedProducts = selectedProducts.map((item, index) => ({
        ...item,
        pageNumber: (index % pageCount) + 1
      }));
      setSelectedProducts(updatedProducts);
    }
    setCreationStep('editor');
  };

  const handleProductSelect = (product: Product) => {
    const campaignProduct: CampaignProduct & { product: Product } = {
      id: Date.now(), // Temporary ID
      campaignId: 0, // Will be set when campaign is created
      productId: product.id,
      quantity: 1,
      discountPercent: 0,
      newPrice: product.originalPrice,
      positionX: 0,
      positionY: 0,
      scaleX: 1,
      scaleY: 1,
      pageNumber: 1,
      product,
    };
    setSelectedProducts(prev => [...prev, campaignProduct]);
  };

  const handleProductUpdate = (id: number, updates: Partial<CampaignProduct>) => {
    setSelectedProducts(prev => 
      prev.map(cp => 
        cp.id === id 
          ? { ...cp, ...updates }
          : cp
      )
    );
  };

  const handleProductPositionUpdate = (productId: number, x: number, y: number) => {
    setSelectedProducts(prev => 
      prev.map(cp => 
        cp.id === productId 
          ? { ...cp, positionX: x, positionY: y }
          : cp
      )
    );
  };

  const handleProductRemove = (id: number) => {
    setSelectedProducts(prev => prev.filter(cp => cp.id !== id));
  };

  // Step indicators
  const steps = [
    { id: 'products', name: 'Products', icon: Package, description: 'Select products' },
    { id: 'pages', name: 'Pages', icon: FileText, description: 'Set page count' },
    { id: 'templates', name: 'Templates', icon: Layout, description: 'Choose templates' },
    { id: 'editor', name: 'Design', icon: CheckCircle, description: 'Arrange & finalize' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === creationStep);

  const renderStepContent = () => {
    switch (creationStep) {
      case 'products':
        return (
          <div className="max-w-6xl mx-auto">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-6 h-6" />
                  <span>Select Your Products</span>
                </CardTitle>
                <CardDescription>
                  Choose the products you want to feature in your campaign. You can set discounts and quantities for each product.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <ProductSearch onProductSelect={handleProductSelect} />
              </div>
              <div>
                <SelectedProducts 
                  products={selectedProducts} 
                  onProductUpdate={handleProductUpdate}
                  onProductRemove={handleProductRemove}
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={() => setCreationStep('pages')}
                disabled={selectedProducts.length === 0}
              >
                Next: Page Setup
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'pages':
        return (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-6 h-6" />
                <span>Configure Pages</span>
              </CardTitle>
              <CardDescription>
                Choose how many pages your brochure should have. Products will be automatically distributed evenly across all pages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Pages
                  </label>
                  <Select
                    value={pageCount.toString()}
                    onValueChange={(value) => setPageCount(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} Page{num > 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Distribution Preview</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Your {selectedProducts.length} products will be distributed across {pageCount} page{pageCount > 1 ? 's' : ''}.
                  </p>
                  
                  {/* Visual Page Preview */}
                  <div className="flex justify-center space-x-4">
                    {Array.from({ length: pageCount }, (_, pageIndex) => {
                      const pageProducts = selectedProducts.filter((_, index) => (index % pageCount) === pageIndex);
                      return (
                        <div key={pageIndex} className="flex flex-col items-center">
                          <div className="w-20 h-24 border-2 border-gray-300 rounded-lg bg-white shadow-sm relative">
                            {/* Page number */}
                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                              {pageIndex + 1}
                            </div>
                            {/* Product placeholders */}
                            <div className="p-1 h-full flex flex-col justify-center">
                              {pageProducts.slice(0, 4).map((_, productIndex) => (
                                <div key={productIndex} className="flex items-center justify-center mb-1">
                                  <Package className="w-3 h-3 text-blue-400" />
                                </div>
                              ))}
                              {pageProducts.length > 4 && (
                                <div className="text-center text-xs text-gray-400">
                                  +{pageProducts.length - 4}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            {pageProducts.length} product{pageProducts.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => setCreationStep('products')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back: Products
                </Button>
                <Button onClick={() => setCreationStep('templates')}>
                  Next: Choose Templates
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'templates':
        return (
          <Card className="max-w-5xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Layout className="w-6 h-6" />
                <span>Choose Templates for Each Page</span>
              </CardTitle>
              <CardDescription>
                Select templates for each page of your brochure. You can choose different templates for each page or use the same template for all pages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Array.from({ length: pageCount }, (_, pageIndex) => (
                  <div key={pageIndex} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Page {pageIndex + 1} Template</h4>
                    {templates.length === 0 ? (
                      <div className="text-center py-8">
                        <Layout className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-600 text-sm">No templates available. Default background will be used.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        <div 
                          className={`relative border-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                            !pageTemplates[pageIndex + 1] 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setPageTemplates(prev => ({ ...prev, [pageIndex + 1]: null }))}
                        >
                          <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                            <Layout className="w-8 h-8 text-white" />
                          </div>
                          <div className="p-2">
                            <h5 className="text-sm font-medium text-gray-900">Default Background</h5>
                            {!pageTemplates[pageIndex + 1] && (
                              <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-1">
                                <CheckCircle className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        </div>
                        {templates.map((template) => (
                          <div 
                            key={template.id}
                            className={`relative border-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                              pageTemplates[pageIndex + 1] === template.id 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setPageTemplates(prev => ({ ...prev, [pageIndex + 1]: template.id }))}
                          >
                            <div className="aspect-[3/4] rounded-lg overflow-hidden">
                              <img 
                                src={`/uploads/${template.filePath}`}
                                alt={template.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-2">
                              <h5 className="text-sm font-medium text-gray-900">{template.name}</h5>
                              {pageTemplates[pageIndex + 1] === template.id && (
                                <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-1">
                                  <CheckCircle className="w-3 h-3" />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => setCreationStep('pages')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back: Page Setup
                </Button>
                <Button onClick={handleProceedToEditor}>
                  Start Designing
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'editor':
        return (
          <div className="space-y-6">
            {/* Step header for editor mode */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-6 h-6" />
                  <span>Design Your Brochure</span>
                </CardTitle>
                <CardDescription>
                  Arrange your products on each page, adjust sizes and positions, and finalize your campaign design. Products are already distributed across your pages and ready for layout adjustments.
                </CardDescription>
              </CardHeader>
            </Card>
            
            {!isEditing && (
              <div className="flex justify-start">
                <Button 
                  variant="outline"
                  onClick={() => setCreationStep('templates')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back: Templates
                </Button>
              </div>
            )}
            
            {/* Design-only Editor */}
            <BrochureEditor 
              selectedProducts={selectedProducts}
              campaign={currentCampaign}
              onCampaignUpdate={setCurrentCampaign}
              onProductPositionUpdate={handleProductPositionUpdate}
              isDesignMode={true}
              initialPages={pageCount}
              pageTemplates={pageTemplates}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Step Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = creationStep === step.id;
            const isCompleted = index < currentStepIndex;
            
            return (
              <div key={step.id} className="flex items-center space-x-2">
                <div className={`flex items-center space-x-3 ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    isActive ? 'border-blue-600 bg-blue-50' : 
                    isCompleted ? 'border-green-600 bg-green-50' : 
                    'border-gray-300 bg-gray-50'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium">{step.name}</div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      {renderStepContent()}
    </div>
  );
}
