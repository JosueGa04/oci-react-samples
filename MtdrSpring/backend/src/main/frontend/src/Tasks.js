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
  useTheme,
  alpha,
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
    status: 0,
    team: "",
    idSprint: "",
  });

  const theme = useTheme();

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
        idSprint: task.idSprint || "",
        status: task.status || 0, // Mantener el estado existente o establecerlo en 0
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
        idSprint: "",
        status: 0, // Establecer el estado en 0 por defecto
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
    <Box
      sx={{
        p: 4,
        backgroundColor: alpha("#f5f5f5", 0.95),
        minHeight: "100vh",
      }}
    >
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
          Tasks
        </Typography>
        <Button
          variant="contained"
          onClick={() => handleOpenDialog()}
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
          Create New Task
        </Button>
      </Box>

      <Paper
        sx={{
          mt: 2,
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        <List>
          {tasks.map((task) => (
            <ListItem
              key={task.issueId}
              sx={{
                borderBottom: `1px solid ${alpha("#312d2a", 0.1)}`,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: alpha("#c74634", 0.04),
                },
              }}
            >
              <ListItemText
                primary={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: "#312d2a",
                      }}
                    >
                      {task.issueTitle}
                    </Typography>
                    <Chip
                      label={task.status === 1 ? "COMPLETED" : "IN PROGRESS"}
                      color={task.status === 1 ? "success" : "warning"}
                      size="small"
                      sx={{
                        borderRadius: "8px",
                        fontWeight: 600,
                        "& .MuiChip-label": {
                          px: 2,
                        },
                      }}
                    />
                  </Box>
                }
                secondary={
                  <Box sx={{ pl: 1 }}>
                    <Typography
                      component="span"
                      variant="body1"
                      sx={{
                        color: alpha("#312d2a", 0.7),
                        display: "block",
                        mb: 1,
                      }}
                    >
                      {task.issueDescription}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{
                            color: alpha("#312d2a", 0.7),
                            display: "block",
                            mb: 0.5,
                          }}
                        >
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </Typography>
                        {task.idSprint && (
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{
                              color: alpha("#312d2a", 0.7),
                              display: "block",
                              mb: 0.5,
                            }}
                          >
                            Sprint:{" "}
                            {sprints.find((s) => s.idSprint === task.idSprint)
                              ?.sprintGoal || `Sprint ${task.idSprint}`}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{
                            color: alpha("#312d2a", 0.7),
                            display: "block",
                            mb: 0.5,
                          }}
                        >
                          Type: {task.issueType}
                        </Typography>
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{
                            color: alpha("#312d2a", 0.7),
                            display: "block",
                            mb: 0.5,
                          }}
                        >
                          Estimation: {task.estimation} points
                        </Typography>
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{
                            color: alpha("#312d2a", 0.7),
                            display: "block",
                            mb: 0.5,
                          }}
                        >
                          Assignee:{" "}
                          {users.find((u) => u.userId === task.assignee)
                            ?.userName || "Unassigned"}
                        </Typography>
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{
                            color: alpha("#312d2a", 0.7),
                            display: "block",
                          }}
                        >
                          Team: {task.team}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleStatusToggle(task.issueId, task.status)}
                  color={task.status === 1 ? "success" : "default"}
                  sx={{
                    mr: 2,
                    "&:hover": {
                      backgroundColor: alpha(
                        task.status === 1
                          ? theme.palette.success.main
                          : "#c74634",
                        0.1
                      ),
                    },
                  }}
                >
                  {task.status === 1 ? <CheckCircleIcon /> : <CancelIcon />}
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => handleOpenDialog(task)}
                  sx={{
                    mr: 2,
                    color: "#c74634",
                    "&:hover": {
                      backgroundColor: alpha("#c74634", 0.1),
                    },
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => handleDelete(task.issueId)}
                  sx={{
                    color: "#c74634",
                    "&:hover": {
                      backgroundColor: alpha("#c74634", 0.1),
                    },
                  }}
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
            {editingTask ? "Edit Task" : "Create New Task"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  name="issueTitle"
                  value={formData.issueTitle}
                  onChange={handleChange}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      "&:hover fieldset": {
                        borderColor: "#c74634",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#c74634",
                      },
                    },
                  }}
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
                    sx={{
                      borderRadius: "8px",
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#c74634",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#c74634",
                      },
                    }}
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
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      "&:hover fieldset": {
                        borderColor: "#c74634",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#c74634",
                      },
                    },
                  }}
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
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      "&:hover fieldset": {
                        borderColor: "#c74634",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#c74634",
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Estimation</InputLabel>
                  <Select
                    name="estimation"
                    value={formData.estimation}
                    onChange={handleChange}
                    label="Estimation"
                    required
                    sx={{
                      borderRadius: "8px",
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#c74634",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#c74634",
                      },
                    }}
                  >
                    <MenuItem value={1}>1</MenuItem>
                    <MenuItem value={2}>2</MenuItem>
                    <MenuItem value={3}>3</MenuItem>
                    <MenuItem value={4}>4</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Assignee</InputLabel>
                  <Select
                    name="assignee"
                    value={formData.assignee}
                    onChange={handleChange}
                    label="Assignee"
                    sx={{
                      borderRadius: "8px",
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#c74634",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#c74634",
                      },
                    }}
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
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      "&:hover fieldset": {
                        borderColor: "#c74634",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#c74634",
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Sprint</InputLabel>
                  <Select
                    name="idSprint"
                    value={formData.idSprint}
                    onChange={handleChange}
                    label="Sprint"
                    sx={{
                      borderRadius: "8px",
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#c74634",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#c74634",
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {sprints.map((sprint) => (
                      <MenuItem key={sprint.idSprint} value={sprint.idSprint}>
                        {`Sprint ${sprint.idSprint}: ${
                          sprint.sprintGoal || "No goal"
                        }`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: `1px solid ${alpha("#312d2a", 0.1)}`,
          }}
        >
          <Button
            onClick={handleCloseDialog}
            sx={{
              textTransform: "none",
              px: 3,
              color: "#312d2a",
              "&:hover": {
                backgroundColor: alpha("#312d2a", 0.1),
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              textTransform: "none",
              px: 3,
              borderRadius: "8px",
              backgroundColor: "#c74634",
              boxShadow: "0 4px 12px rgba(199, 70, 52, 0.2)",
              "&:hover": {
                backgroundColor: "#b13d2b",
                boxShadow: "0 6px 16px rgba(199, 70, 52, 0.3)",
              },
            }}
          >
            {editingTask ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tasks;

