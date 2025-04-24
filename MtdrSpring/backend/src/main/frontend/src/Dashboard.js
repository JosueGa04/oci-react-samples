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
  Assessment as AssessmentIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Sprints from "./Sprints";
import Tasks from "./Tasks";
import Alerts from "./Alerts";
import Reports from "./Reports";

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
    { text: "Backlog", icon: <AssignmentIcon />, view: "tasks" },
    { text: "Sprints", icon: <TimelineIcon />, view: "sprints" },
    { text: "Reports", icon: <AssessmentIcon />, view: "reports" },
    { text: "Alerts", icon: <NotificationsIcon />, view: "alerts" },
    { text: "Settings", icon: <SettingsIcon />, view: "settings" },
  ];

  const renderContent = () => {
    switch (currentView) {
      case "sprints":
        return <Sprints />;
      case "alerts":
        return <Alerts />;
      case "tasks":
        return <Tasks />;
      case "reports":
        return <Reports />;
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
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "#312d2a",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
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
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              component="img"
              src="https://brandlogos.net/wp-content/uploads/2021/10/oracle-logo-symbol-vector-512x512.png"
              alt="Oracle Logo"
              sx={{
                height: 40,
                width: 40,
                mr: 2,
                filter: "brightness(0) invert(1)",
              }}
            />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ color: "#fff" }}
            >
              My Dashboard
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#312d2a",
            color: "#fff",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <Toolbar />
        <Divider sx={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => handleNavigation(item.view)}
              selected={currentView === item.view}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "#c74634",
                  "&:hover": {
                    backgroundColor: "#c74634",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "#fff",
                  },
                },
                "&:hover": {
                  backgroundColor: "rgba(199, 70, 52, 0.1)",
                },
                "& .MuiListItemIcon-root": {
                  color: "#fff",
                },
              }}
            >
              <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
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
