import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box,
  Grid,
  Typography,
} from "@mui/material";

const ISSUES_API_URL = "/issues";
const USERS_API_URL = "/users";

function AlertForm({ onClose, onAlertCreated, selectedIssue = null }) {
  const [alertData, setAlertData] = useState({
    message: "",
    taskId: "",
    task: "",
    projectId: "",
    userId: "",
    priority: "MEDIUM",
    scheduledTime: new Date().toISOString(),
  });

  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [error, setError] = useState(null);
  const [userError, setUserError] = useState(null);

  useEffect(() => {
    loadIssues();
    loadUsers();

    // If a selected issue is provided, pre-fill the form
    if (selectedIssue) {
      setAlertData((prevData) => ({
        ...prevData,
        taskId: selectedIssue.issueId,
        task: selectedIssue.issueTitle,
        projectId: selectedIssue.idSprint || "",
        message: `Recordatorio: La tarea "${
          selectedIssue.issueTitle
        }" vence en ${getDaysUntilDue(selectedIssue.dueDate)} días`,
        priority: getPriorityFromDueDate(selectedIssue.dueDate),
      }));
    }
  }, [selectedIssue]);

  function getDaysUntilDue(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  function getPriorityFromDueDate(dueDate) {
    const daysUntilDue = getDaysUntilDue(dueDate);
    if (daysUntilDue < 0) return "ALTA";
    if (daysUntilDue <= 3) return "ALTA";
    if (daysUntilDue <= 7) return "MEDIA";
    return "BAJA";
  }

  function loadIssues() {
    setIsLoading(true);
    setError(null);

    fetch(ISSUES_API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Error en la respuesta: ${response.status} ${response.statusText}`
          );
        }
        return response.json();
      })
      .then((result) => {
        setIsLoading(false);
        const pendingIssues = result.filter((issue) => !issue.done);
        setIssues(pendingIssues);
      })
      .catch((error) => {
        console.error("Error cargando issues:", error);
        setIsLoading(false);
        setError(error);
      });
  }

  function loadUsers() {
    setIsLoadingUsers(true);
    setUserError(null);

    fetch(USERS_API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Error en la respuesta: ${response.status} ${response.statusText}`
          );
        }
        return response.json();
      })
      .then((result) => {
        setIsLoadingUsers(false);
        setUsers(result);
      })
      .catch((error) => {
        console.error("Error cargando usuarios:", error);
        setIsLoadingUsers(false);
        setUserError(error);
      });
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setAlertData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  function handleIssueSelection(e) {
    const issueId = e.target.value;

    if (!issueId) {
      setAlertData((prevData) => ({
        ...prevData,
        taskId: "",
        task: "",
        projectId: "",
      }));
      return;
    }

    const selectedIssue = issues.find((issue) => issue.issueId === issueId);

    if (selectedIssue) {
      setAlertData((prevData) => ({
        ...prevData,
        taskId: selectedIssue.issueId,
        task: selectedIssue.issueTitle,
        projectId: selectedIssue.idSprint || "",
        message: `Recordatorio: La tarea "${
          selectedIssue.issueTitle
        }" vence en ${getDaysUntilDue(selectedIssue.dueDate)} días`,
        priority: getPriorityFromDueDate(selectedIssue.dueDate),
      }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!alertData.message.trim()) {
      alert("Alert message is required.");
      return;
    }

    if (!alertData.taskId && !alertData.task.trim()) {
      alert(
        "Please select a task or complete the task fields manually."
      );
      return;
    }

    if (!alertData.userId) {
      alert("Please select a user to send the alert to.");
      return;
    }

    const adjustedAlertData = {
      ...alertData,
      scheduledTime: new Date().toISOString(),
    };

    fetch("/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adjustedAlertData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Response error: ${response.status} ${response.statusText}`
          );
        }
        return response.json();
      })
      .then((savedAlert) => {
        console.log("Alert saved:", savedAlert);
        onAlertCreated(savedAlert);
        onClose();
      })
      .catch((error) => {
        console.error("Error saving alert:", error);
        alert("Error saving alert: " + error.message);
      });
  }

  function retryLoadUsers() {
    loadUsers();
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {isLoading ? (
        <Box sx={{ textAlign: "center", p: 3 }}>
          <CircularProgress size={24} />
          <p>Loading tasks...</p>
        </Box>
      ) : error ? (
        <Box sx={{ color: "red", mb: 2 }}>
          <p>Error: {error.message}</p>
          <Button
            variant="contained"
            color="primary"
            onClick={loadIssues}
            size="small"
            sx={{ mt: 1 }}
          >
            Retry
          </Button>
        </Box>
      ) : (
        <FormControl fullWidth margin="normal">
          <InputLabel>Select Task</InputLabel>
          <Select
            name="selectedTask"
            value={alertData.taskId}
            onChange={handleIssueSelection}
          >
            <MenuItem value="">-- Select a task --</MenuItem>
            {issues.map((issue) => (
              <MenuItem key={issue.issueId} value={issue.issueId}>
                {issue.issueTitle}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <TextField
        fullWidth
        margin="normal"
        label="Alert Message"
        name="message"
        value={alertData.message}
        onChange={handleChange}
        required
        multiline
        rows={4}
      />

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Task ID"
            name="taskId"
            value={alertData.taskId}
            onChange={handleChange}
            disabled={!error}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Task"
            name="task"
            value={alertData.task}
            onChange={handleChange}
            disabled={!error}
            required={error}
          />
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>User</InputLabel>
            {isLoadingUsers ? (
              <Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
                <CircularProgress size={24} />
                <Typography variant="caption" sx={{ ml: 1 }}>
                  Loading users...
                </Typography>
              </Box>
            ) : userError ? (
              <Box>
                <Typography color="error" variant="caption">
                  Error loading users: {userError.message}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={retryLoadUsers}
                  sx={{ mt: 1, display: "block" }}
                >
                  Retry
                </Button>
              </Box>
            ) : (
              <Select
                name="userId"
                value={alertData.userId}
                onChange={handleChange}
                required
              >
                <MenuItem value="">-- Select a user --</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.userId} value={user.userId.toString()}>
                    {user.userName}
                  </MenuItem>
                ))}
              </Select>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              name="priority"
              value={alertData.priority}
              onChange={handleChange}
            >
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", gap: 2, mt: 3, justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          sx={{ minWidth: "120px" }}
        >
          Send Alert
        </Button>
      </Box>
    </Box>
  );
}

export default AlertForm;
