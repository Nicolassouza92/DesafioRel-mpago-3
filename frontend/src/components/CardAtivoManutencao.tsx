import { Card, CardContent, Typography, Button, Chip } from "@mui/material";

interface Props {
  nomeAtivo: string;
  descricao: string;
  statusColor: "error" | "warning" | "info" | "success" | "default" | "primary" | "secondary" ; // Aceita mais cores do Chip
  onRegistrarClick?: () => void;
}

export default function CardAtivoManutencao({ nomeAtivo, descricao, statusColor, onRegistrarClick }: Props) {
  
  return (
    <Card sx={{ mb: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" component="div" sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
          <Chip label={nomeAtivo} color={statusColor} />
          <Typography variant="subtitle1" color="text.secondary" sx={{flexGrow: 1, textAlign: 'right'}}>
          </Typography>
        </Typography>
        <Typography variant="body1" sx={{mb:1}}>{descricao}</Typography>
        {onRegistrarClick && (
          <Button 
            variant="contained" 
            size="small" 
            sx={{ mt: 1 }}
            onClick={onRegistrarClick}
          >
            Registrar Manutenção Realizada
          </Button>
        )}
      </CardContent>
    </Card>
  );
}