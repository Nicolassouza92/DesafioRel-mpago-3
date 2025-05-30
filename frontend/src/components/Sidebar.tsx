import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Typography, 
  Box,        
  Avatar,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BuildIcon from "@mui/icons-material/Build";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { deepOrange } from "@mui/material/colors";

const drawerWidth = 240;

const formatarNomeParaExibicao = (nomeCompleto: string): { nomeCurto: string, iniciais: string } => {
  if (!nomeCompleto) return { nomeCurto: 'Usuário', iniciais: 'U' };
  const partesNome = nomeCompleto.trim().split(' ');
  const primeiroNome = partesNome[0];
  let iniciais = primeiroNome.charAt(0).toUpperCase();
  let nomeCurto = primeiroNome;

  if (partesNome.length > 1) {
    const ultimoNome = partesNome[partesNome.length - 1];
    iniciais += ultimoNome.charAt(0).toUpperCase();
    nomeCurto = `${primeiroNome} ${ultimoNome.charAt(0)}.`; // Ex: Nicolas C.
  } else if (primeiroNome.length > 1) {
    iniciais = primeiroNome.substring(0, 2).toUpperCase(); // Se só um nome, pega 2 letras
  }
  return { nomeCurto, iniciais };
};

export default function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Meus Ativos', icon: <BuildIcon />, path: '/meus-ativos' },
    { text: 'Histórico', icon: <HistoryIcon />, path: '/historico' },
    { text: 'Configurações', icon: <SettingsIcon />, path: '/configuracoes' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const { nomeCurto, iniciais } = user ? formatarNomeParaExibicao(user.nome) : { nomeCurto: '', iniciais: '' };

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
      }}
    >
      {user && (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            p: 2, 
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
            mb: 1,
          }}
        >
          <Avatar sx={{ bgcolor: deepOrange[500], width: 56, height: 56, mb: 1, fontSize: '1.5rem' }}>
            {iniciais}
          </Avatar>
          <Typography variant="subtitle1" fontWeight="medium">
            {nomeCurto}
          </Typography>
        </Box>
      )}

      <List sx={{flexGrow: 1}}>
        {menuItems.map((item) => (
          <ListItem component={RouterLink} to={item.path} key={item.text} disablePadding>
            <ListItemButton>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

     <Box sx={{ mt: 'auto' }}>
        <Divider />
        <List>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="Sair" />
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  );
}