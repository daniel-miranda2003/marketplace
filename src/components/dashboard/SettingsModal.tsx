"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/client";
import { deleteAccount } from "@/app/actions/profile";
import Link from "../ui/Link";
import ProfileForm from "./ProfileForm";

type DashboardRole = Database["public"]["Enums"]["user_role"];
type Subscription = Database["public"]["Enums"]["subscription_status"];

const roleLabels: Record<DashboardRole, string> = {
  buyer: "Comprador",
  vendor: "Vendedor",
  admin: "Administrador",
};

const planLabels: Record<Subscription, string> = {
  free: "Gratis",
  premium: "Premium",
};

interface SettingsModalProps {
  open: boolean;
  userId: string;
  email: string;
  role: DashboardRole;
  subscription: Subscription;
  firstName: string | null;
  lastName: string | null;
  onClose: () => void;
}

type Section = "general" | "account";

interface InfoRowProps {
  label: string;
  children: ReactNode;
}

function InfoRow({ label, children }: InfoRowProps) {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 3,
          py: 2,
        }}
      >
        <Typography variant="body1">{label}</Typography>
        <Box>{children}</Box>
      </Box>
      <Divider />
    </Box>
  );
}

export default function SettingsModal({
  open,
  userId,
  email,
  role,
  subscription,
  firstName,
  lastName,
  onClose,
}: SettingsModalProps) {
  const router = useRouter();
  const [section, setSection] = useState<Section>("account");
  const [signingOut, setSigningOut] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGlobalSignOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "global" });
    router.push("/auth");
    router.refresh();
  };

  const handleDelete = async () => {
    setDeleteError(null);
    setDeleting(true);
    const result = await deleteAccount();
    setDeleting(false);
    if (!result.ok) {
      setDeleteError(result.message);
      setConfirmingDelete(false);
      return;
    }
    onClose();
    router.push("/");
    router.refresh();
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      return;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: { sx: { height: "80vh", borderRadius: 3, overflow: "hidden" } },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Ajustes
        </Typography>
        <IconButton onClick={onClose} aria-label="Cerrar ajustes">
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent sx={{ display: "flex", gap: 4, p: 3 }}>
        <Box sx={{ width: 210, flexShrink: 0 }}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ letterSpacing: 2, px: 2 }}
          >
            Configuración
          </Typography>
          <List disablePadding sx={{ mt: 1 }}>
            <ListItemButton
              selected={section === "general"}
              onClick={() => setSection("general")}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="General" />
            </ListItemButton>
            <ListItemButton
              selected={section === "account"}
              onClick={() => setSection("account")}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Cuenta" />
            </ListItemButton>
          </List>
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            minWidth: 0,
            overflowY: "auto",
            pr: 3,
            scrollbarGutter: "stable",
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "grey.300",
              borderRadius: "4px",
            },
          }}
        >
          {section === "general" ? (
            <>
              <Stack>
                <InfoRow label="Correo">
                  <Typography variant="body1">{email}</Typography>
                </InfoRow>
                <InfoRow label="Rol">
                  <Chip label={roleLabels[role]} size="small" color="primary" />
                </InfoRow>
                <InfoRow label="Plan">
                  <Chip
                    label={planLabels[subscription]}
                    size="small"
                    color={subscription === "premium" ? "secondary" : "default"}
                  />
                </InfoRow>
              </Stack>
              {subscription !== "premium" && (
                <Button
                  variant="contained"
                  component={Link}
                  href="/home/upgrade"
                  sx={{ mt: 3, minHeight: 44 }}
                >
                  Mejorar a Pro
                </Button>
              )}
            </>
          ) : (
            <Stack spacing={4}>
              <ProfileForm
                firstName={firstName}
                lastName={lastName}
                email={email}
              />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Cuenta
                </Typography>
                <Stack>
                  <InfoRow label="Cerrar sesión en todos los dispositivos">
                    <Button
                      variant="outlined"
                      onClick={handleGlobalSignOut}
                      disabled={signingOut}
                    >
                      Cerrar sesión
                    </Button>
                  </InfoRow>
                  <InfoRow label="Eliminar tu cuenta">
                    {confirmingDelete ? (
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={handleDelete}
                          disabled={deleting}
                        >
                          Confirmar
                        </Button>
                        <Button
                          onClick={() => setConfirmingDelete(false)}
                          disabled={deleting}
                        >
                          Cancelar
                        </Button>
                      </Stack>
                    ) : (
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => setConfirmingDelete(true)}
                      >
                        Eliminar cuenta
                      </Button>
                    )}
                  </InfoRow>
                  <InfoRow label="ID de usuario">
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontFamily: "monospace" }}
                      >
                        {userId}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={handleCopyId}
                        aria-label="Copiar ID"
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                      {copied && (
                        <Typography variant="caption" color="success.main">
                          Copiado
                        </Typography>
                      )}
                    </Stack>
                  </InfoRow>
                </Stack>
                {deleteError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {deleteError}
                  </Alert>
                )}
              </Box>
            </Stack>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
