package com.springboot.MyTodoList.controller;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardRemove;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import com.springboot.MyTodoList.model.Issue;
import com.springboot.MyTodoList.model.User;
import com.springboot.MyTodoList.service.IssueService;
import com.springboot.MyTodoList.service.UserService;
import com.springboot.MyTodoList.util.BotCommands;
import com.springboot.MyTodoList.util.BotHelper;
import com.springboot.MyTodoList.util.BotLabels;
import com.springboot.MyTodoList.util.BotMessages;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.ZoneId;
import java.util.Date;

public class IssueBotController extends TelegramLongPollingBot {

    private static final Logger logger = LoggerFactory.getLogger(IssueBotController.class);
    private IssueService issueService;
    private UserService userService;
    private String botName;
    private Map<Long, TaskCreationState> taskCreationStates = new HashMap<>();
    private Map<Long, CommandState> commandStates = new HashMap<>();

    private enum TaskCreationStep {
        TITLE,
        DESCRIPTION,
        ESTIMATION,
        DUE_DATE,
        DEVELOPER
    }

    private enum CommandType {
        COMPLETE_ISSUE,
        DEV_STATS,
        DEV_STATS_SELECT
    }

    private static class CommandState {
        CommandType type;
        Map<String, String> parameters;
        int currentStep;

        CommandState(CommandType type) {
            this.type = type;
            this.parameters = new HashMap<>();
            this.currentStep = 0;
        }
    }

    private static class TaskCreationState {
        TaskCreationStep currentStep;
        Issue newIssue;

        TaskCreationState() {
            this.currentStep = TaskCreationStep.TITLE;
            this.newIssue = new Issue();
        }
    }

    public IssueBotController(String botToken, String botName, IssueService issueService, UserService userService) {
        super(botToken);
        logger.info("Bot Token: " + botToken);
        logger.info("Bot name: " + botName);
        this.issueService = issueService;
        this.userService = userService;
        this.botName = botName;
    }

    @Override
    public String getBotUsername() {
        return botName;
    }

    @Override
    public void onUpdateReceived(Update update) {
        if (!update.hasMessage() || !update.getMessage().hasText()) {
            return;
        }

        String messageText = update.getMessage().getText();
        long chatId = update.getMessage().getChatId();
        long telegramId = update.getMessage().getFrom().getId();

        try {
            // Check if user is in task creation mode
            if (taskCreationStates.containsKey(chatId)) {
                handleTaskCreation(chatId, telegramId, messageText);
                return;
            }

            // Check if user is in command state
            if (commandStates.containsKey(chatId)) {
                handleCommandState(chatId, telegramId, messageText);
                return;
            }

            // Handle commands from keyboard buttons
            if (messageText.equals(BotLabels.MY_ASSIGNED_ISSUES.getLabel())) {
                showAssignedIssues(chatId, telegramId);
            } else if (messageText.equals(BotLabels.COMPLETE_ISSUE.getLabel())) {
                startCompleteIssueFlow(chatId);
            } else if (messageText.equals(BotLabels.DEVELOPER_STATS.getLabel())) {
                startDevStatsFlow(chatId);
            } else if (messageText.equals(BotLabels.SHOW_DEVELOPERS.getLabel())) {
                showDevelopersList(chatId, telegramId);
            } else if (messageText.equals(BotLabels.CREATE_NEW_TASK.getLabel())) {
                startTaskCreation(chatId, telegramId);
            } else if (messageText.equals("/start")) {
                startCommandReceived(chatId);
            } else {
                sendMessage(chatId, "Please use one of the available commands from the menu.");
            }
        } catch (TelegramApiException e) {
            logger.error("Error occurred: " + e.getMessage());
        }
    }

    private void startTaskCreation(long chatId, long telegramId) throws TelegramApiException {
        User user = userService.findByTelegramId(telegramId);
        if (user == null || user.getUserId() != 5) {
            sendMessage(chatId, BotMessages.NOT_AUTHORIZED.getMessage());
            return;
        }

        taskCreationStates.put(chatId, new TaskCreationState());
        sendMessage(chatId, BotMessages.TASK_CREATION_STARTED.getMessage());
    }

