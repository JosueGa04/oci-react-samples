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
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Sprints Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          New Sprint
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Sprint Goal</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sprints.map((sprint) => (
              <TableRow key={sprint.idSprint}>
                <TableCell>{sprint.idSprint}</TableCell>
                <TableCell>{sprint.sprintGoal}</TableCell>
                <TableCell>{formatDate(sprint.startDate)}</TableCell>
                <TableCell>{formatDate(sprint.endDate)}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(sprint)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(sprint.idSprint)}>
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
      >
        <DialogTitle>
          {selectedSprint ? "Edit Sprint" : "Create New Sprint"}
        </DialogTitle>
        <DialogContent>
          <SprintForm
            sprint={selectedSprint}
            onSubmit={handleSubmit}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={() => document.querySelector("form").requestSubmit()}
            variant="contained"
            disabled={loading}
          >
            {selectedSprint ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sprints;
