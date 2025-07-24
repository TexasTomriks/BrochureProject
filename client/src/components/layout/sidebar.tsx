import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  PlusCircle,
  Share2,
  BarChart,
  Upload,
  Image,
  Package,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Create Campaign", href: "/create-campaign", icon: PlusCircle },
  { name: "Product Management", href: "/product-management", icon: Package },
  { name: "Social Media", href: "/social-media", icon: Share2 },
  { name: "Statistics", href: "/statistics", icon: BarChart },
  { name: "Template Upload", href: "/template-upload", icon: Upload },
  { name: "Logo Upload", href: "/logo-upload", icon: Image },
];

export default function Sidebar({ collapsed }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside className={cn(
      "bg-white border-r border-gray-200 flex-shrink-0 transition-width",
      collapsed ? "w-16" : "w-64"
    )}>
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || (item.href === "/dashboard" && location === "/");
          
          return (
            <Link key={item.name} href={item.href}>
              <div className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-700 hover:bg-gray-50"
              )}>
                <Icon className="w-5 h-5" />
                {!collapsed && <span>{item.name}</span>}
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
