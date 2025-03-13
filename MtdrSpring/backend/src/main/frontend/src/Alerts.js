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
    fetch("http://localhost:8081/alerts")
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Failed to fetch alerts");
        }
      })
      .then(
        (result) => {
          setLoading(false);
          setAlerts(result);
        },
        (error) => {
          setLoading(false);
          setError(error);
        }
      );
  }

  function deleteAlert(alertId) {
    fetch(`http://localhost:8081/alerts/${alertId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          const remainingAlerts = alerts.filter(
            (alert) => alert.id !== alertId
          );
          setAlerts(remainingAlerts);
          return response;
        } else {
          throw new Error("Failed to delete alert");
        }
      })
      .catch((error) => {
        setError(error);
        console.error("Error deleting alert:", error);
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

  return (
    <div className="alerts-container">
      <div className="alerts-header">
        <h2>Alerts</h2>
        <Button
          variant="contained"
          startIcon={<NotificationsIcon />}
          onClick={openForm}
          className="create-alert-button"
        >
          Create Alert
        </Button>
      </div>

      {error && <p className="error-message">Error: {error.message}</p>}

      {isLoading ? (
        <CircularProgress />
      ) : (
        <div className="alerts-list">
          {alerts.length === 0 ? (
            <p>No alerts found</p>
          ) : (
            <table className="itemlist">
              <thead>
                <tr>
                  <th>Message</th>
                  <th>Task</th>
                  <th>Priority</th>
                  <th>Scheduled Time</th>
                  <th>Actions</th>
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
