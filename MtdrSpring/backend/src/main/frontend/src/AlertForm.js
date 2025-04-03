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
} from "@mui/material";

const ISSUES_API_URL = "/issues";

function AlertForm(props) {
  const [alertData, setAlertData] = useState({
    message: "",
    taskId: "",
    task: "",
    projectId: "",
    userId: "",
    priority: "MEDIA",
    scheduledTime: new Date().toISOString().slice(0, 16),
  });

  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadIssues();
  }, []);

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
        // Filter only non-completed issues
        const pendingIssues = result.filter((issue) => !issue.done);
        setIssues(pendingIssues);
      })
      .catch((error) => {
        console.error("Error cargando issues:", error);
        setIsLoading(false);
        setError(error);
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
        userId: "",
      }));
      return;
    }

    const selectedIssue = issues.find((issue) => issue.issueId === issueId);

    if (selectedIssue) {
      setAlertData((prevData) => ({
        ...prevData,
        taskId: selectedIssue.issueId,
        task: selectedIssue.issueTitle,
        projectId: selectedIssue.idSprint || "", // Using sprint ID as project ID
      }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!alertData.message.trim()) {
      alert("El mensaje de alerta es obligatorio.");
      return;
    }

    if (!alertData.taskId && !alertData.task.trim()) {
      alert(
        "Por favor, seleccione una tarea o complete los campos de tarea manualmente."
      );
      return;
    }

    const adjustedAlertData = {
      ...alertData,
      scheduledTime: new Date(alertData.scheduledTime).toISOString(),
    };

    fetch("/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adjustedAlertData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Error en la respuesta: ${response.status} ${response.statusText}`
          );
        }
        return response.json();
      })
      .then((savedAlert) => {
        console.log("Alerta guardada:", savedAlert);
        props.onAlertCreated(savedAlert);
        props.onClose();
      })
      .catch((error) => {
        console.error("Error al guardar la alerta:", error);
        alert("Error al guardar la alerta: " + error.message);
      });
  }

  function handleSendNow(e) {
    e.preventDefault();
    if (!alertData.message.trim()) {
      alert("El mensaje de alerta es obligatorio.");
      return;
    }

    if (!alertData.taskId && !alertData.task.trim()) {
      alert(
        "Por favor, seleccione una tarea o complete los campos de tarea manualmente."
      );
      return;
    }

    const immediateAlertData = {
      ...alertData,
      scheduledTime: new Date().toISOString(),
    };

    fetch("/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(immediateAlertData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Error en la respuesta: ${response.status} ${response.statusText}`
          );
        }
        return response.json();
      })
      .then((savedAlert) => {
        console.log("Alerta enviada inmediatamente:", savedAlert);
        props.onAlertCreated(savedAlert);
        props.onClose();
      })
      .catch((error) => {
        console.error("Error al enviar la alerta:", error);
        alert("Error al enviar la alerta: " + error.message);
      });
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {isLoading ? (
        <Box sx={{ textAlign: "center", p: 3 }}>
          <CircularProgress size={24} />
          <p>Cargando tareas...</p>
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
            Reintentar
          </Button>
        </Box>
      ) : (
        <FormControl fullWidth margin="normal">
          <InputLabel>Seleccionar Tarea</InputLabel>
          <Select
            name="selectedTask"
            value={alertData.taskId}
            onChange={handleIssueSelection}
          >
            <MenuItem value="">-- Seleccionar una tarea --</MenuItem>
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
        label="Mensaje de Alerta"
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
            label="Tarea"
            name="task"
            value={alertData.task}
            onChange={handleChange}
            disabled={!error}
            required={error}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Project ID"
            name="projectId"
            value={alertData.projectId}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="User ID"
            name="userId"
            value={alertData.userId}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Prioridad</InputLabel>
            <Select
              name="priority"
              value={alertData.priority}
              onChange={handleChange}
            >
              <MenuItem value="BAJA">Baja</MenuItem>
              <MenuItem value="MEDIA">Media</MenuItem>
              <MenuItem value="ALTA">Alta</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Fecha Programada"
            name="scheduledTime"
            type="datetime-local"
            value={alertData.scheduledTime}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", gap: 2, mt: 3, justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendNow}
          sx={{ minWidth: "120px" }}
        >
          Enviar Ahora
        </Button>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          sx={{ minWidth: "120px" }}
        >
          Programar
        </Button>
      </Box>
    </Box>
  );
}

export default AlertForm;
