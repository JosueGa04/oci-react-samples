import React, { useState } from "react";
import Button from "@mui/material/Button";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

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

  function handleChange(e) {
    const { name, value } = e.target;
    setAlertData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!alertData.message.trim() || !alertData.task.trim()) {
      alert("El mensaje y la tarea son obligatorios.");
      return;
    }

    // Convertir a ISO con zona horaria UTC
    const adjustedAlertData = {
      ...alertData,
      scheduledTime: new Date(alertData.scheduledTime).toISOString(),
    };

    // **Solo guardar la alerta en la BD, el backend se encarga de enviarla a Telegram**
    fetch("/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adjustedAlertData),
    })
      .then((response) => response.json())
      .then((savedAlert) => {
        console.log("Alerta guardada en la base de datos:", savedAlert);
        props.onAlertCreated(savedAlert);

        // Reset del formulario
        setAlertData({
          message: "",
          taskId: "",
          task: "",
          projectId: "",
          userId: "",
          priority: "MEDIA",
          scheduledTime: new Date().toISOString().slice(0, 16),
        });

        // Cerrar el formulario
        props.onClose();
      })
      .catch((error) => {
        console.error("Error al guardar la alerta:", error);
        alert("Error al guardar la alerta: " + error.message);
      });
  }

  return (
    <div className="alert-form">
      <h2>Crear Nueva Alerta</h2>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          margin="normal"
          label="Mensaje"
          name="message"
          value={alertData.message}
          onChange={handleChange}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          label="Task ID"
          name="taskId"
          type="number"
          value={alertData.taskId}
          onChange={handleChange}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          label="Tarea"
          name="task"
          value={alertData.task}
          onChange={handleChange}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          label="Project ID"
          name="projectId"
          type="number"
          value={alertData.projectId}
          onChange={handleChange}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          label="User ID"
          name="userId"
          value={alertData.userId}
          onChange={handleChange}
          required
        />

        <FormControl fullWidth margin="normal">
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

        <TextField
          fullWidth
          margin="normal"
          label="Fecha Programada"
          name="scheduledTime"
          type="datetime-local"
          value={alertData.scheduledTime}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
        />

        <div className="form-buttons">
          <Button variant="contained" color="primary" type="submit" className="create-alert-button">
            Crear Alerta
          </Button>
          <Button
            variant="outlined"
            onClick={props.onClose}
            style={{ marginLeft: "10px", color: "#322b2b", border: "solid 1px #322b2b"}}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AlertForm;