    private void handleTaskCreation(long chatId, long telegramId, String messageText) throws TelegramApiException {
        TaskCreationState state = taskCreationStates.get(chatId);
        
        if (messageText.equals("/cancel")) {
            taskCreationStates.remove(chatId);
            sendMessage(chatId, BotMessages.TASK_CREATION_CANCELLED.getMessage());
            return;
        }

        try {
            switch (state.currentStep) {
                case TITLE:
                    state.newIssue.setIssueTitle(messageText);
                    state.currentStep = TaskCreationStep.DESCRIPTION;
                    sendMessage(chatId, BotMessages.ENTER_TASK_DESCRIPTION.getMessage());
                    break;

                case DESCRIPTION:
                    state.newIssue.setIssueDescription(messageText);
                    state.currentStep = TaskCreationStep.ESTIMATION;
                    sendMessage(chatId, BotMessages.ENTER_TASK_ESTIMATION.getMessage());
                    break;

                case ESTIMATION:
                    try {
                        int estimation = Integer.parseInt(messageText);
                        state.newIssue.setEstimation(estimation);
                        state.currentStep = TaskCreationStep.DUE_DATE;
                        sendMessage(chatId, BotMessages.ENTER_TASK_DUE_DATE.getMessage());
                    } catch (NumberFormatException e) {
                        sendMessage(chatId, BotMessages.INVALID_NUMBER_FORMAT.getMessage());
                    }
                    break;

                case DUE_DATE:
                    try {
                        LocalDate localDate = LocalDate.parse(messageText, DateTimeFormatter.ISO_DATE);
                        Date dueDate = Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
                        state.newIssue.setDueDate(dueDate);
                        state.currentStep = TaskCreationStep.DEVELOPER;
                        showDevelopersList(chatId, telegramId);
                        sendMessage(chatId, BotMessages.SELECT_DEVELOPER.getMessage());
                    } catch (DateTimeParseException e) {
                        sendMessage(chatId, BotMessages.INVALID_DATE_FORMAT.getMessage());
                    }
                    break;

                case DEVELOPER:
                    try {
                        Long developerId = Long.parseLong(messageText);
                        Optional<User> developer = userService.getUserById(developerId);
                        if (developer.isPresent() && "ENGINEER".equalsIgnoreCase(developer.get().getUserRol())) {
                            state.newIssue.setAssignee(developerId);
                            state.newIssue.setStatus(0); // Set initial status as not completed
                            
                            // Save the new issue
                            issueService.createIssue(state.newIssue);
                            
                            sendMessage(chatId, BotMessages.TASK_CREATED_SUCCESS.getMessage());
                            taskCreationStates.remove(chatId);
                        } else {
                            sendMessage(chatId, "Invalid engineer ID. Please select a valid engineer from the list.");
                        }
                    } catch (NumberFormatException e) {
                        sendMessage(chatId, BotMessages.INVALID_NUMBER_FORMAT.getMessage());
                    }
                    break;
            }
        } catch (Exception e) {
            logger.error("Error in task creation: " + e.getMessage());
            sendMessage(chatId, "An error occurred while creating the task. Please try again.");
            taskCreationStates.remove(chatId);
        }
    }

