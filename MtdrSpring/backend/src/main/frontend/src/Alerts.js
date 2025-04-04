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
  alpha,
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
          Gestión de Alertas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openForm}
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
          Nueva Alerta
        </Button>
      </Box>

      {error && (
        <Box sx={{ color: "red", mb: 2 }}>
          <Typography>Error: {error.message}</Typography>
          <Button
            variant="contained"
            onClick={retryLoadAlerts}
            size="small"
            sx={{
              mt: 1,
              backgroundColor: "#c74634",
              "&:hover": {
                backgroundColor: "#b13d2b",
              },
            }}
          >
            Reintentar
          </Button>
        </Box>
      )}

      {isLoading ? (
        <Box sx={{ textAlign: "center", p: 3 }}>
          <CircularProgress sx={{ color: "#c74634" }} />
          <Typography>Cargando alertas...</Typography>
        </Box>
      ) : (
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
                  Mensaje
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#312d2a" }}>
                  Tarea
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#312d2a" }}>
                  Prioridad
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#312d2a" }}>
                  Hora Programada
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#312d2a" }}>
                  Acciones
                </TableCell>
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
                  <TableRow
                    key={alert.id}
                    sx={{
                      "&:hover": {
                        backgroundColor: alpha("#c74634", 0.04),
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <TableCell>{alert.message}</TableCell>
                    <TableCell>{alert.task}</TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          color:
                            alert.priority === "ALTA"
                              ? "#c74634"
                              : alert.priority === "MEDIA"
                              ? "#f39c12"
                              : "#27ae60",
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
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={isFormOpen}
        onClose={closeForm}
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
            Crear Nueva Alerta
          </Typography>
        </DialogTitle>
        <DialogContent>
          <AlertForm onClose={closeForm} onAlertCreated={handleAlertCreated} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Alerts;
