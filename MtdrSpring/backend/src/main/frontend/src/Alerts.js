/*
 * Component that displays and manages alerts.
 */

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  CircularProgress,
  alpha,
  Tabs,
  Tab,
  Chip,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  MenuItem,
  Select,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import AlertForm from "./AlertForm";
import TaskDelegationForm from "./TaskDelegationForm";
import Moment from "react-moment";

const API_URL = "/alerts";
const ISSUES_URL = "/issues";
const SPRINTS_URL = "/sprints";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [issues, setIssues] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [currentSprint, setCurrentSprint] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDelegationFormOpen, setIsDelegationFormOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [metrics, setMetrics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    averageCompletionTime: 0,
    teamProductivity: 0,
    alertEffectiveness: 0,
  });

  useEffect(() => {
    loadAlerts();
    loadIssues();
    fetchSprints();
  }, []);

  useEffect(() => {
    if (issues.length > 0 && currentSprint) {
      calculateMetrics();
    }
  }, [issues, currentSprint]);

  const fetchSprints = async () => {
    try {
      const response = await fetch(SPRINTS_URL);
      const sprintsData = await response.json();
      setSprints(sprintsData);
      const sortedSprints = sprintsData.sort(
        (a, b) => new Date(b.endDate) - new Date(a.endDate)
      );
      setCurrentSprint(sortedSprints[0]);
    } catch (error) {
      console.error("Error fetching sprints:", error);
    }
  };

  function calculateMetrics() {
    if (!currentSprint) return;

    const now = new Date();
    // Filter issues for current sprint
    const sprintIssues = issues.filter(
      (issue) => issue.idSprint === currentSprint.idSprint
    );

    const completedTasks = sprintIssues.filter(
      (issue) => issue.status === 1
    ).length;
    const pendingTasks = sprintIssues.filter(
      (issue) => issue.status !== 1
    ).length;
    const overdueTasks = sprintIssues.filter(
      (issue) => issue.status !== 1 && new Date(issue.dueDate) < now
    ).length;

    // Calculate average completion time (in days)
    const completedIssues = sprintIssues.filter((issue) => issue.status === 1);
    // Filtra solo issues con fechas válidas
    const validCompletedIssues = completedIssues.filter(
      (issue) =>
        currentSprint &&
        issue.lastUpdateDate &&
        !isNaN(new Date(currentSprint.startDate)) &&
        !isNaN(new Date(issue.lastUpdateDate))
    );

    const totalCompletionTime = validCompletedIssues.reduce((acc, issue) => {
      const startDate = new Date(currentSprint.startDate);
      const endDate = new Date(issue.lastUpdateDate);
      return acc + (endDate - startDate) / (1000 * 60 * 60 * 24);
    }, 0);

    const averageCompletionTime =
      validCompletedIssues.length > 0
        ? totalCompletionTime / validCompletedIssues.length
        : 0;

    // Calculate team productivity (tasks completed today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedToday = completedIssues.filter((issue) => {
      const updated = new Date(issue.lastUpdateDate);
      updated.setHours(0, 0, 0, 0);
      return updated.getTime() === today.getTime();
    }).length;

    // Calculate alert effectiveness (tareas completadas con al menos una alerta)
    const completedWithAlerts = completedIssues.filter((issue) =>
      alerts.some((alert) => alert.taskId === issue.issueId)
    ).length;
    const alertEffectiveness =
      completedIssues.length > 0
        ? (completedWithAlerts / completedIssues.length) * 100
        : 0;

    // LOG: Mostrar fechas de actualización y la fecha de hoy para depuración
    completedIssues.forEach((issue) => {
      const updated = new Date(issue.lastUpdateDate);
      updated.setHours(0, 0, 0, 0);
      console.log(
        "Issue:",
        issue.issueTitle,
        "updatedAt:",
        issue.lastUpdateDate,
        "normalized:",
        updated,
        "today:",
        today
      );
    });

    setMetrics({
      totalTasks: sprintIssues.length,
      completedTasks,
      pendingTasks,
      overdueTasks,
      averageCompletionTime: Math.round(averageCompletionTime * 10) / 10,
      teamProductivity: completedToday,
      alertEffectiveness: Math.round(alertEffectiveness * 10) / 10,
    });
  }

  function loadAlerts() {
    setLoading(true);
    setError(null);

    fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Error en la respuesta: ${response.status} ${response.statusText}`
          );
        }
        return response.json();
      })
      .then((result) => {
        setLoading(false);
        // Sort alerts by scheduledTime in descending order (newest first)
        const sortedAlerts = result.sort(
          (a, b) => new Date(b.scheduledTime) - new Date(a.scheduledTime)
        );
        setAlerts(sortedAlerts);
      })
      .catch((error) => {
        setLoading(false);
        setError(error);
        console.error("Error cargando alertas:", error);
      });
  }

  function loadIssues() {
    fetch(ISSUES_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Error en la respuesta: ${response.status} ${response.statusText}`
          );
        }
        return response.json();
      })
      .then((result) => {
        setIssues(result); // <-- ¡Carga todos los issues!
      })
      .catch((error) => {
        console.error("Error cargando issues:", error);
      });
  }

  function deleteAlert(alertId) {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta alerta?")) {
      fetch(`${API_URL}/${alertId}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Error en la respuesta: ${response.status} ${response.statusText}`
            );
          }
          const remainingAlerts = alerts.filter(
            (alert) => alert.id !== alertId
          );
          setAlerts(remainingAlerts);
          return response;
        })
        .catch((error) => {
          setError(error);
          console.error("Error eliminando alerta:", error);
        });
    }
  }

  function handleAlertCreated(newAlert) {
    setAlerts([newAlert, ...alerts]);
  }

  function openForm(issue = null) {
    setSelectedIssue(issue);
    setIsFormOpen(true);
  }

  function openDelegationForm(issue = null) {
    setSelectedIssue(issue);
    setIsDelegationFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setSelectedIssue(null);
  }

  function closeDelegationForm() {
    setIsDelegationFormOpen(false);
    setSelectedIssue(null);
  }

  function handleDelegationCreated(newDelegation) {
    // Refresh the issues list to show updated assignments
    loadIssues();
  }

  function retryLoadAlerts() {
    loadAlerts();
  }

  function handleTabChange(event, newValue) {
    setCurrentTab(newValue);
  }

  function getDaysUntilDue(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  function getPriorityColor(daysUntilDue) {
    if (daysUntilDue < 0) return "#c74634"; // Overdue
    if (daysUntilDue <= 3) return "#f39c12"; // High priority
    if (daysUntilDue <= 7) return "#27ae60"; // Medium priority
    return "#3498db"; // Low priority
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 4,
          alignItems: "center",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#312d2a",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Alert Management
        </Typography>
        <Box>
          <Select
            value={currentSprint ? currentSprint.idSprint : ""}
            onChange={(e) => {
              const selected = sprints.find(
                (s) => s.idSprint === e.target.value
              );
              setCurrentSprint(selected);
            }}
            displayEmpty
            size="small"
            sx={{ minWidth: 200, background: "#fff", borderRadius: 1 }}
          >
            {sprints.map((sprint) => (
              <MenuItem key={sprint.idSprint} value={sprint.idSprint}>
                {sprint.sprintTitle || `Sprint ${sprint.idSprint}`}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      {/* Sprint Information */}
      {currentSprint && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {currentSprint.sprintTitle || `Sprint ${currentSprint.idSprint}`}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Goal: {currentSprint.sprintGoal}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date(currentSprint.startDate).toLocaleDateString()} -{" "}
            {new Date(currentSprint.endDate).toLocaleDateString()}
          </Typography>
        </Paper>
      )}

      {/* Productivity Metrics Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card
            sx={{
              height: "100%",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                transition: "all 0.3s ease-in-out",
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <CheckCircleIcon sx={{ color: "#27ae60", mr: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Task Completion
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold" }}>
                {metrics.completedTasks}/{metrics.totalTasks}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(metrics.completedTasks / metrics.totalTasks) * 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: alpha("#27ae60", 0.1),
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "#27ae60",
                  },
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {Math.round(
                  (metrics.completedTasks / metrics.totalTasks) * 100
                )}
                % Complete
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card
            sx={{
              height: "100%",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                transition: "all 0.3s ease-in-out",
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <AccessTimeIcon sx={{ color: "#f39c12", mr: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Avg. Completion Time
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold" }}>
                {metrics.averageCompletionTime} days
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {metrics.overdueTasks} tasks overdue
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card
            sx={{
              height: "100%",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                transition: "all 0.3s ease-in-out",
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TrendingUpIcon sx={{ color: "#3498db", mr: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Team Productivity
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold" }}>
                {metrics.teamProductivity}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tasks completed today
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card
            sx={{
              height: "100%",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                transition: "all 0.3s ease-in-out",
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <GroupIcon sx={{ color: "#9b59b6", mr: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Alert Effectiveness
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold" }}>
                {metrics.alertEffectiveness}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tasks completed after alerts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        sx={{
          mb: 3,
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 600,
            fontSize: "1rem",
          },
        }}
      >
        <Tab label="General Alerts" />
        <Tab label="Deadline Tracking" />
        <Tab label="Task Delegation" />
      </Tabs>

      {error && (
        <Box sx={{ color: "red", mb: 2 }}>
          <Typography>Error: {error.message}</Typography>
          <Button
            variant="contained"
            onClick={retryLoadAlerts}
            size="small"
            sx={{
              mt: 1,
              backgroundColor: "#c74634",
              "&:hover": {
                backgroundColor: "#b13d2b",
              },
            }}
          >
            Retry
          </Button>
        </Box>
      )}

      {isLoading ? (
        <Box sx={{ textAlign: "center", p: 3 }}>
          <CircularProgress sx={{ color: "#c74634" }} />
          <Typography>Loading alerts...</Typography>
        </Box>
      ) : (
        <>
          {currentTab === 0 ? (
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                overflow: "hidden",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha("#312d2a", 0.05) }}>
                    <TableCell sx={{ fontWeight: 600, color: "#312d2a" }}>
                      Message
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#312d2a" }}>
                      Task
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#312d2a" }}>
                      Priority
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#312d2a" }}>
                      Scheduled Time
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#312d2a" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {alerts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No alerts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    alerts.map((alert) => (
                      <TableRow
                        key={alert.id}
                        sx={{
                          "&:hover": {
                            backgroundColor: alpha("#c74634", 0.04),
                          },
                          transition: "all 0.2s ease",
                        }}
                      >
                        <TableCell>{alert.message}</TableCell>
                        <TableCell>{alert.task}</TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              color:
                                alert.priority === "HIGH"
                                  ? "#c74634"
                                  : alert.priority === "MEDIUM"
                                  ? "#f39c12"
                                  : "#27ae60",
                              fontWeight: "bold",
                            }}
                          >
                            {alert.priority}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Moment format="MMM Do hh:mm:ss">
                            {alert.scheduledTime}
                          </Moment>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            aria-label="delete"
                            onClick={() => deleteAlert(alert.id)}
                            size="small"
                            sx={{
                              color: "#c74634",
                              "&:hover": {
                                backgroundColor: alpha("#c74634", 0.1),
                              },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          ) : currentTab === 1 ? (
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                overflow: "hidden",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha("#312d2a", 0.05) }}>
                    <TableCell sx={{ fontWeight: 600, color: "#312d2a" }}>
                      Task
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#312d2a" }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#312d2a" }}>
                      Due Date
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#312d2a" }}>
                      Days Remaining
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#312d2a" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {issues.filter((issue) => issue.status !== 1).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No pending tasks found
                      </TableCell>
                    </TableRow>
                  ) : (
                    issues
                      .filter((issue) => issue.status !== 1)
                      .map((issue) => {
                        const daysUntilDue = getDaysUntilDue(issue.dueDate);
                        return (
                          <TableRow
                            key={issue.issueId}
                            sx={{
                              "&:hover": {
                                backgroundColor: alpha("#c74634", 0.04),
                              },
                              transition: "all 0.2s ease",
                            }}
                          >
                            <TableCell>{issue.issueTitle}</TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  issue.status === 1
                                    ? "Completed"
                                    : "In Progress"
                                }
                                color={
                                  issue.status === 1 ? "success" : "warning"
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Moment format="DD/MM/YYYY">
                                {issue.dueDate}
                              </Moment>
                            </TableCell>
                            <TableCell>
                              <Typography
                                sx={{
                                  color: getPriorityColor(daysUntilDue),
                                  fontWeight: "bold",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                {daysUntilDue < 0 ? (
                                  <>
                                    <WarningIcon fontSize="small" />
                                    {Math.abs(daysUntilDue)} days overdue
                                  </>
                                ) : (
                                  `${daysUntilDue} days`
                                )}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => openForm(issue)}
                                sx={{
                                  color: "#c74634",
                                  borderColor: "#c74634",
                                  "&:hover": {
                                    borderColor: "#b13d2b",
                                    backgroundColor: alpha("#c74634", 0.1),
                                  },
                                }}
                              >
                                Create Alert
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                overflow: "hidden",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha("#312d2a", 0.05) }}>
                    <TableCell sx={{ fontWeight: 600, color: "#312d2a" }}>
                      Task
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#312d2a" }}>
                      Current Assignee
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#312d2a" }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#312d2a" }}>
                      Blocked Since
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#312d2a" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {issues.filter((issue) => issue.status !== 1).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No blocked tasks found
                      </TableCell>
                    </TableRow>
                  ) : (
                    issues
                      .filter((issue) => issue.status !== 1)
                      .map((issue) => (
                        <TableRow
                          key={issue.issueId}
                          sx={{
                            "&:hover": {
                              backgroundColor: alpha("#c74634", 0.04),
                            },
                            transition: "all 0.2s ease",
                          }}
                        >
                          <TableCell>{issue.issueTitle}</TableCell>
                          <TableCell>{issue.assignee}</TableCell>
                          <TableCell>
                            <Chip
                              label={issue.blocked ? "Blocked" : "In Progress"}
                              color={issue.blocked ? "error" : "warning"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {issue.blockedSince && (
                              <Moment format="DD/MM/YYYY HH:mm">
                                {issue.blockedSince}
                              </Moment>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => openDelegationForm(issue)}
                              sx={{
                                color: "#c74634",
                                borderColor: "#c74634",
                                "&:hover": {
                                  borderColor: "#b13d2b",
                                  backgroundColor: alpha("#c74634", 0.1),
                                },
                              }}
                            >
                              Delegate Task
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      <Dialog
        open={isFormOpen}
        onClose={closeForm}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            borderBottom: `1px solid ${alpha("#312d2a", 0.1)}`,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, color: "#312d2a" }}>
            Create New Alert
          </Typography>
        </DialogTitle>
        <DialogContent>
          <AlertForm
            onClose={closeForm}
            onAlertCreated={handleAlertCreated}
            selectedIssue={selectedIssue}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDelegationFormOpen}
        onClose={closeDelegationForm}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            borderBottom: `1px solid ${alpha("#312d2a", 0.1)}`,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, color: "#312d2a" }}>
            Delegate Task
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TaskDelegationForm
            onClose={closeDelegationForm}
            onDelegationCreated={handleDelegationCreated}
            selectedIssue={selectedIssue}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Alerts;
