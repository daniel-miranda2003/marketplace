"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/client";
import SettingsModal from "./SettingsModal";

type DashboardRole = Database["public"]["Enums"]["user_role"];
type Subscription = Database["public"]["Enums"]["subscription_status"];

interface SidebarProfileProps {
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: DashboardRole;
  subscription: Subscription;
  compact: boolean;
}

export default function SidebarProfile({
  userId,
  email,
  firstName,
  lastName,
  role,
  subscription,
  compact,
}: SidebarProfileProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const router = useRouter();
  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") || "Mi cuenta";
  const initial = (firstName ?? lastName ?? "U").charAt(0).toUpperCase();

  const handleLogout = async () => {
    setAnchor(null);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
      <ButtonBase
        onClick={(event) => setAnchor(event.currentTarget)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: compact ? "center" : "flex-start",
          gap: 1.5,
          width: "100%",
          borderRadius: 2,
          p: 1,
          textAlign: "left",
        }}
      >
        <Avatar sx={{ width: 36, height: 36 }}>{initial}</Avatar>
        {!compact && (
          <Typography
            variant="body2"
            noWrap
            sx={{ fontWeight: 600, flexGrow: 1 }}
          >
            {displayName}
          </Typography>
        )}
      </ButtonBase>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
        slotProps={{
          paper: { sx: { minWidth: 240, borderRadius: 3, p: 1 } },
        }}
      >
        <MenuItem
          onClick={() => {
            setAnchor(null);
            setSettingsOpen(true);
          }}
          sx={{ borderRadius: 2, py: 1.25 }}
        >
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Ajustes" />
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={handleLogout} sx={{ borderRadius: 2, py: 1.25 }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Cerrar sesión" />
        </MenuItem>
      </Menu>
      <SettingsModal
        open={settingsOpen}
        userId={userId}
        email={email}
        role={role}
        subscription={subscription}
        firstName={firstName}
        lastName={lastName}
        onClose={() => setSettingsOpen(false)}
      />
    </Box>
  );
}
