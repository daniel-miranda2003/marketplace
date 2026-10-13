"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Fade from "@mui/material/Fade";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import FaceRetouchingNaturalIcon from "@mui/icons-material/FaceRetouchingNatural";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import SecurityIcon from "@mui/icons-material/Security";
import SparklesIcon from "@mui/icons-material/AutoFixHigh";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import { submitColorimetryAnalysis } from "@/lib/actions/colorimetry";
import type { ColorimetryAnalysis } from "@/lib/actions/colorimetry";
import type { Product } from "@/lib/api/products";
import AnalysisResultView from "./AnalysisResultView";
import CameraCaptureDialog from "./CameraCaptureDialog";

interface BestPractice {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const BEST_PRACTICES: BestPractice[] = [
  {
    title: "Luz natural frontal",
    description:
      "Ubícate frente a una ventana para evitar sombras marcadas en mejillas y ojos.",
    icon: (
      <WbSunnyOutlinedIcon sx={{ color: "secondary.main", fontSize: 28 }} />
    ),
  },
  {
    title: "Rostro despejado",
    description:
      "Retira el cabello hacia atrás y descubre tu frente, orejas y cuello por completo.",
    icon: (
      <FaceRetouchingNaturalIcon
        sx={{ color: "secondary.main", fontSize: 28 }}
      />
    ),
  },
  {
    title: "Cero filtros o maquillaje",
    description:
      "La IA analiza la pigmentación real de tu esclerótica, iris y subtono cutáneo.",
    icon: <SparklesIcon sx={{ color: "secondary.main", fontSize: 28 }} />,
  },
];

const ANALYSIS_STEPS = [
  {
    step: "Paso 1 de 4",
    title: "Analizando subtono de piel…",
    desc: "Segmentando áreas clave de la dermis para medir matices cálidos vs. fríos.",
    progress: 25,
  },
  {
    step: "Paso 2 de 4",
    title: "Midiendo contraste esclerótica/iris…",
    desc: "Calculando la relación de luminosidad entre iris, cabello y pigmentación facial.",
    progress: 55,
  },
  {
    step: "Paso 3 de 4",
    title: "Calculando paleta cromática…",
    desc: "Asignando tu armonía estacional (Primavera, Verano, Otoño o Invierno).",
    progress: 80,
  },
  {
    step: "Paso 4 de 4",
    title: "Generando diagnóstico de alta costura…",
    desc: "Curando recomendaciones cromáticas y prendas compatibles en el marketplace.",
    progress: 95,
  },
] as const;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 4 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1024;

function downscaleImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(
        1,
        MAX_IMAGE_DIMENSION / Math.max(img.width, img.height),
      );
      if (scale >= 1) {
        resolve(file);
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          resolve(
            new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", {
              type: "image/jpeg",
            }),
          );
        },
        "image/jpeg",
        0.85,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

