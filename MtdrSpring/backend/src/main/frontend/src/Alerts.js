/*
 * Component that displays and manages alerts.
 */

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
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
  CircularProgress,
} from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import AlertForm from "./AlertForm";
import Moment from "react-moment";

const API_URL = "/alerts";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  function loadAlerts() {
    setLoading(true);
    setError(null);

    fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Error en la respuesta: ${response.status} ${response.statusText}`
          );
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
    if (window.confirm("¿Estás seguro de que deseas eliminar esta alerta?")) {
      fetch(`${API_URL}/${alertId}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Error en la respuesta: ${response.status} ${response.statusText}`
            );
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
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Gestión de Alertas</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openForm}>
          Nueva Alerta
        </Button>
      </Box>

      {error && (
        <Box sx={{ color: "red", mb: 2 }}>
          <Typography>Error: {error.message}</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={retryLoadAlerts}
            size="small"
            sx={{ mt: 1 }}
          >
            Reintentar
          </Button>
        </Box>
      )}

      {isLoading ? (
        <Box sx={{ textAlign: "center", p: 3 }}>
          <CircularProgress />
          <Typography>Cargando alertas...</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mensaje</TableCell>
                <TableCell>Tarea</TableCell>
                <TableCell>Prioridad</TableCell>
                <TableCell>Hora Programada</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No se encontraron alertas
                  </TableCell>
                </TableRow>
              ) : (
                alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>{alert.message}</TableCell>
                    <TableCell>{alert.task}</TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          color:
                            alert.priority === "ALTA"
                              ? "error.main"
                              : alert.priority === "MEDIA"
                              ? "warning.main"
                              : "success.main",
                          fontWeight: "bold",
                        }}
                      >
                        {alert.priority}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Moment format="MMM Do hh:mm:ss">
                        {alert.scheduledTime}
                      </Moment>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        aria-label="delete"
                        onClick={() => deleteAlert(alert.id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={isFormOpen} onClose={closeForm} maxWidth="md" fullWidth>
        <DialogTitle>Crear Nueva Alerta</DialogTitle>
        <DialogContent>
          <AlertForm onClose={closeForm} onAlertCreated={handleAlertCreated} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Alerts;
