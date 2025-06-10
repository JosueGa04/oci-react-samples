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
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import AlertForm from "./AlertForm";
import Moment from "react-moment";

const API_URL = "/alerts";
const ISSUES_URL = "/issues";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [issues, setIssues] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedIssue, setSelectedIssue] = useState(null);

  useEffect(() => {
    loadAlerts();
    loadIssues();
  }, []);

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
        setAlerts(result);
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
        // Filter only non-completed issues
        const pendingIssues = result.filter((issue) => issue.status !== 1);
        setIssues(pendingIssues);
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

  function closeForm() {
    setIsFormOpen(false);
    setSelectedIssue(null);
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
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openForm()}
          sx={{
            backgroundColor: "#c74634",
            borderRadius: "12px",
            textTransform: "none",
            px: 3,
            py: 1,
            boxShadow: "0 4px 12px rgba(199, 70, 52, 0.2)",
            "&:hover": {
              backgroundColor: "#b13d2b",
              transform: "translateY(-2px)",
              boxShadow: "0 6px 16px rgba(199, 70, 52, 0.3)",
            },
            transition: "all 0.2s ease-in-out",
          }}
        >
          New Alert
        </Button>
      </Box>

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
                  {issues.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No pending tasks found
                      </TableCell>
                    </TableRow>
                  ) : (
                    issues.map((issue) => {
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
                              color={issue.status === 1 ? "success" : "warning"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Moment format="DD/MM/YYYY">{issue.dueDate}</Moment>
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
    </Box>
  );
}

export default Alerts;
