import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import API_LIST from "./API"; // Importamos la misma constante que usa App.js

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

  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar las tareas existentes cuando el componente se monta
  useEffect(() => {
    loadTasks();
  }, []);

  // Función para cargar las tareas pendientes
  function loadTasks() {
    setIsLoading(true);
    setError(null);
    
    // Usamos API_LIST, la misma constante que se usa en App.js
    fetch(API_LIST)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error en la respuesta: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then((result) => {
        setIsLoading(false);
        // Filtrar solo las tareas no completadas
        const pendingTasks = result.filter(task => !task.done);
        setTasks(pendingTasks);
      })
      .catch((error) => {
        console.error("Error cargando tareas:", error);
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

  function handleTaskSelection(e) {
    const taskId = e.target.value;
    
    // Si no se seleccionó ninguna tarea, limpiar los campos relacionados
    if (!taskId) {
      setAlertData((prevData) => ({
        ...prevData,
        taskId: "",
        task: "",
        projectId: "",
        userId: "",
      }));
      return;
    }

    // Buscar la tarea seleccionada
    const selectedTask = tasks.find(task => task.id === taskId);
    
    if (selectedTask) {
      // Autocompletar los campos con los datos de la tarea seleccionada
      setAlertData((prevData) => ({
        ...prevData,
        taskId: selectedTask.id,
        task: selectedTask.description,
        // projectId: selectedTask.projectId || "",
        // userId: selectedTask.userId || "",
      }));
    }
  }

  // Función para intentar cargar las tareas nuevamente
  function retryLoadTasks() {
    loadTasks();
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!alertData.message.trim()) {
      alert("El mensaje de alerta es obligatorio.");
      return;
    }

    // Si no hay una tarea seleccionada pero el usuario ha escrito manualmente los campos
    if (!alertData.taskId && !alertData.task.trim()) {
      alert("Por favor, seleccione una tarea o complete los campos de tarea manualmente.");
      return;
    }

    // Convertir a ISO con zona horaria UTC
    const adjustedAlertData = {
      ...alertData,
      scheduledTime: new Date(alertData.scheduledTime).toISOString(),
    };

    // Guardar la alerta en la BD - usamos la ruta "/alerts" como en el código original
    fetch("/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adjustedAlertData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error en la respuesta: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
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
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <CircularProgress size={24} />
            <p>Cargando tareas...</p>
          </div>
        ) : error ? (
          <div className="error-container" style={{ color: "red", marginBottom: "15px" }}>
            <p className="error-message">Error: {error.message}</p>
            <Button
              variant="contained"
              color="primary"
              onClick={retryLoadTasks}
              size="small"
              style={{ marginTop: "10px" }}
            >
              Reintentar
            </Button>
          </div>
        ) : (
          <FormControl fullWidth margin="normal">
            <InputLabel>Seleccionar Tarea</InputLabel>
            <Select
              name="selectedTask"
              value={alertData.taskId}
              onChange={handleTaskSelection}
            >
              <MenuItem value="">-- Seleccionar una tarea --</MenuItem>
              {tasks.map((task) => (
                <MenuItem key={task.id} value={task.id}>
                  {task.description}
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
          placeholder="Motivo de la alerta..."
        />

        {/* Permitimos editar manualmente si hay un error al cargar las tareas */}
        <TextField
          fullWidth
          margin="normal"
          label="Task ID"
          name="taskId"
          value={alertData.taskId}
          onChange={handleChange}
          disabled={!error}
        />
        
        <TextField
          fullWidth
          margin="normal"
          label="Tarea"
          name="task"
          value={alertData.task}
          onChange={handleChange}
          disabled={!error}
          required={error}
        />
        
        <TextField
          fullWidth
          margin="normal"
          label="Project ID"
          name="projectId"
          value={alertData.projectId}
          onChange={handleChange}
          //disabled={!error}
        />
        
        <TextField
          fullWidth
          margin="normal"
          label="User ID"
          name="userId"
          value={alertData.userId}
          onChange={handleChange}
          //disabled={!error}
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