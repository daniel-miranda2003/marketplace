import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CreateStoreForm from "./CreateStoreForm";

export default function StoreOnboarding() {
  return (
    <Card sx={{ maxWidth: 640 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Crea tu tienda
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Necesitas una tienda para publicar prendas en el marketplace.
        </Typography>
        <CreateStoreForm />
      </CardContent>
    </Card>
  );
}
