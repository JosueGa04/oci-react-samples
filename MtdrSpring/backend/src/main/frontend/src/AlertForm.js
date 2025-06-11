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

  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [userError, setUserError] = useState(null);

  // Load users first
  useEffect(() => {
    loadUsers();
  }, []);

  // Update form data when users are loaded and issue is selected
  useEffect(() => {
    if (selectedIssue && users.length > 0) {
      const assignedUser = users.find(
        (user) => user.userId.toString() === selectedIssue.assignee?.toString()
      );

      setAlertData((prevData) => ({
        ...prevData,
        taskId: selectedIssue.issueId,
        task: selectedIssue.issueTitle,
        projectId: selectedIssue.idSprint || "",
        userId: assignedUser ? assignedUser.userId.toString() : "",
        message: `Recordatorio: La tarea "${
          selectedIssue.issueTitle
        }" vence en ${getDaysUntilDue(selectedIssue.dueDate)} días`,
        priority: getPriorityFromDueDate(selectedIssue.dueDate),
      }));
    }
  }, [selectedIssue, users]);

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
        setUsers(result);
        setIsLoadingUsers(false);
      })
      .catch((error) => {
        console.error("Error cargando usuarios:", error);
        setUserError(error);
        setIsLoadingUsers(false);
      });
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setAlertData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!alertData.message.trim()) {
      alert("Alert message is required.");
      return;
    }

    if (!alertData.taskId && !alertData.task.trim()) {
      alert("Please select a task or complete the task fields manually.");
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

  // Find the assigned user's name
  const assignedUser = users.find(
    (user) => user.userId.toString() === alertData.userId
  );

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Task Information
          </Typography>
          <TextField
            fullWidth
            label="Task Title"
            value={alertData.task}
            disabled
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Assigned User"
            value={assignedUser ? assignedUser.userName : "Loading..."}
            disabled
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Alert Details
          </Typography>
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

          <FormControl fullWidth sx={{ mt: 2 }}>
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
        <Button variant="outlined" onClick={onClose} sx={{ minWidth: "120px" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          type="submit"
          sx={{
            minWidth: "120px",
            backgroundColor: "#c74634",
            "&:hover": {
              backgroundColor: "#b13d2b",
            },
          }}
        >
          Send Alert
        </Button>
      </Box>
    </Box>
  );
}

export default AlertForm;
