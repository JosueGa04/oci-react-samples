package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Alert;
import com.springboot.MyTodoList.service.AlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/alerts") // Define the base URL for Alert-related endpoints
public class AlertController {

    @Autowired
    private AlertService alertService;

    // Get all alerts
    @GetMapping
    public List<Alert> getAllAlerts() {
        return alertService.getAlertsByStatus("PENDING"); // Defaulting to PENDING for simplicity
    }

    // Get a specific alert by ID
    @GetMapping("/{id}")
    public ResponseEntity<Alert> getAlertById(@PathVariable Long id) {
        try {
            Alert alert = alertService.getAlertsByStatus("PENDING").stream()
                    .filter(a -> a.getId().equals(id))
                    .findFirst()
                    .orElseThrow(() -> new Exception("Alert not found"));
            return new ResponseEntity<>(alert, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping
public ResponseEntity<Alert> addAlert(@RequestBody Alert alert) {
    try {
        // Guardar la alerta en la BD
        Alert createdAlert = alertService.createAlert(
            alert.getMessage(), 
            alert.getTaskId(),
            alert.getTask(),
            alert.getProjectId(),
            alert.getUserId(),
            alert.getPriority(),
            alert.getScheduledTime()
        );

        // Enviar notificación a Telegram
        alertService.sendNotification(createdAlert);

        // Retornar la alerta creada en la respuesta para que el frontend la reciba correctamente
        return ResponseEntity.status(HttpStatus.CREATED).body(createdAlert);
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}




    // Update an existing alert
    @PutMapping("/{id}")
    public ResponseEntity<Alert> updateAlert(@RequestBody Alert alert, @PathVariable Long id) {
        try {
            Alert updatedAlert = alertService.updateAlertStatus(id, alert.getStatus());
            return new ResponseEntity<>(updatedAlert, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    // Delete an alert
    @DeleteMapping("/{id}")
    public ResponseEntity<Boolean> deleteAlert(@PathVariable("id") Long id) {
        Boolean flag = false;
        try {
            flag = alertService.deleteAlert(id);
            return new ResponseEntity<>(flag, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(flag, HttpStatus.NOT_FOUND);
        }
    }

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @PostMapping("/send")
    public ResponseEntity<String> sendPendingAlerts() {
        alertService.sendScheduledAlerts();
        return ResponseEntity.ok("Alertas enviadas correctamente");
    }
}
