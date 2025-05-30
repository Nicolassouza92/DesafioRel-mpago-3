import { Card, CardContent, Typography, Button, Chip } from "@mui/material";

interface Props {
  nomeAtivo: string;
  descricao: string;
  // status: "vermelho" | "amarelo"; // REMOVIDO
  statusColor: "error" | "warning" | "info" | "success" | "default" | "primary" | "secondary" ; // Aceita mais cores do Chip
  onRegistrarClick?: () => void; // Handler opcional para o botão
}

export default function CardAtivoManutencao({ nomeAtivo, descricao, statusColor, onRegistrarClick }: Props) {
  // const cor = status === "vermelho" ? "error" : "warning"; // REMOVIDO

  return (
    <Card sx={{ mb: 2, boxShadow: 3 }}> {/* Adicionado um pouco mais de sombra */}
      <CardContent>
        <Typography variant="h6" component="div" sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
          <Chip label={nomeAtivo} color={statusColor} /> {/* Usa statusColor diretamente */}
          <Typography variant="subtitle1" color="text.secondary" sx={{flexGrow: 1, textAlign: 'right'}}>
            {/* Poderia adicionar um ícone de alerta aqui baseado no status */}
          </Typography>
        </Typography>
        <Typography variant="body1" sx={{mb:1}}>{descricao}</Typography>
        {onRegistrarClick && ( // Só mostra o botão se o handler for passado
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