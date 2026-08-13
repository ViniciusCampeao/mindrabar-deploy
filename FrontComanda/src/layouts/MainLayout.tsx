import { Box } from "@mui/material";
import Header from "../components/navigation/Header";
import { PrinterServiceCheck } from "../components/ui";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <>
      <Header />
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
        {children}
      </Box>
      <PrinterServiceCheck />
    </>
  );
};

export default MainLayout;
