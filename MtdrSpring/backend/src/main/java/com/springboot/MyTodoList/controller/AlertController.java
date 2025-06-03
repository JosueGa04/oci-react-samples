package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Alert;
import com.springboot.MyTodoList.service.AlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class AlertController {

    @Autowired
    private AlertService alertService;

    @GetMapping("/alerts")
    public List<Alert> getAllAlerts() {
        return alertService.getAllAlerts();
    }

    @GetMapping("/alerts/{id}")
    public ResponseEntity<Alert> getAlertById(@PathVariable Long id) {
        Alert alert = alertService.getAllAlerts().stream()
                .filter(a -> a.getId().equals(id))
                .findFirst()
                .orElse(null);
        
        if (alert != null) {
            return ResponseEntity.ok(alert);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/alerts")
    public Alert createAlert(@RequestBody Alert alert) {
        return alertService.createAlert(
            alert.getMessage(),
            alert.getTaskId(),
            alert.getTask(),
            alert.getProjectId(),
            alert.getUserId(),
            alert.getPriority(),
            OffsetDateTime.now()
        );
    }

    @DeleteMapping("/alerts/{id}")
    public ResponseEntity<Void> deleteAlert(@PathVariable Long id) {
        Boolean deleted = alertService.deleteAlert(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
