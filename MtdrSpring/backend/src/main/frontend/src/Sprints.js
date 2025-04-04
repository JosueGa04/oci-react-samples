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
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";

const API_URL = "/sprints";

const SprintForm = ({ sprint, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
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
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSprints = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setSprints(data);
      }
    } catch (error) {
      console.error("Error fetching sprints:", error);
    }
  };

  useEffect(() => {
    fetchSprints();
  }, []);

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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sprint?")) {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          fetchSprints();
        }
      } catch (error) {
        console.error("Error deleting sprint:", error);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

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
          Sprints Management
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
                ID
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#312d2a" }}>
                Sprint Goal
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#312d2a" }}>
                Start Date
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#312d2a" }}>
                End Date
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#312d2a" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sprints.map((sprint) => (
              <TableRow
                key={sprint.idSprint}
                sx={{
                  "&:hover": {
                    backgroundColor: alpha("#c74634", 0.04),
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <TableCell>{sprint.idSprint}</TableCell>
                <TableCell>{sprint.sprintGoal}</TableCell>
                <TableCell>{formatDate(sprint.startDate)}</TableCell>
                <TableCell>{formatDate(sprint.endDate)}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenDialog(sprint)}
                    sx={{
                      color: "#c74634",
                      "&:hover": {
                        backgroundColor: alpha("#c74634", 0.1),
                      },
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(sprint.idSprint)}
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
