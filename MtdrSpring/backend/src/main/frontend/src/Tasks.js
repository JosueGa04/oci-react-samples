import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
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

  // Filtros
  const [filterSprint, setFilterSprint] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [filterTeam, setFilterTeam] = useState("");

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
        status: task.status || 0,
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
        status: 0,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTask(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingTask ? `${API_URL}/${editingTask.issueId}` : API_URL;
      const method = editingTask ? "PUT" : "POST";

      let bodyData = { ...formData };
      if (editingTask && editingTask.hoursWorked !== undefined) {
        bodyData.hoursWorked = editingTask.hoursWorked;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
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

  // Filtrado de tareas
  const filteredTasks = tasks.filter((task) => {
    let match = true;
    if (filterSprint && String(task.idSprint) !== String(filterSprint))
      match = false;
    if (filterAssignee && String(task.assignee) !== String(filterAssignee))
      match = false;
    if (filterTeam && String(task.team) !== String(filterTeam)) match = false;
    return match;
  });

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2, md: 3 },
        width: "100%",
        margin: "0",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 3,
          gap: 2,
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
          Backlog
        </Typography>
        <Button
          variant="contained"
          onClick={() => handleOpenDialog()}
          sx={{
            backgroundColor: "#c74634",
            "&:hover": {
              backgroundColor: "#b13d2b",
            },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          Add Task
        </Button>
      </Box>

      {/* Filtros */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Sprint</InputLabel>
            <Select
              value={filterSprint}
              label="Sprint"
              onChange={(e) => setFilterSprint(e.target.value)}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              {sprints.map((sprint) => (
                <MenuItem key={sprint.idSprint} value={sprint.idSprint}>
                  {sprint.sprintTitle || `Sprint ${sprint.idSprint}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Assignee</InputLabel>
            <Select
              value={filterAssignee}
              label="Assignee"
              onChange={(e) => setFilterAssignee(e.target.value)}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              {users.map((user) => (
                <MenuItem key={user.userId} value={user.userId}>
                  {user.userName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Team</InputLabel>
            <Select
              value={filterTeam}
              label="Team"
              onChange={(e) => setFilterTeam(e.target.value)}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              {[...new Set(tasks.map((t) => t.team).filter(Boolean))].map(
                (team) => (
                  <MenuItem key={team} value={team}>
                    {team}
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Paper
        sx={{
          mt: 2,
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          overflow: "hidden",
          width: "100%",
        }}
      >
        {/* Modified TableContainer to properly handle overflow */}
        <TableContainer sx={{ width: "100%" }}>
          <Table
            sx={{
              minWidth: 650, // Ensures table has a minimum width
              width: "100%",
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: "20%" }}>Title</TableCell>
                <TableCell sx={{ width: "20%" }}>Description</TableCell>
                <TableCell sx={{ width: "10%" }}>Type</TableCell>
                <TableCell sx={{ width: "10%" }}>Estimation</TableCell>
                <TableCell sx={{ width: "10%" }}>Status</TableCell>
                <TableCell sx={{ width: "10%" }}>Assignee</TableCell>
                <TableCell sx={{ width: "10%" }}>Team</TableCell>
                <TableCell sx={{ width: "10%" }}>Sprint</TableCell>
                <TableCell sx={{ width: "10%" }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.issueId}>
                  <TableCell
                    sx={{
                      maxWidth: 150,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {task.issueTitle}
                  </TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 150,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {task.issueDescription}
                  </TableCell>
                  <TableCell>{task.issueType}</TableCell>
                  <TableCell>{task.estimation}</TableCell>
                  <TableCell>
                    <Chip
                      label={task.status === 1 ? "COMPLETED" : "IN PROGRESS"}
                      color={task.status === 1 ? "success" : "warning"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 100,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {users.find((u) => u.userId === task.assignee)?.userName ||
                      "Unassigned"}
                  </TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 100,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {task.team}
                  </TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 100,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {sprints.find((s) => s.idSprint === task.idSprint)
                      ?.sprintTitle || "No Sprint"}
                  </TableCell>
                  <TableCell align="center">
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 0.5,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleStatusToggle(task.issueId, task.status)
                        }
                        color={task.status === 1 ? "success" : "default"}
                      >
                        {task.status === 1 ? (
                          <CheckCircleIcon fontSize="small" />
                        ) : (
                          <CancelIcon fontSize="small" />
                        )}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(task)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(task.issueId)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
                    <MenuItem value="Epic">Epic</MenuItem>
                    <MenuItem value="Story">Story</MenuItem>
                    <MenuItem value="Task">Task</MenuItem>
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
                        {sprint.sprintTitle || `Sprint ${sprint.idSprint}`}
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