    private void showDevelopersList(long chatId, long telegramId) throws TelegramApiException {
        User user = userService.findByTelegramId(telegramId);
        if (user == null) {
            sendMessage(chatId, "User not found. Please contact your administrator.");
            return;
        }

        // If not Project Manager, only show their own info
        if (user.getUserId() != 5) {
            StringBuilder message = new StringBuilder("Your Information:\n");
            message.append("ID: ").append(user.getUserId())
                  .append("\nName: ").append(user.getUserName())
                  .append("\nRole: ").append(user.getUserRol())
                  .append("\n");
            sendMessage(chatId, message.toString());
            return;
        }

        // For Project Manager, show all engineers
        List<User> developers = userService.getUsersByRole("Engineer");
        logger.info("Searching for users with role Engineer");
        logger.info("Found {} users", developers.size());
        
        if (developers.isEmpty()) {
            // Try to get all users to debug
            List<User> allUsers = userService.getAllUsers();
            logger.info("Total users in system: {}", allUsers.size());
            for (User u : allUsers) {
                logger.info("User: ID={}, Name={}, Role={}", u.getUserId(), u.getUserName(), u.getUserRol());
            }
            
            sendMessage(chatId, "No engineers found in the system. Please check the role configuration.");
            return;
        }

        StringBuilder message = new StringBuilder("📋 *Available Engineers*\n\n");
        
        for (User developer : developers) {
            message.append("👤 *Engineer Details*\n")
                  .append("ID: `").append(developer.getUserId()).append("`\n")
                  .append("Name: ").append(developer.getUserName()).append("\n")
                  .append("Role: ").append(developer.getUserRol()).append("\n")
                  .append("-------------------\n");
        }
        
        message.append("\nTo assign a task, use the engineer's ID number.");
        
        SendMessage sendMessage = SendMessage.builder()
                .chatId(String.valueOf(chatId))
                .text(message.toString())
                .parseMode("Markdown")
                .build();
        
        execute(sendMessage);
    }

    private void startCommandReceived(long chatId) throws TelegramApiException {
        String answer = "Welcome to the TaskMaster!\n\n" +
                "Please select a command from the menu below:";

        SendMessage message = SendMessage.builder()
                .chatId(String.valueOf(chatId))
                .text(answer)
                .replyMarkup(createMainMenuKeyboard())
                .build();

        execute(message);
    }

    private ReplyKeyboardMarkup createMainMenuKeyboard() {
        ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
        keyboardMarkup.setSelective(true);
        keyboardMarkup.setResizeKeyboard(true);
        keyboardMarkup.setOneTimeKeyboard(false);

        List<KeyboardRow> keyboard = new ArrayList<>();
        
        // First row
        KeyboardRow row1 = new KeyboardRow();
        row1.add(BotLabels.MY_ASSIGNED_ISSUES.getLabel());
        row1.add(BotLabels.COMPLETE_ISSUE.getLabel());
        keyboard.add(row1);

        // Second row
        KeyboardRow row2 = new KeyboardRow();
        row2.add(BotLabels.DEVELOPER_STATS.getLabel());
        row2.add(BotLabels.SHOW_DEVELOPERS.getLabel());
        keyboard.add(row2);

        // Third row (only for Project Managers)
        KeyboardRow row3 = new KeyboardRow();
        row3.add(BotLabels.CREATE_NEW_TASK.getLabel());
        keyboard.add(row3);

        keyboardMarkup.setKeyboard(keyboard);
        return keyboardMarkup;
    }

    private void showAssignedIssues(long chatId, long telegramId) throws TelegramApiException {
        User user = userService.findByTelegramId(telegramId);
        if (user == null) {
            sendMessage(chatId, "User not found. Please contact your administrator.");
            return;
        }

        List<Issue> assignedIssues = issueService.getIssuesByAssignee(user.getUserId());
        // Filter out completed issues (status = 1)
        List<Issue> activeIssues = assignedIssues.stream()
                .filter(issue -> issue.getStatus() != 1)
                .collect(Collectors.toList());

        if (activeIssues.isEmpty()) {
            sendMessage(chatId, "You don't have any active assigned issues.");
            return;
        }

        StringBuilder message = new StringBuilder("Your active assigned issues:\n\n");
        for (Issue issue : activeIssues) {
            message.append("ID: ").append(issue.getIssueId())
                    .append("\nTitle: ").append(issue.getIssueTitle())
                    .append("\nStatus: ").append(issue.getStatus())
                    .append("\nDue Date: ").append(issue.getDueDate())
                    .append("\n\n");
        }
        message.append("To complete an issue, use the command:\n")
                .append("/complete <issue_id> <hours>");

        sendMessage(chatId, message.toString());
    }

