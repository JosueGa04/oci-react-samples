import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
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
  Grid,
  alpha,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const API_URL = "/sprints";
const ISSUES_URL = "/issues";

const SprintForm = ({ sprint, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    sprintTitle: "",
    sprintGoal: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (sprint) {
      // Format dates for input type="date"
      const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toISOString().split("T")[0];
      };

      setFormData({
        sprintTitle: sprint.sprintTitle || "",
        sprintGoal: sprint.sprintGoal || "",
        startDate: formatDate(sprint.startDate),
        endDate: formatDate(sprint.endDate),
      });
    }
  }, [sprint]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        fullWidth
        label="Sprint Title"
        value={formData.sprintTitle}
        onChange={(e) =>
          setFormData({ ...formData, sprintTitle: e.target.value })
        }
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="Sprint Goal"
        value={formData.sprintGoal}
        onChange={(e) =>
          setFormData({ ...formData, sprintGoal: e.target.value })
        }
        margin="normal"
        multiline
        rows={4}
      />
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            type="date"
            label="Start Date"
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            type="date"
            label="End Date"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>
    </form>
  );
};

const Sprints = () => {
  const [sprints, setSprints] = useState([]);
  const [issues, setIssues] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSprints();
    fetchIssues();
  }, []);

  const fetchSprints = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setSprints(data);
        if (data.length > 0 && !selectedSprint) {
          setSelectedSprint(data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching sprints:", error);
    }
  };

  const fetchIssues = async () => {
    try {
      const response = await fetch(ISSUES_URL);
      if (response.ok) {
        const data = await response.json();
        setIssues(data);
      }
    } catch (error) {
      console.error("Error fetching issues:", error);
    }
  };

  const handleSprintChange = (event) => {
    const sprintId = event.target.value;
    const sprint = sprints.find((s) => s.idSprint === sprintId);
    setSelectedSprint(sprint);
  };

  const handleUnlinkIssues = async () => {
    if (!selectedSprint) return;

    try {
      const sprintIssues = issues.filter(
        (issue) =>
          issue.idSprint === selectedSprint.idSprint && issue.status === 1
      );

      for (const issue of sprintIssues) {
        const response = await fetch(`${ISSUES_URL}/${issue.issueId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...issue,
            idSprint: null,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to unlink issue ${issue.issueId}`);
        }
      }

      fetchIssues();
    } catch (error) {
      console.error("Error unlinking issues:", error);
    }
  };

  const isSprintComplete = () => {
    if (!selectedSprint) return false;
    const sprintIssues = issues.filter(
      (issue) => issue.idSprint === selectedSprint.idSprint
    );
    return (
      sprintIssues.length > 0 &&
      sprintIssues.every((issue) => issue.status === 1)
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleOpenDialog = (sprint = null) => {
    setSelectedSprint(sprint);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedSprint(null);
    setOpenDialog(false);
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const url = selectedSprint
        ? `${API_URL}/${selectedSprint.idSprint}`
        : API_URL;
      const method = selectedSprint ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchSprints();
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Error saving sprint:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPieChartData = () => {
    if (!selectedSprint) return [];

    const sprintIssues = issues.filter(
      (issue) => issue.idSprint === selectedSprint.idSprint
    );
    const total = sprintIssues.length;
    const completed = sprintIssues.filter((issue) => issue.status === 1).length;

    return [
      { name: "Completed", value: completed },
      { name: "In Progress", value: total - completed },
    ];
  };

  const pieColors = ["#4caf50", "#ff9800"]; // green for completed, orange for in progress

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
          Sprint Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
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
          New Sprint
        </Button>
      </Box>

      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel>Select Sprint</InputLabel>
        <Select
          value={selectedSprint?.idSprint || ""}
          onChange={handleSprintChange}
          label="Select Sprint"
        >
          {sprints.map((sprint) => (
            <MenuItem key={sprint.idSprint} value={sprint.idSprint}>
              {sprint.sprintTitle || `Sprint ${sprint.idSprint}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedSprint && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: "16px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  height: "100%",
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Sprint Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                      {selectedSprint.sprintTitle || `Sprint ${selectedSprint.idSprint}`}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Start Date:</strong> {formatDate(selectedSprint.startDate)}
                    </Typography>
                    <Typography variant="body1">
                      <strong>End Date:</strong> {formatDate(selectedSprint.endDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Goal:</strong> {selectedSprint.sprintGoal}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", justifyContent: "center", height: "100%", alignItems: "center" }}>
                <PieChart width={300} height={250}>
                  <Pie
                    data={getPieChartData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {getPieChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    payload={getPieChartData().map((entry, index) => ({
                      id: entry.name,
                      type: "square",
                      value: `${entry.name}`,
                      color: pieColors[index % pieColors.length],
                    }))}
                  />
                </PieChart>
              </Box>
            </Grid>
          </Grid>

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
                    Task Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#312d2a" }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#312d2a" }}>
                    Estimation
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#312d2a" }}>
                    Hours Worked
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {issues
                  .filter((issue) => issue.idSprint === selectedSprint.idSprint)
                  .map((issue) => (
                    <TableRow key={issue.issueId}>
                      <TableCell>{issue.issueTitle}</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            issue.status === 1 ? "COMPLETED" : "IN PROGRESS"
                          }
                          color={issue.status === 1 ? "success" : "warning"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{issue.estimation}</TableCell>
                      <TableCell>{issue.hoursWorked}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {isSprintComplete() && (
            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                startIcon={<CheckCircleIcon />}
                onClick={handleUnlinkIssues}
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
                Complete Sprint
              </Button>
            </Box>
          )}
        </>
      )}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
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
            {selectedSprint ? "Edit Sprint" : "Create New Sprint"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <SprintForm
            sprint={selectedSprint}
            onSubmit={handleSubmit}
            onCancel={handleCloseDialog}
          />
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
            onClick={() => document.querySelector("form").requestSubmit()}
            variant="contained"
            disabled={loading}
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
            {selectedSprint ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sprints;
