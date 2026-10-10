"use client";

import { createContext, useState } from "react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import type { Database } from "@/lib/supabase/database.types";

type DashboardRole = Database["public"]["Enums"]["user_role"];
type Subscription = Database["public"]["Enums"]["subscription_status"];

interface DashboardShellProps {
  userId: string;
  role: DashboardRole;
  email: string;
  firstName: string | null;
  lastName: string | null;
  subscription: Subscription;
  children: ReactNode;
}

export const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

export const SidebarCollapsedContext = createContext(false);

export default function DashboardShell({
  userId,
  role,
  email,
  firstName,
  lastName,
  subscription,
  children,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const isInventory = pathname === "/home/sell";
  const drawerWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  return (
    <Box sx={{ display: "flex" }}>
      <Box sx={{ display: { xs: "block", sm: "none" } }}>
        <DashboardHeader onMenuClick={() => setMobileOpen(true)} />
      </Box>
      <DashboardSidebar
        userId={userId}
        role={role}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        email={email}
        firstName={firstName}
        lastName={lastName}
        subscription={subscription}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: isInventory ? 0 : 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          display: "flex",
          flexDirection: "column",
          minHeight: {
            xs: "calc(100dvh - 56px)",
            sm: "100dvh",
          },
        }}
      >
        <Box sx={{ display: { xs: "block", sm: "none" } }}>
          <Toolbar />
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <SidebarCollapsedContext.Provider value={collapsed}>
            {children}
          </SidebarCollapsedContext.Provider>
        </Box>
      </Box>
    </Box>
  );
}