    private void startCompleteIssueFlow(long chatId) throws TelegramApiException {
        commandStates.put(chatId, new CommandState(CommandType.COMPLETE_ISSUE));
        SendMessage message = SendMessage.builder()
                .chatId(String.valueOf(chatId))
                .text("Please enter the Issue ID you want to complete:")
                .replyMarkup(createCancelKeyboard())
                .build();
        execute(message);
    }

    private void startDevStatsFlow(long chatId) throws TelegramApiException {
        commandStates.put(chatId, new CommandState(CommandType.DEV_STATS));
        
        // Primero mostrar la lista de desarrolladores
        User user = userService.findByTelegramId(chatId);
        if (user == null) {
            SendMessage message = SendMessage.builder()
                    .chatId(String.valueOf(chatId))
                    .text("User not found. Please contact your administrator.")
                    .replyMarkup(createMainMenuKeyboard())
                    .build();
            execute(message);
            commandStates.remove(chatId);
            return;
        }

        // Si es Project Manager, mostrar todos los desarrolladores
        if ("Project Manager".equalsIgnoreCase(user.getUserRol())) {
            List<User> developers = userService.getUsersByRole("Engineer");
            if (developers.isEmpty()) {
                SendMessage message = SendMessage.builder()
                        .chatId(String.valueOf(chatId))
                        .text("No engineers found in the system. Please check the role configuration.")
                        .replyMarkup(createMainMenuKeyboard())
                        .build();
                execute(message);
                commandStates.remove(chatId);
                return;
            }

            StringBuilder messageText = new StringBuilder("📋 *Available Engineers*\n\n");
            for (User developer : developers) {
                messageText.append("👤 *Engineer Details*\n")
                        .append("ID: `").append(developer.getUserId()).append("`\n")
                        .append("Name: ").append(developer.getUserName()).append("\n")
                        .append("Role: ").append(developer.getUserRol()).append("\n")
                        .append("-------------------\n");
            }
            messageText.append("\nPlease enter the Developer ID to view their statistics:");

            SendMessage message = SendMessage.builder()
                    .chatId(String.valueOf(chatId))
                    .text(messageText.toString())
                    .parseMode("Markdown")
                    .replyMarkup(createCancelKeyboard())
                    .build();
            execute(message);
        } else {
            // Si no es Project Manager, solo mostrar sus propias estadísticas
            showSpecificDeveloperStats(chatId, user.getUserId());
            commandStates.remove(chatId);
            
            // Restaurar menú principal
            SendMessage message = SendMessage.builder()
                    .chatId(String.valueOf(chatId))
                    .text("What would you like to do next?")
                    .replyMarkup(createMainMenuKeyboard())
                    .build();
            execute(message);
        }
    }

    private void handleCommandState(long chatId, long telegramId, String messageText) throws TelegramApiException {
        CommandState state = commandStates.get(chatId);
        
        if (messageText.equals("/cancel")) {
            commandStates.remove(chatId);
            SendMessage message = SendMessage.builder()
                    .chatId(String.valueOf(chatId))
                    .text("Command cancelled. You can start over with a new command.")
                    .replyMarkup(createMainMenuKeyboard())
                    .build();
            execute(message);
            return;
        }

        try {
            switch (state.type) {
                case COMPLETE_ISSUE:
                    handleCompleteIssueState(chatId, telegramId, messageText, state);
                    break;
                case DEV_STATS:
                    handleDevStatsState(chatId, telegramId, messageText, state);
                    break;
            }
        } catch (Exception e) {
            logger.error("Error in command state: " + e.getMessage());
            SendMessage message = SendMessage.builder()
                    .chatId(String.valueOf(chatId))
                    .text("An error occurred. Please try again or use /cancel to start over.")
                    .replyMarkup(createMainMenuKeyboard())
                    .build();
            execute(message);
            commandStates.remove(chatId);
        }
    }

