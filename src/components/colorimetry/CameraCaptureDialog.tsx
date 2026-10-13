"use client";

import { useEffect, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import FlipCameraAndroidIcon from "@mui/icons-material/FlipCameraAndroid";
import RefreshIcon from "@mui/icons-material/Refresh";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";

interface CameraCaptureDialogProps {
  open: boolean;
  maxDimension: number;
  onClose: () => void;
  onCapture: (file: File) => void;
}

type CameraStatus = "starting" | "ready" | "error";

const RETRYABLE_ERRORS = new Set(["NotReadableError", "AbortError"]);
const MAX_ATTEMPTS = 4;

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

function cameraErrorMessage(error: unknown): string {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "Permiso de cámara denegado. Haz clic en el candado de la barra de direcciones, permite el acceso a la cámara y pulsa Reintentar.";
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return "No se encontró ninguna cámara en este dispositivo. Sube un archivo o usa tu celular.";
  }
  if (name === "NotReadableError" || name === "AbortError") {
    return "La cámara sigue en uso por otra aplicación o el navegador no la liberó. Ciérrala (Zoom, Meet, Teams…), espera unos segundos y pulsa Reintentar.";
  }
  return "No se pudo acceder a la cámara. Revisa los permisos del navegador o sube un archivo.";
}

export default function CameraCaptureDialog({
  open,
  maxDimension,
  onClose,
  onCapture,
}: CameraCaptureDialogProps) {
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<CameraStatus>("starting");
  const [camError, setCamError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    const releaseStream = () => {
      const stream = streamRef.current;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    const start = async () => {
      await wait(250);
      if (cancelled) {
        return;
      }
      setStatus("starting");
      setCamError(null);

      let lastError: unknown = null;
      for (let index = 0; index < MAX_ATTEMPTS; index += 1) {
        if (cancelled) {
          return;
        }
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode,
              width: { ideal: 1280 },
              height: { ideal: 1280 },
            },
            audio: false,
          });
          if (cancelled) {
            stream.getTracks().forEach((track) => track.stop());
            return;
          }
          streamRef.current = stream;
          const video = videoRef.current;
          if (video) {
            video.srcObject = stream;
            await video.play().catch(() => undefined);
          }
          if (!cancelled) {
            setStatus("ready");
          }
          return;
        } catch (error) {
          lastError = error;
          const name = error instanceof DOMException ? error.name : "";
          if (!RETRYABLE_ERRORS.has(name)) {
            break;
          }
          await wait(400 * (index + 1));
        }
      }

      if (!cancelled) {
        setStatus("error");
        setCamError(cameraErrorMessage(lastError));
      }
    };

    void start();

    return () => {
      cancelled = true;
      releaseStream();
    };
  }, [open, facingMode, attempt]);

  const handleClose = () => {
    setCamError(null);
    onClose();
  };

  const handleRetry = () => {
    setStatus("starting");
    setCamError(null);
    setAttempt((value) => value + 1);
  };

  const handleFlip = () => {
    setStatus("starting");
    setCamError(null);
    setFacingMode((mode) => (mode === "user" ? "environment" : "user"));
  };

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || status !== "ready" || video.videoWidth === 0) {
      return;
    }
    const scale = Math.min(
      1,
      maxDimension / Math.max(video.videoWidth, video.videoHeight),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          return;
        }
        onClose();
        onCapture(new File([blob], "selfie.jpg", { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.9,
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Tomar foto</DialogTitle>
      <DialogContent>
        {camError ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <VideocamOffIcon
              sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
            />
            <Alert severity="error" sx={{ textAlign: "left", mb: 2 }}>
              {camError}
            </Alert>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<RefreshIcon />}
              onClick={handleRetry}
            >
              Reintentar
            </Button>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                position: "relative",
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: "black",
                aspectRatio: "3 / 4",
              }}
            >
              <Box
                component="video"
                ref={videoRef}
                playsInline
                muted
                autoPlay
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              {status !== "ready" && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1.5,
                    color: "common.white",
                    bgcolor: "rgba(0, 0, 0, 0.45)",
                  }}
                >
                  <CircularProgress size={32} color="inherit" />
                  <Typography variant="body2">Iniciando cámara…</Typography>
                </Box>
              )}
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1.5 }}
            >
              Centra tu rostro con luz natural de frente, sin filtros ni
              maquillaje.
            </Typography>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          startIcon={<FlipCameraAndroidIcon />}
          onClick={handleFlip}
          disabled={camError !== null}
        >
          Cambiar cámara
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleCapture}
          disabled={camError !== null || status !== "ready"}
        >
          Capturar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
