import {
  LayoutDashboard, FileText, Image, Settings, Box
} from "lucide-react";

export const adminMenuConfig = [
  {
    section: "OVERVIEW",
    icon: LayoutDashboard,
    items: [
      { name: "Dashboard", module: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    section: "CONTENT",
    icon: FileText,
    items: [
      { name: "Blog Posts", module: "Blog Posts", href: "/admin/blogs", icon: FileText },
      { name: "Gallery", module: "Gallery", href: "/admin/gallery", icon: Image },
      // { name: "Products", module: "Products", href: "/admin/products", icon: Box },
    ]
  },
];

export const dashboardMenuConfig = [];
