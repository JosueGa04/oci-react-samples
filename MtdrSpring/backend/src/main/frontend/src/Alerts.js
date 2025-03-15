/*
 * Component that displays and manages alerts.
 */

import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import AlertForm from "./AlertForm";
import { CircularProgress, Dialog, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Moment from "react-moment";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Fetch alerts when component mounts
  useEffect(() => {
    loadAlerts();
  }, []);

  function loadAlerts() {
    setLoading(true);
    setError(null);
    
    // Usamos la ruta de la API tal como estaba en el código original
    fetch("/alerts")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error en la respuesta: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then((result) => {
        setLoading(false);
        setAlerts(result);
      })
      .catch((error) => {
        setLoading(false);
        setError(error);
        console.error("Error cargando alertas:", error);
      });
  }

  function deleteAlert(alertId) {
    fetch(`/alerts/${alertId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error en la respuesta: ${response.status} ${response.statusText}`);
        }
        const remainingAlerts = alerts.filter(
          (alert) => alert.id !== alertId
        );
        setAlerts(remainingAlerts);
        return response;
      })
      .catch((error) => {
        setError(error);
        console.error("Error eliminando alerta:", error);
      });
  }

  function handleAlertCreated(newAlert) {
    setAlerts([newAlert, ...alerts]);
  }

  function openForm() {
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
  }

  function retryLoadAlerts() {
    loadAlerts();
  }

  return (
    <div className="alerts-container">
      <div className="alerts-header">
        <h2>Alertas</h2>
        <Button
          variant="contained"
          startIcon={<NotificationsIcon />}
          onClick={openForm}
          className="create-alert-button"
        >
          Crear Alerta
        </Button>
      </div>

      {error && (
        <div className="error-container" style={{ color: "red", marginBottom: "15px" }}>
          <p className="error-message">Error: {error.message}</p>
          <Button
            variant="contained"
            color="primary"
            onClick={retryLoadAlerts}
            size="small"
            style={{ marginTop: "10px" }}
          >
            Reintentar
          </Button>
        </div>
      )}

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <CircularProgress />
          <p>Cargando alertas...</p>
        </div>
      ) : (
        <div className="alerts-list">
          {alerts.length === 0 ? (
            <p>No se encontraron alertas</p>
          ) : (
            <table className="itemlist">
              <thead>
                <tr>
                  <th>Mensaje</th>
                  <th>Tarea</th>
                  <th>Prioridad</th>
                  <th>Hora Programada</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => (
                  <tr key={alert.id}>
                    <td className="description">{alert.message}</td>
                    <td>{alert.task}</td>
                    <td className={`priority ${alert.priority}`}>
                      {alert.priority}
                    </td>
                    <td className="date">
                      <Moment format="MMM Do hh:mm:ss">
                        {alert.scheduledTime}
                      </Moment>
                    </td>
                    <td>
                      <IconButton
                        aria-label="delete"
                        onClick={() => deleteAlert(alert.id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <Dialog open={isFormOpen} onClose={closeForm}>
        <div className="alert-dialog-content">
          <AlertForm onClose={closeForm} onAlertCreated={handleAlertCreated} />
        </div>
      </Dialog>
    </div>
  );
}

export default Alerts;