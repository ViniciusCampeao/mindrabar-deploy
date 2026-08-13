import { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import TableManagement from "./Tables";
import MenuItems from "./MenuItems";
import TableSummary from "./TableSummary";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}


import { Paper, Typography, Container } from "@mui/material";

export default function Dashboard() {
  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ borderRadius: 4, p: { xs: 2, md: 4 } }}>
        <Typography variant="h4" fontWeight={700} color="primary.main" mb={3}>
          Painel de Controle
        </Typography>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs value={value} onChange={handleChange} aria-label="dashboard tabs" variant="scrollable" scrollButtons="auto">
            <Tab label="Gerenciar Mesas" />
            <Tab label="Gerenciar Itens" />
            <Tab label="Resumo de Mesas" />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <TableManagement />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <MenuItems />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <TableSummary />
        </TabPanel>
      </Paper>
    </Container>
  );
}
