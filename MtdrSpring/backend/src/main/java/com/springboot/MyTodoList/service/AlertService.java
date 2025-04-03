package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Alert;
import com.springboot.MyTodoList.model.User;
import com.springboot.MyTodoList.repository.AlertRepository;
import com.springboot.MyTodoList.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AlertService {

    @Autowired
    private AlertRepository alertRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    @Value("${telegram.bot.token}")
    private String botToken;

    public AlertService(AlertRepository alertRepository, UserRepository userRepository) {
        this.alertRepository = alertRepository;
        this.userRepository = userRepository;
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
        String userId = alert.getUserId();
        if (userId == null) {
            System.out.println("El userId es nulo para la alerta: " + alert.getId());
            return;
        }
        
        // Convertir userId a Long para buscar en la base de datos
        Long userIdLong;
        try {
            userIdLong = Long.parseLong(userId);
        } catch (NumberFormatException e) {
            System.out.println("Error al convertir userId a Long: " + userId);
            return;
        }
        
        // Buscar el usuario en la base de datos
        Optional<User> userOptional = userRepository.findById(userIdLong);
        if (!userOptional.isPresent()) {
            System.out.println("No se encontró usuario con ID: " + userId);
            return;
        }
        
        User user = userOptional.get();
        Long telegramId = user.getTelegramId();
        
        if (telegramId == null) {
            System.out.println("El usuario " + userId + " no tiene Telegram ID configurado");
            return;
        }
        
        String chatId = telegramId.toString();
    
        // Formatear el mensaje que se enviará al usuario
        String message = "Tienes una nueva alerta:\n\n" +
                         "Tarea: " + alert.getTask() + "\n" +
                         "Descripción: " + alert.getMessage() + "\n" +
                         "Prioridad: " + alert.getPriority() + "\n" +
                         "Fecha programada: " + alert.getScheduledTime().toString();
    
        // URL para enviar el mensaje a través de la API de Telegram
        String url = "https://api.telegram.org/bot" + botToken + "/sendMessage?chat_id=" + chatId + "&text=" + message;
    
        // Enviar el mensaje a través de la API de Telegram
        try {
            restTemplate.getForObject(url, String.class);
            System.out.println("Mensaje enviado con éxito al usuario " + userId + " con chatId " + chatId);
        } catch (Exception e) {
            System.out.println("Error al enviar mensaje a Telegram: " + e.getMessage());
        }
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