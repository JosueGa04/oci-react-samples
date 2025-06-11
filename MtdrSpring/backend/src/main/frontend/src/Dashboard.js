import React, { useState, useEffect } from "react";
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
  Paper,
  Grid,
  CircularProgress,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Bolt as BoltIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
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

const DashboardView = () => {
  const [currentSprint, setCurrentSprint] = useState(null);
  const [sprintIssues, setSprintIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentSprint();
  }, []);

  const fetchCurrentSprint = async () => {
    try {
      const response = await fetch("/sprints");
      const sprints = await response.json();

      // Sort sprints by end date and get the latest one
      const sortedSprints = sprints.sort(
        (a, b) => new Date(b.endDate) - new Date(a.endDate)
      );
      const latestSprint = sortedSprints[0];

      if (latestSprint) {
        setCurrentSprint(latestSprint);
        fetchSprintIssues(latestSprint.idSprint);
      }
    } catch (error) {
      console.error("Error fetching current sprint:", error);
    }
  };

  const fetchSprintIssues = async (sprintId) => {
    try {
      const response = await fetch("/issues");
      const issues = await response.json();
      const sprintIssues = issues.filter(
        (issue) => issue.idSprint === sprintId
      );
      setSprintIssues(sprintIssues);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching sprint issues:", error);
    }
  };

  const getPieChartData = () => {
    if (!sprintIssues.length) return [];

    const completed = sprintIssues.filter((issue) => issue.status === 1).length;
    const inProgress = sprintIssues.length - completed;

    return [
      { name: "Completed", value: completed },
      { name: "In Progress", value: inProgress },
    ];
  };

  const getBarChartData = () => {
    if (!sprintIssues.length) return [];

    const issuesByType = sprintIssues.reduce((acc, issue) => {
      const type = issue.issueType || "Unspecified";
      if (!acc[type]) {
        acc[type] = { completed: 0, inProgress: 0 };
      }
      if (issue.status === 1) {
        acc[type].completed++;
      } else {
        acc[type].inProgress++;
      }
      return acc;
    }, {});

    return Object.entries(issuesByType).map(([type, data]) => ({
      type,
      completed: data.completed,
      inProgress: data.inProgress,
    }));
  };

  const COLORS = ["#4caf50", "#ff9800"];

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: "#312d2a",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          mb: 4,
          borderBottom: "2px solid #c74634",
          pb: 1,
          display: "inline-block",
        }}
      >
        Dashboard
      </Typography>

      {currentSprint ? (
        <>
          <Paper
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <Typography
              variant="h5"
              sx={{ mb: 2, color: "#312d2a", fontWeight: 600 }}
            >
              {currentSprint.sprintTitle || `Sprint ${currentSprint.idSprint}`}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1, color: "#666" }}>
              Goal: {currentSprint.sprintGoal}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date(currentSprint.startDate).toLocaleDateString()} -{" "}
              {new Date(currentSprint.endDate).toLocaleDateString()}
            </Typography>
          </Paper>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  height: "100%",
                  borderRadius: 2,
                  background:
                    "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ mb: 2, color: "#312d2a", fontWeight: 600 }}
                >
                  Sprint Progress
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getPieChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {getPieChartData().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  height: "100%",
                  borderRadius: 2,
                  background:
                    "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ mb: 2, color: "#312d2a", fontWeight: 600 }}
                >
                  Issues by Type
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getBarChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="type" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(255, 255, 255, 0.9)",
                          border: "none",
                          borderRadius: "8px",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="completed"
                        name="Completed"
                        fill="#4caf50"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="inProgress"
                        name="In Progress"
                        fill="#ff9800"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2,
                  background:
                    "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ mb: 2, color: "#312d2a", fontWeight: 600 }}
                >
                  Sprint Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Paper
                      sx={{
                        p: 2,
                        textAlign: "center",
                        bgcolor: "#f8f9fa",
                        borderRadius: 2,
                        transition: "transform 0.2s",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      <Typography
                        variant="h4"
                        color="primary"
                        sx={{ fontWeight: 600 }}
                      >
                        {sprintIssues.length}
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#666" }}>
                        Total Issues
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper
                      sx={{
                        p: 2,
                        textAlign: "center",
                        bgcolor: "#f8f9fa",
                        borderRadius: 2,
                        transition: "transform 0.2s",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      <Typography
                        variant="h4"
                        color="success.main"
                        sx={{ fontWeight: 600 }}
                      >
                        {
                          sprintIssues.filter((issue) => issue.status === 1)
                            .length
                        }
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#666" }}>
                        Completed Issues
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper
                      sx={{
                        p: 2,
                        textAlign: "center",
                        bgcolor: "#f8f9fa",
                        borderRadius: 2,
                        transition: "transform 0.2s",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      <Typography
                        variant="h4"
                        color="warning.main"
                        sx={{ fontWeight: 600 }}
                      >
                        {
                          sprintIssues.filter((issue) => issue.status === 0)
                            .length
                        }
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#666" }}>
                        In Progress Issues
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </>
      ) : (
        <Typography variant="h6" color="text.secondary">
          No active sprint found
        </Typography>
      )}
    </Box>
  );
};

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
    { text: "Actions", icon: <BoltIcon />, view: "alerts" },
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
        return <DashboardView />;
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
