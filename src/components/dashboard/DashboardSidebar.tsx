"use client";

import Link from "@/components/ui/Link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BarChartIcon from "@mui/icons-material/BarChart";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import InventoryIcon from "@mui/icons-material/Inventory";
import MenuIcon from "@mui/icons-material/Menu";
import StorefrontIcon from "@mui/icons-material/Storefront";
import type { Database } from "@/lib/supabase/database.types";
import { DRAWER_WIDTH } from "./DashboardShell";
import SidebarProfile from "./SidebarProfile";

type DashboardRole = Database["public"]["Enums"]["user_role"];
type Subscription = Database["public"]["Enums"]["subscription_status"];

interface SidebarItem {
  label: string;
  href: string;
  icon: ReactNode;
}

interface DashboardSidebarProps {
  userId: string;
  role: DashboardRole;
  mobileOpen: boolean;
  onClose: () => void;
  email: string;
  firstName: string | null;
  lastName: string | null;
  subscription: Subscription;
  collapsed: boolean;
  onToggle: () => void;
}

const buyerItems: SidebarItem[] = [
  { label: "Mi armario", href: "/dashboard", icon: <CheckroomIcon /> },
  { label: "Tienda", href: "/marketplace", icon: <StorefrontIcon /> },
  {
    label: "Análisis IA",
    href: "/dashboard/analysis",
    icon: <AutoAwesomeIcon />,
  },
];

const vendorItems: SidebarItem[] = [
  { label: "Resumen de ventas", href: "/dashboard", icon: <BarChartIcon /> },
  { label: "Tienda", href: "/marketplace", icon: <StorefrontIcon /> },
  { label: "Inventario", href: "/dashboard/inventory", icon: <InventoryIcon /> },
  {
    label: "Mi billetera",
    href: "/dashboard/wallet",
    icon: <AccountBalanceWalletIcon />,
  },
];

const COLLAPSED_WIDTH = 72;

export default function DashboardSidebar({
  userId,
  role,
  mobileOpen,
  onClose,
  email,
  firstName,
  lastName,
  subscription,
  collapsed,
  onToggle,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const items = role === "vendor" ? vendorItems : buyerItems;
  const width = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const renderContent = (compact: boolean) => (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar
        sx={{
          justifyContent: compact ? "center" : "flex-start",
          px: compact ? 0 : 3,
        }}
      >
        <IconButton
          onClick={onToggle}
          aria-label={compact ? "Expandir menú" : "Contraer menú"}
        >
          <MenuIcon />
        </IconButton>
        {!compact && (
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Kroma
          </Typography>
        )}
      </Toolbar>
      <Divider />
      <List>
        {items.map((item) => (
          <ListItem key={item.href} disablePadding>
            <Tooltip
              title={item.label}
              placement="right"
              disableHoverListener={!compact}
            >
              <ListItemButton
                component={Link}
                href={item.href}
                selected={pathname === item.href}
                onClick={onClose}
                sx={{ justifyContent: compact ? "center" : "flex-start" }}
              >
                <ListItemIcon sx={{ minWidth: compact ? 0 : 56 }}>
                  {item.icon}
                </ListItemIcon>
                {!compact && <ListItemText primary={item.label} />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: "auto" }}>
        <SidebarProfile
          userId={userId}
          email={email}
          firstName={firstName}
          lastName={lastName}
          role={role}
          subscription={subscription}
          compact={compact}
        />
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { sm: width },
        flexShrink: { sm: 0 },
        transition: "width 0.2s ease",
      }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
        }}
      >
        {renderContent(false)}
      </Drawer>
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            width,
            transition: "width 0.2s ease",
          },
        }}
      >
        {renderContent(collapsed)}
      </Drawer>
    </Box>
  );
}
