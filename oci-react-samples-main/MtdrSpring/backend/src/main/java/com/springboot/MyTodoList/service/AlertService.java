package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Alert;
import com.springboot.MyTodoList.repository.AlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class AlertService {

    @Autowired
    private AlertRepository alertRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    
    @Value("${telegram.bot.token}")
    private String botToken;

    private final Map<String, String> userChatIds = new HashMap<>();

    public AlertService(AlertRepository alertRepository) {
        this.alertRepository = alertRepository;
        // Datos de ejemplo: userId -> chatId de Telegram
        userChatIds.put("12345", "6458756980"); // Reemplázalo con datos reales
    }

    @Scheduled(fixedRate = 3600000) // Ejecuta cada hora
    public void sendScheduledAlerts() {
        List<Alert> pendingAlerts = alertRepository.findByStatus("PENDING");
        for (Alert alert : pendingAlerts) {
            sendNotification(alert);
            alert.setStatus("SENT");
            alertRepository.save(alert);
        }
    }

    public void sendNotification(Alert alert) {
        // Obtener el chatId del usuario a partir del userId (puedes usar un Map o alguna otra estructura)
        String chatId = userChatIds.get(alert.getUserId());
        if (chatId == null) {
            System.out.println("No se encontró chatId para userId: " + alert.getUserId());
            return;
        }
    
        // Formatear el mensaje que se enviará al usuario
        String message = "Tienes una nueva alerta:\n\n" +
                         "Tarea: " + alert.getTask() + "\n" +
                         "Descripción: " + alert.getMessage() + "\n" +
                         "Prioridad: " + alert.getPriority() + "\n" +
                         "Fecha programada: " + alert.getScheduledTime().toString();  // Asegúrate de que el formato de fecha es adecuado
    
        // URL para enviar el mensaje a través de la API de Telegram
        String url = "https://api.telegram.org/bot" + botToken + "/sendMessage?chat_id=" + chatId + "&text=" + message;
    
        // Enviar el mensaje a través de la API de Telegram
        restTemplate.getForObject(url, String.class);
    }
    
    

    // Method to create an alert
    public Alert createAlert(String message, Long taskId, String task, Long projectId, String userId, String priority, OffsetDateTime scheduledTime) {
        Alert alert = new Alert();
        alert.setMessage(message);
        alert.setTaskId(taskId);
        alert.setTask(task);
        alert.setProjectId(projectId);
        alert.setUserId(userId);
        alert.setPriority(priority);
        alert.setScheduledTime(scheduledTime);
        alert.setStatus("PENDING");

        return alertRepository.save(alert);
    }

    // Method to find all alerts based on status (e.g., PENDING, SENT)
    public List<Alert> getAlertsByStatus(String status) {
        return alertRepository.findByStatus(status);
    }

    // Method to find alerts by user ID
    public List<Alert> getAlertsByUserId(String userId) {
        return alertRepository.findByUserId(userId);
    }

    // Method to find overdue alerts (scheduled before now but still PENDING)
    public List<Alert> getOverdueAlerts() {
        return alertRepository.findOverdueAlerts(OffsetDateTime.now());
    }

    // Method to update the alert status (e.g., SENT or CANCELLED)
    public Alert updateAlertStatus(Long id, String status) throws Exception {
        Alert alert = alertRepository.findById(id).orElseThrow(() -> new Exception("Alert not found"));
        alert.setStatus(status);
        return alertRepository.save(alert);
    }
    

    public Boolean deleteAlert(Long id) {
        try {
            alertRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
}
