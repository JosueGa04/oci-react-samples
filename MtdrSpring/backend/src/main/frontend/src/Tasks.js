import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";

const API_URL = "/issues";
const SPRINTS_URL = "/sprints";
const USERS_URL = "/users";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    issueTitle: "",
    issueDescription: "",
    dueDate: "",
    issueType: "",
    estimation: "",
    assignee: "",
    team: "",
    sprintID: "",
  });

  useEffect(() => {
    fetchTasks();
    fetchSprints();
    fetchUsers();
  }, []);

  const fetchSprints = async () => {
    try {
      const response = await fetch(SPRINTS_URL);
      const data = await response.json();
      setSprints(data);
    } catch (error) {
      console.error("Error fetching sprints:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(USERS_URL);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleOpenDialog = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        issueTitle: task.issueTitle,
        issueDescription: task.issueDescription,
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : "",
        issueType: task.issueType,
        estimation: task.estimation,
        assignee: task.assignee ? task.assignee.toString() : "",
        team: task.team,
        sprintID: task.sprintID || "",
      });
    } else {
      setEditingTask(null);
      setFormData({
        issueTitle: "",
        issueDescription: "",
        dueDate: "",
        issueType: "",
        estimation: "",
        assignee: "",
        team: "",
        sprintID: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTask(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingTask ? `${API_URL}/${editingTask.issueId}` : API_URL;

      const method = editingTask ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchTasks();
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleStatusToggle = async (taskId, currentStatus) => {
    try {
      const task = tasks.find((t) => t.issueId === taskId);
      const updatedTask = {
        ...task,
        status: currentStatus === 0 ? 1 : 0,
      };

      const response = await fetch(`${API_URL}/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTask),
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Tasks</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Create New Task
        </Button>
      </Box>

      <Paper sx={{ mt: 2 }}>
        <List>
          {tasks.map((task) => (
            <ListItem key={task.issueId}>
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="subtitle1">
                      {task.issueTitle}
                    </Typography>
                    <Chip
                      label={task.status === 1 ? "COMPLETED" : "NON-COMPLETED"}
                      color={task.status === 1 ? "success" : "default"}
                      size="small"
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Typography component="span" variant="body2">
                      {task.issueDescription}
                    </Typography>
                    <br />
                    <Typography component="span" variant="body2">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </Typography>
                    {task.sprintID && (
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ display: "block" }}
                      >
                        Sprint:{" "}
                        {sprints.find((s) => s.idSprint === task.sprintID)
                          ?.sprintName || "Unknown Sprint"}
                      </Typography>
                    )}
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ display: "block" }}
                    >
                      Type: {task.issueType}
                    </Typography>
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ display: "block" }}
                    >
                      Estimation: {task.estimation} points
                    </Typography>
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ display: "block" }}
                    >
                      Assignee:{" "}
                      {users.find((u) => u.userId === task.assignee)
                        ?.userName || "Unassigned"}
                    </Typography>
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ display: "block" }}
                    >
                      Team: {task.team}
                    </Typography>
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleStatusToggle(task.issueId, task.status)}
                  color={task.status === 1 ? "success" : "default"}
                  sx={{ mr: 2 }}
                >
                  {task.status === 1 ? <CheckCircleIcon /> : <CancelIcon />}
                </IconButton>
                <IconButton edge="end" onClick={() => handleOpenDialog(task)}>
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => handleDelete(task.issueId)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingTask ? "Edit Task" : "Create New Task"}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  name="issueTitle"
                  value={formData.issueTitle}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Issue Type</InputLabel>
                  <Select
                    name="issueType"
                    value={formData.issueType}
                    onChange={handleChange}
                    label="Issue Type"
                    required
                  >
                    <MenuItem value="EPIC">Epic</MenuItem>
                    <MenuItem value="STORY">Story</MenuItem>
                    <MenuItem value="TASK">Task</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="issueDescription"
                  value={formData.issueDescription}
                  onChange={handleChange}
                  multiline
                  rows={4}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Due Date"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Estimation"
                  name="estimation"
                  type="number"
                  value={formData.estimation}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Assignee</InputLabel>
                  <Select
                    name="assignee"
                    value={formData.assignee}
                    onChange={handleChange}
                    label="Assignee"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {users.map((user) => (
                      <MenuItem key={user.userId} value={user.userId}>
                        {user.userName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Team"
                  name="team"
                  value={formData.team}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Sprint</InputLabel>
                  <Select
                    name="sprintID"
                    value={formData.sprintID}
                    onChange={handleChange}
                    label="Sprint"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {sprints.map((sprint) => (
                      <MenuItem key={sprint.idSprint} value={sprint.idSprint}>
                        {`Sprint ${sprint.idSprint} - ${sprint.sprintGoal}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingTask ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tasks;