export default function AnalysisFormView() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorSeverity, setErrorSeverity] = useState<"error" | "warning">(
    "error",
  );
  const [result, setResult] = useState<ColorimetryAnalysis | null>(null);
  const [resultGender, setResultGender] = useState<"men" | "women" | null>(
    null,
  );
  const [matches, setMatches] = useState<Product[]>([]);
  const [gender, setGender] = useState<"" | "men" | "women">("");
  const [stepIdx, setStepIdx] = useState(0);
  const [cameraOpen, setCameraOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const closeCamera = useCallback(() => {
    setCameraOpen(false);
  }, []);

  const stopLoader = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsSubmitting(false);
  }, []);

  const handleSelectFile = useCallback((selected: File | null) => {
    setError(null);
    setErrorSeverity("error");
    if (!selected) {
      setFile(null);
      setPreview(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError(
        "Formato no compatible. Por favor sube una imagen JPG, PNG o WebP.",
      );
      return;
    }

    if (selected.size > MAX_SIZE) {
      setError("El archivo supera el peso máximo permitido de 4 MB.");
      return;
    }

    setFile(selected);
    const objectUrl = URL.createObjectURL(selected);
    setPreview(objectUrl);
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selected = event.target.files?.[0] ?? null;
      handleSelectFile(selected);
    },
    [handleSelectFile],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const dropped = event.dataTransfer.files[0] ?? null;
      handleSelectFile(dropped);
    },
    [handleSelectFile],
  );

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setPreview(null);
    setError(null);
    setErrorSeverity("error");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  }, []);

  const handleRepeat = useCallback(() => {
    stopLoader();
    setFile(null);
    setPreview(null);
    setError(null);
    setErrorSeverity("error");
    setResult(null);
    setResultGender(null);
    setMatches([]);
    setStepIdx(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  }, [stopLoader]);

  const handleTakePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) {
      return;
    }
    const hasCamera =
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function";
    if (hasCamera) {
      setCameraOpen(true);
    } else {
      cameraInputRef.current?.click();
    }
  };

  const handleSubmit = () => {
    if (!file || isSubmitting) return;

    if (!gender) {
      setError("Selecciona para quién es el análisis: Hombre o Mujer.");
      return;
    }

    setError(null);
    setErrorSeverity("error");
    setStepIdx(0);
    setIsSubmitting(true);

    let current = 0;
    intervalRef.current = setInterval(() => {
      current = Math.min(current + 1, ANALYSIS_STEPS.length - 1);
      setStepIdx(current);
    }, 2400);

    void (async () => {
      try {
        const formData = new FormData();
        formData.append("photo", await downscaleImage(file));
        formData.append("gender", gender);

        const actionResult = await submitColorimetryAnalysis(formData);

        stopLoader();

        if (actionResult?.success && actionResult.analysis) {
          setResult(actionResult.analysis);
          setResultGender(actionResult.gender ?? gender);
          setMatches(actionResult.matches ?? []);
        } else {
          setErrorSeverity(
            actionResult?.errorType === "HIGH_DEMAND" ? "warning" : "error",
          );
          setError(
            actionResult?.error ??
              actionResult?.message ??
              "No fue posible completar el diagnóstico. Por favor intenta con otra foto con mejor iluminación.",
          );
        }
      } catch {
        stopLoader();
        setError(
          "Ocurrió un error en la conexión. Por favor reintenta en unos instantes.",
        );
      }
    })();
  };

  const isLoading = isSubmitting;
  const currentStep = ANALYSIS_STEPS[stepIdx];

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "80vh",
        py: { xs: 4, md: 8 },
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            textAlign: "center",
            maxWidth: 760,
            mx: "auto",
            mb: { xs: 5, md: 7 },
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.03em",
              fontSize: { xs: "2rem", sm: "2.75rem", md: "3.25rem" },
              lineHeight: 1.15,
              mb: 2,
            }}
          >
            Descubre los tonos que potencian tu luz natural
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              fontSize: { xs: "1rem", md: "1.125rem" },
              lineHeight: 1.6,
              maxWidth: 620,
              mx: "auto",
            }}
          >
            Nuestra visión artificial analiza tus contrastes biológicos y
            determina tu estación armónica para sugerirte prendas que combinan a
            la perfección con tu piel.
          </Typography>
        </Box>

        {result ? (
          <AnalysisResultView
            result={result}
            gender={resultGender ?? "men"}
            products={matches}
            onRepeat={handleRepeat}
          />
        ) : (
          <Grid container spacing={4} sx={{ alignItems: "stretch" }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 4,
                  border: 1,
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Sube tu selfie para análisis
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Una fotografía nítida en primer plano brinda la máxima
                  precisión cromática.
                </Typography>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  hidden
                  onChange={handleFileChange}
                  disabled={isLoading}
                />

                <Card
                  variant="outlined"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => {
                    if (!isLoading && !preview) {
                      fileInputRef.current?.click();
                    }
                  }}
                  sx={{
                    border: 2,
                    borderStyle: preview ? "solid" : "dashed",
                    borderColor: preview ? "secondary.main" : "divider",
                    borderRadius: 3,
                    bgcolor: preview
                      ? "background.paper"
                      : "rgba(200, 169, 126, 0.03)",
                    cursor: isLoading
                      ? "default"
                      : preview
                        ? "default"
                        : "pointer",
                    transition: "all 0.25s ease",
                    flexGrow: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 340,
                    position: "relative",
                    overflow: "hidden",
                    "&:hover":
                      !isLoading && !preview
                        ? {
                            borderColor: "secondary.main",
                            bgcolor: "rgba(200, 169, 126, 0.06)",
                          }
                        : {},
                  }}
                >
                  {preview ? (
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        minHeight: 340,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        p: 2,
                      }}
                    >
                      <Box
                        component="img"
                        src={preview}
                        alt="Vista previa para análisis facial"
                        sx={{
                          maxWidth: "100%",
                          maxHeight: 360,
                          borderRadius: 2.5,
                          objectFit: "contain",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                        }}
                      />

                      {!isLoading && (
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{
                            position: "absolute",
                            bottom: 24,
                            bgcolor: "rgba(17, 17, 17, 0.85)",
                            backdropFilter: "blur(10px)",
                            color: "white",
                            px: 2,
                            py: 1,
                            borderRadius: 999,
                          }}
                        >
                          <Button
                            size="small"
                            color="inherit"
                            onClick={() => fileInputRef.current?.click()}
                            sx={{ fontSize: 13 }}
                          >
                            Cambiar foto
                          </Button>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={handleClear}
                            aria-label="Eliminar foto"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      )}
                    </Box>
                  ) : (
                    <CardContent
                      sx={{
                        textAlign: "center",
                        p: 4,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          width: 72,
                          height: 72,
                          borderRadius: "50%",
                          bgcolor: "secondary.light",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 2,
                        }}
                      >
                        <CloudUploadIcon
                          sx={{ fontSize: 36, color: "secondary.dark" }}
                        />
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, mb: 0.5 }}
                      >
                        Arrastra tu foto, tómala con tu cámara o haz clic para
                        explorar
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2, maxWidth: 360 }}
                      >
                        Sube un archivo JPG, PNG o WebP (máx. 4 MB) o usa la
                        cámara de tu celular para una selfie al momento.
                      </Typography>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1.5}
                        sx={{
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Button
                          variant="outlined"
                          color="secondary"
                          size="medium"
                          sx={{ borderRadius: 999, px: 3 }}
                        >
                          Seleccionar archivo
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          size="medium"
                          startIcon={<PhotoCameraIcon />}
                          onClick={handleTakePhoto}
                          sx={{ borderRadius: 999, px: 3 }}
                        >
                          Tomar foto
                        </Button>
                      </Stack>
                    </CardContent>
                  )}
                </Card>

                {error && (
                  <Alert
                    severity={errorSeverity}
                    variant="outlined"
                    sx={{ mt: 3, borderRadius: 2.5 }}
                  >
                    {error}
                  </Alert>
                )}

                {isLoading && (
                  <Paper
                    variant="outlined"
                    sx={{
                      mt: 3,
                      p: 3,
                      borderRadius: 3,
                      bgcolor: "rgba(200, 169, 126, 0.05)",
                      borderColor: "secondary.light",
                    }}
                  >
                    <Stack spacing={2}>
                      <Stack
                        direction="row"
                        sx={{
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1.5}
                          sx={{ alignItems: "center" }}
                        >
                          <CircularProgress size={24} color="secondary" />
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700, color: "secondary.dark" }}
                          >
                            {currentStep.step}
                          </Typography>
                        </Stack>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, color: "text.secondary" }}
                        >
                          {currentStep.progress}%
                        </Typography>
                      </Stack>

                      <LinearProgress
                        variant="determinate"
                        value={currentStep.progress}
                        color="secondary"
                        sx={{ height: 6, borderRadius: 3 }}
                      />

                      <Fade in key={stepIdx} timeout={400}>
                        <Box>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 700, mb: 0.5 }}
                          >
                            {currentStep.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {currentStep.desc}
                          </Typography>
                        </Box>
                      </Fade>

                      <Typography variant="caption" color="text.secondary">
                        El análisis con IA suele tardar entre 30 y 90 segundos
                        según la demanda del servicio. No cierres esta ventana.
                      </Typography>
                    </Stack>
                  </Paper>
                )}

                <Box sx={{ mt: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, mb: 1 }}
                  >
                    ¿Para quién es el análisis?
                  </Typography>
                  <ToggleButtonGroup
                    value={gender}
                    exclusive
                    fullWidth
                    disabled={isLoading}
                    onChange={(_, value: "" | "men" | "women" | null) => {
                      if (value) {
                        setGender(value);
                        setError(null);
                        setErrorSeverity("error");
                      }
                    }}
                    aria-label="Género"
                  >
                    <ToggleButton value="men" sx={{ py: 1.25 }}>
                      Hombre
                    </ToggleButton>
                    <ToggleButton value="women" sx={{ py: 1.25 }}>
                      Mujer
                    </ToggleButton>
                  </ToggleButtonGroup>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 1 }}
                  >
                    Recomendaremos prendas de tu estación en este género
                    (incluye unisex).
                  </Typography>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    fullWidth
                    disabled={!file || isLoading}
                    onClick={handleSubmit}
                    startIcon={!isLoading ? <AutoAwesomeIcon /> : undefined}
                    sx={{
                      py: 1.75,
                      fontSize: "1rem",
                      fontWeight: 700,
                      letterSpacing: 0.3,
                      boxShadow: "0 8px 24px rgba(200, 169, 126, 0.3)",
                    }}
                  >
                    {isLoading
                      ? "Procesando diagnóstico facial…"
                      : "Comenzar Diagnóstico IA"}
                  </Button>
                </Box>

                <CameraCaptureDialog
                  open={cameraOpen}
                  maxDimension={MAX_IMAGE_DIMENSION}
                  onClose={closeCamera}
                  onCapture={handleSelectFile}
                />
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Stack spacing={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 3, md: 3.5 },
                    borderRadius: 4,
                    border: 1,
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ mb: 2, alignItems: "center" }}
                  >
                    <LightbulbOutlinedIcon color="secondary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Guía para un diagnóstico certero
                    </Typography>
                  </Stack>

                  <Stack spacing={2.5}>
                    {BEST_PRACTICES.map((practice) => (
                      <Box
                        key={practice.title}
                        sx={{ display: "flex", gap: 2 }}
                      >
                        <Box sx={{ flexShrink: 0, pt: 0.25 }}>
                          {practice.icon}
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {practice.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mt: 0.25 }}
                          >
                            {practice.description}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 3, md: 3.5 },
                    borderRadius: 4,
                    border: 1,
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, mb: 2 }}
                  >
                    Lo que descubrirás
                  </Typography>

                  <Stack spacing={1.5}>
                    {[
                      "Tu estación cromática (Primavera, Verano, Otoño o Invierno).",
                      "Tu subtipo específico (ej. Otoño Cálido, Invierno Brillante).",
                      "Muestras exactas de tu paleta recomendada en códigos HEX.",
                      "Guía de colores a evitar para favorecer tu luminosidad.",
                      "Catálogo curado con prendas de diseñadores compatibles con tu perfil.",
                    ].map((benefit, i) => (
                      <Stack
                        key={i}
                        direction="row"
                        spacing={1.25}
                        sx={{ alignItems: "flex-start" }}
                      >
                        <CheckCircleIcon
                          sx={{
                            fontSize: 18,
                            color: "secondary.main",
                            mt: 0.25,
                            flexShrink: 0,
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {benefit}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>

                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{
                    px: 2,
                    py: 1.5,
                    color: "text.secondary",
                    alignItems: "center",
                  }}
                >
                  <SecurityIcon sx={{ fontSize: 20, opacity: 0.8 }} />
                  <Typography variant="caption">
                    Tu privacidad es prioridad. La fotografía se procesa de
                    forma segura exclusivamente para el diagnóstico y no se
                    comercializa.
                  </Typography>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
}