    private void handleCompleteIssueState(long chatId, long telegramId, String messageText, CommandState state) throws TelegramApiException {
        switch (state.currentStep) {
            case 0: // Issue ID
                try {
                    Long issueId = Long.parseLong(messageText);
                    state.parameters.put("issueId", issueId.toString());
                    state.currentStep++;
                    
                    SendMessage message = SendMessage.builder()
                            .chatId(String.valueOf(chatId))
                            .text("Please enter the number of hours worked:")
                            .replyMarkup(createHoursKeyboard())
                            .build();
                    execute(message);
                } catch (NumberFormatException e) {
                    SendMessage message = SendMessage.builder()
                            .chatId(String.valueOf(chatId))
                            .text("Please enter a valid Issue ID (numbers only):")
                            .replyMarkup(createCancelKeyboard())
                            .build();
                    execute(message);
                }
                break;
            case 1: // Hours worked
                try {
                    Integer hours = Integer.parseInt(messageText);
                    state.parameters.put("hours", hours.toString());
                    
                    // Process the complete issue command
                    String command = "/complete " + state.parameters.get("issueId") + " " + state.parameters.get("hours");
                    handleIssueCompletion(chatId, telegramId, command);
                    
                    // Clear the command state and restore main menu
                    commandStates.remove(chatId);
                    SendMessage message = SendMessage.builder()
                            .chatId(String.valueOf(chatId))
                            .text("Task completed! What would you like to do next?")
                            .replyMarkup(createMainMenuKeyboard())
                            .build();
                    execute(message);
                } catch (NumberFormatException e) {
                    SendMessage message = SendMessage.builder()
                            .chatId(String.valueOf(chatId))
                            .text("Please enter a valid number of hours (numbers only):")
                            .replyMarkup(createHoursKeyboard())
                            .build();
                    execute(message);
                }
                break;
        }
    }

    private void handleDevStatsState(long chatId, long telegramId, String messageText, CommandState state) throws TelegramApiException {
        try {
            Long developerId = Long.parseLong(messageText);
            User requestingUser = userService.findByTelegramId(telegramId);
            
            if (requestingUser == null) {
                SendMessage message = SendMessage.builder()
                        .chatId(String.valueOf(chatId))
                        .text("User not found. Please contact your administrator.")
                        .replyMarkup(createMainMenuKeyboard())
                        .build();
                execute(message);
                commandStates.remove(chatId);
                return;
            }

            // Verificar si el usuario es Project Manager o está viendo sus propias estadísticas
            boolean isProjectManager = "Project Manager".equalsIgnoreCase(requestingUser.getUserRol());
            if (!isProjectManager && !developerId.equals(requestingUser.getUserId())) {
                SendMessage message = SendMessage.builder()
                        .chatId(String.valueOf(chatId))
                        .text("You can only view your own statistics.")
                        .replyMarkup(createMainMenuKeyboard())
                        .build();
                execute(message);
                commandStates.remove(chatId);
                return;
            }

            // Mostrar las estadísticas
            showSpecificDeveloperStats(chatId, developerId);
            commandStates.remove(chatId);
            
            // Restaurar menú principal
            SendMessage message = SendMessage.builder()
                    .chatId(String.valueOf(chatId))
                    .text("What would you like to do next?")
                    .replyMarkup(createMainMenuKeyboard())
                    .build();
            execute(message);
        } catch (NumberFormatException e) {
            SendMessage message = SendMessage.builder()
                    .chatId(String.valueOf(chatId))
                    .text("Please enter a valid Developer ID (numbers only):")
                    .replyMarkup(createCancelKeyboard())
                    .build();
            execute(message);
        }
    }

