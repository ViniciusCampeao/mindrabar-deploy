import { Box } from "@mui/material";
// Importando a imagem
import logoImg from "../../assets/logo.png";

interface LogoProps {
  sx?: any;
}

export default function Logo({ sx }: LogoProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        ...sx,
      }}
    >
      <Box
        component="img"
        src={logoImg}
        alt="Logo"
        sx={{
          height: { 
            xs: '32px',    // Tamanho em telas muito pequenas (celulares)
            sm: '35px',    // Tamanho em telas pequenas (tablets)
            md: '45px',    // Tamanho em telas médias
            lg: '55px',    // Tamanho em telas grandes
          },
          width: 'auto',
          maxWidth: '100%',
          transition: 'height 0.3s ease',
        }}
      />
    </Box>
  );
}
