import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom"; 

export default function Layout() { 
  return (
    <Box display="flex">
      <Sidebar />
      <Box component="main" flexGrow={1} p={3}>
        <Outlet /> 
      </Box>
    </Box>
  );
}