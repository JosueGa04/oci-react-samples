package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Alert;
import com.springboot.MyTodoList.model.User;
import com.springboot.MyTodoList.repository.AlertRepository;
import com.springboot.MyTodoList.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
                         "Prioridad: " + alert.getPriority();
    
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
        alert.setStatus("SENT");

        Alert savedAlert = alertRepository.save(alert);
        sendNotification(savedAlert);
        return savedAlert;
    }

    // Method to find all alerts
    public List<Alert> getAllAlerts() {
        return alertRepository.findAll();
    }

    // Method to find alerts by user ID
    public List<Alert> getAlertsByUserId(String userId) {
        return alertRepository.findByUserId(userId);
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