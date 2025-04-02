import React, { useState } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Sprints from "./Sprints";
import Alerts from "./Alerts";

const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: drawerWidth,
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  })
);

const Dashboard = ({ children }) => {
  const [open, setOpen] = useState(true);
  const [currentView, setCurrentView] = useState("dashboard");

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleNavigation = (view) => {
    setCurrentView(view);
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, view: "dashboard" },
    { text: "Tasks", icon: <AssignmentIcon />, view: "tasks" },
    { text: "Sprints", icon: <TimelineIcon />, view: "sprints" },
    { text: "Alerts", icon: <NotificationsIcon />, view: "alerts" },
    { text: "Settings", icon: <SettingsIcon />, view: "settings" },
  ];

  const renderContent = () => {
    switch (currentView) {
      case "sprints":
        return <Sprints />;
      case "alerts":
        return <Alerts />;
      case "dashboard":
        return children;
      default:
        return <Typography>Coming soon...</Typography>;
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            My Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <Toolbar />
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => handleNavigation(item.view)}
              selected={currentView === item.view}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Main open={open}>
        <Toolbar />
        {renderContent()}
      </Main>
    </Box>
  );
};

export default Dashboard;
