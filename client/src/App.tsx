import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import LoginPage from "@/pages/login";
import DashboardLayout from "@/components/layout/dashboard-layout";
import Dashboard from "@/pages/dashboard";
import CreateCampaign from "@/pages/create-campaign";
import ProductManagement from "@/pages/product-management";
import TemplateUpload from "@/pages/template-upload";
import LogoUpload from "@/pages/logo-upload";
import SocialMedia from "@/pages/social-media";
import Statistics from "@/pages/statistics";
import NotFound from "@/pages/not-found";

function AppRouter() {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/create-campaign" component={CreateCampaign} />
        <Route path="/product-management" component={ProductManagement} />
        <Route path="/template-upload" component={TemplateUpload} />
        <Route path="/logo-upload" component={LogoUpload} />
        <Route path="/social-media" component={SocialMedia} />
        <Route path="/statistics" component={Statistics} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AppRouter />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