    private void showSpecificDeveloperStats(long chatId, Long developerId) throws TelegramApiException {
        try {
            Optional<User> developerOpt = userService.getUserById(developerId);
            if (!developerOpt.isPresent()) {
                SendMessage message = SendMessage.builder()
                        .chatId(String.valueOf(chatId))
                        .text("Developer with ID " + developerId + " not found.")
                        .replyMarkup(createMainMenuKeyboard())
                        .build();
                execute(message);
                return;
            }
            
            User developer = developerOpt.get();
            List<Issue> allIssues = issueService.getIssuesByAssignee(developerId);
            
            List<Issue> completedIssues = allIssues.stream()
                    .filter(issue -> issue.getStatus() == 1)
                    .collect(Collectors.toList());
            
            List<Issue> pendingIssues = allIssues.stream()
                    .filter(issue -> issue.getStatus() != 1)
                    .collect(Collectors.toList());
            
            int totalHours = completedIssues.stream()
                    .mapToInt(Issue::getHoursWorked)
                    .sum();
            
            StringBuilder messageText = new StringBuilder("📊 *Statistics for " + developer.getUserName() + "*\n\n");
            messageText.append("Total Completed Tasks: ").append(completedIssues.size()).append("\n");
            messageText.append("Total Hours Worked: ").append(totalHours).append("\n");
            messageText.append("Pending Tasks: ").append(pendingIssues.size()).append("\n\n");
            
            if (!completedIssues.isEmpty()) {
                messageText.append("📋 *Completed Tasks Details:*\n");
                for (Issue issue : completedIssues) {
                    messageText.append("• Task ID: ").append(issue.getIssueId())
                           .append("\n  Title: ").append(issue.getIssueTitle())
                           .append("\n  Hours: ").append(issue.getHoursWorked())
                           .append("\n\n");
                }
            }
            
            SendMessage message = SendMessage.builder()
                    .chatId(String.valueOf(chatId))
                    .text(messageText.toString())
                    .parseMode("Markdown")
                    .build();
            execute(message);
        } catch (Exception e) {
            logger.error("Error showing developer stats: " + e.getMessage(), e);
            SendMessage message = SendMessage.builder()
                    .chatId(String.valueOf(chatId))
                    .text("Error retrieving developer statistics: " + e.getMessage())
                    .replyMarkup(createMainMenuKeyboard())
                    .build();
            execute(message);
        }
    }

    private ReplyKeyboardMarkup createHoursKeyboard() {
        ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
        keyboardMarkup.setSelective(true);
        keyboardMarkup.setResizeKeyboard(true);
        keyboardMarkup.setOneTimeKeyboard(false);

        List<KeyboardRow> keyboard = new ArrayList<>();
        
        // First row
        KeyboardRow row1 = new KeyboardRow();
        row1.add("1");
        row1.add("2");
        row1.add("3");
        keyboard.add(row1);

        // Second row
        KeyboardRow row2 = new KeyboardRow();
        row2.add("4");
        row2.add("5");
        row2.add("6");
        keyboard.add(row2);

        // Third row
        KeyboardRow row3 = new KeyboardRow();
        row3.add("7");
        row3.add("8");
        row3.add("9");
        keyboard.add(row3);

        // Fourth row
        KeyboardRow row4 = new KeyboardRow();
        row4.add("10");
        row4.add("15");
        row4.add("20");
        keyboard.add(row4);

        // Fifth row
        KeyboardRow row5 = new KeyboardRow();
        row5.add("/cancel");
        keyboard.add(row5);

        keyboardMarkup.setKeyboard(keyboard);
        return keyboardMarkup;
    }

    private ReplyKeyboardMarkup createCancelKeyboard() {
        ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
        keyboardMarkup.setSelective(true);
        keyboardMarkup.setResizeKeyboard(true);
        keyboardMarkup.setOneTimeKeyboard(false);

        List<KeyboardRow> keyboard = new ArrayList<>();
        KeyboardRow row = new KeyboardRow();
        row.add("/cancel");
        keyboard.add(row);

        keyboardMarkup.setKeyboard(keyboard);
        return keyboardMarkup;
    }

    private void showCompleteIssuePrompt(long chatId) throws TelegramApiException {
        String message = "To complete an issue, I'll guide you through the process.\n" +
                "First, I'll ask for the Issue ID, then the hours worked.\n" +
                "You can cancel at any time by typing /cancel";
        sendMessage(chatId, message);
    }

