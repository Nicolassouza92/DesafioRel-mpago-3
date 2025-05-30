import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom"; // Importar Outlet

export default function Layout() { // Não precisa mais de children como prop explícita
  return (
    <Box display="flex">
      <Sidebar />
      <Box component="main" flexGrow={1} p={3}>
        <Outlet /> {/* Rotas filhas serão renderizadas aqui */}
      </Box>
    </Box>
  );
}