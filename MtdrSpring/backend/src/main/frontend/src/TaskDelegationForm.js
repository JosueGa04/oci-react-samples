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
const ISSUES_API_URL = "/issues";
const ALERTS_API_URL = "/alerts";

function TaskDelegationForm({
  onClose,
  onDelegationCreated,
  selectedIssue = null,
}) {
  const [delegationData, setDelegationData] = useState({
    taskId: "",
    taskTitle: "",
    currentAssignee: "Loading...",
    currentAssigneeId: "",
    newAssignee: "",
    delegationReason: "",
    priority: "MEDIUM",
  });

  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState(null);

  // Load users first
  useEffect(() => {
    loadUsers();
  }, []);

  // Update current assignee when users are loaded
  useEffect(() => {
    if (selectedIssue && users.length > 0) {
      const currentAssigneeUser = users.find(
        (user) => user.userId.toString() === selectedIssue.assignee?.toString()
      );

      setDelegationData((prevData) => ({
        ...prevData,
        taskId: selectedIssue.issueId,
        taskTitle: selectedIssue.issueTitle,
        currentAssignee: currentAssigneeUser
          ? currentAssigneeUser.userName
          : "Unassigned",
        currentAssigneeId: selectedIssue.assignee?.toString() || "",
      }));
    }
  }, [selectedIssue, users]);

  function loadUsers() {
    setIsLoadingUsers(true);
    setError(null);

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
        setError(error);
        setIsLoadingUsers(false);
      });
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setDelegationData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!delegationData.newAssignee) {
      alert("Please select a new assignee for the task.");
      return;
    }

    if (!delegationData.delegationReason.trim()) {
      alert("Please provide a reason for the delegation.");
      return;
    }

    // First, update the issue with the new assignee
    fetch(`${ISSUES_API_URL}/${delegationData.taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...selectedIssue,
        assignee: delegationData.newAssignee,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Response error: ${response.status} ${response.statusText}`
          );
        }
        return response.json();
      })
      .then((updatedIssue) => {
        // Then, create an alert for the new assignee
        const alertData = {
          message: `Task "${delegationData.taskTitle}" has been assigned to you. Reason: ${delegationData.delegationReason}`,
          taskId: delegationData.taskId,
          task: delegationData.taskTitle,
          userId: delegationData.newAssignee,
          priority: delegationData.priority,
          scheduledTime: new Date().toISOString(),
          status: "PENDING",
        };

        return fetch(ALERTS_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(alertData),
        });
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
        console.log("Task delegated and alert created:", savedAlert);
        onDelegationCreated(savedAlert);
        onClose();
      })
      .catch((error) => {
        console.error("Error in delegation process:", error);
        alert("Error in delegation process: " + error.message);
      });
  }

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
            value={delegationData.taskTitle}
            disabled
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Current Assignee"
            value={delegationData.currentAssignee}
            disabled
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Delegation Details
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>New Assignee</InputLabel>
            {isLoadingUsers ? (
              <Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
                <CircularProgress size={24} />
                <Typography variant="caption" sx={{ ml: 1 }}>
                  Loading users...
                </Typography>
              </Box>
            ) : error ? (
              <Box>
                <Typography color="error" variant="caption">
                  Error loading users: {error.message}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={loadUsers}
                  sx={{ mt: 1, display: "block" }}
                >
                  Retry
                </Button>
              </Box>
            ) : (
              <Select
                name="newAssignee"
                value={delegationData.newAssignee}
                onChange={handleChange}
                required
              >
                <MenuItem value="">-- Select new assignee --</MenuItem>
                {users
                  .filter(
                    (user) =>
                      user.userId.toString() !==
                      delegationData.currentAssigneeId
                  )
                  .map((user) => (
                    <MenuItem key={user.userId} value={user.userId.toString()}>
                      {user.userName}
                    </MenuItem>
                  ))}
              </Select>
            )}
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              name="priority"
              value={delegationData.priority}
              onChange={handleChange}
            >
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Delegation Reason"
            name="delegationReason"
            value={delegationData.delegationReason}
            onChange={handleChange}
            multiline
            rows={3}
            required
            placeholder="Explain why you are delegating this task..."
          />
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
          Delegate Task
        </Button>
      </Box>
    </Box>
  );
}

export default TaskDelegationForm;