    private void handleIssueCompletion(long chatId, long telegramId, String messageText) throws TelegramApiException {
        logger.info("Received completion command: " + messageText);
        
        // Remove the /complete prefix and trim
        String command = messageText.substring("/complete ".length()).trim();
        String[] parts = command.split("\\s+");
        
        if (parts.length != 2) {
            logger.error("Invalid command format. Expected 2 parts, got: " + parts.length);
            sendMessage(chatId, "Invalid format. Use: /complete <issue_id> <hours>\nExample: /complete 123 4");
            return;
        }

        try {
            Long issueId = Long.parseLong(parts[0]);
            Integer hoursWorked = Integer.parseInt(parts[1]);

            logger.info("Parsed issueId: " + issueId + ", hoursWorked: " + hoursWorked);

            User user = userService.findByTelegramId(telegramId);
            if (user == null) {
                logger.error("User not found for telegramId: " + telegramId);
                sendMessage(chatId, "User not found. Please contact your administrator.");
                return;
            }

            Issue issue = issueService.getIssueById(issueId)
                    .orElseThrow(() -> new Exception("Issue not found"));

            logger.info("Found issue: " + issue.getIssueId() + ", assigned to: " + issue.getAssignee());
            logger.info("Current user ID: " + user.getUserId());

            if (!issue.getAssignee().equals(user.getUserId())) {
                logger.error("User " + user.getUserId() + " is not assigned to issue " + issueId);
                sendMessage(chatId, "You are not assigned to this issue.");
                return;
            }

            issue.setStatus(1); // Status 1 means COMPLETED
            issue.setHoursWorked(hoursWorked);
            
            issueService.updateIssue(issueId, issue);
            logger.info("Successfully completed issue " + issueId);
            sendMessage(chatId, "Issue completed successfully!");
        } catch (NumberFormatException e) {
            logger.error("Invalid number format in command: " + command, e);
            sendMessage(chatId, "Invalid issue ID or hours format. Please use numbers.\nExample: /complete 123 4");
        } catch (Exception e) {
            logger.error("Error completing issue: " + e.getMessage(), e);
            sendMessage(chatId, "Error completing issue: " + e.getMessage());
        }
    }
    
    private void showDeveloperStats(long chatId, long telegramId) throws TelegramApiException {
        User user = userService.findByTelegramId(telegramId);
        if (user == null) {
            sendMessage(chatId, "User not found. Please contact your administrator.");
            return;
        }
        
        // Check if the user has Project Manager rights
        boolean isProjectManager = "Project Manager".equalsIgnoreCase(user.getUserRol());
        
        if (!isProjectManager) {
            // If not Project Manager, just show their own stats
            showSpecificDeveloperStats(chatId, user.getUserId());
            return;
        }
        
        // If Project Manager, show summary of all developers
        List<User> developers = userService.getUsersByRole("DEVELOPER");
        
        if (developers.isEmpty()) {
            sendMessage(chatId, "No developers found in the system.");
            return;
        }
        
        StringBuilder message = new StringBuilder("Developer Statistics Summary:\n\n");
        
        for (User developer : developers) {
            List<Issue> completedIssues = issueService.getIssuesByAssignee(developer.getUserId()).stream()
                    .filter(issue -> issue.getStatus() == 1)
                    .collect(Collectors.toList());
            
            int totalIssues = completedIssues.size();
            int totalHours = completedIssues.stream()
                    .mapToInt(Issue::getHoursWorked)
                    .sum();
            
            message.append("Developer: ").append(developer.getUserName())
                  .append(" (ID: ").append(developer.getUserId()).append(")")
                  .append("\nCompleted Tasks: ").append(totalIssues)
                  .append("\nTotal Hours: ").append(totalHours)
                  .append("\n\n");
        }
        
        message.append("For detailed stats on a specific developer, use:\n")
               .append("/devstats <developer_id>");
        
        sendMessage(chatId, message.toString());
    }

    private void sendMessage(long chatId, String textToSend) throws TelegramApiException {
        SendMessage message = SendMessage.builder()
                .chatId(String.valueOf(chatId))
                .text(textToSend)
                .build();
        execute(message);
    }
}

