package com.springboot.MyTodoList.controller;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
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

public class IssueBotController extends TelegramLongPollingBot {

    private static final Logger logger = LoggerFactory.getLogger(IssueBotController.class);
    private IssueService issueService;
    private UserService userService;
    private String botName;

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
            switch (messageText) {
                case "/start":
                    startCommandReceived(chatId);
                    break;
                case "/MyAssignedIssues":
                    showAssignedIssues(chatId, telegramId);
                    break;
                case "/CompleteIssue":
                    showCompleteIssuePrompt(chatId);
                    break;
                default:
                    if (messageText.startsWith("/complete ")) {
                        handleIssueCompletion(chatId, telegramId, messageText);
                    } else {
                        sendMessage(chatId, "Please use one of the available commands or buttons.");
                    }
            }
        } catch (TelegramApiException e) {
            logger.error("Error occurred: " + e.getMessage());
        }
    }

    private void startCommandReceived(long chatId) throws TelegramApiException {
        String answer = "Welcome to the TaskMaster!\n\n" +
                "Available commands:\n" +
                BotLabels.MY_ASSIGNED_ISSUES.getLabel() + " - View your assigned issues\n" +
                BotLabels.COMPLETE_ISSUE.getLabel() + " - Complete an issue\n" +
                "/complete <issue_id> <hours> - Complete a specific issue with hours worked";

        sendMessage(chatId, answer);
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

    private void showCompleteIssuePrompt(long chatId) throws TelegramApiException {
        String message = "To complete an issue, use the command:\n" +
                "/complete <issue_id> <hours>\n\n" +
                "Example: /complete 123 4";
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

    private void sendMessage(long chatId, String textToSend) throws TelegramApiException {
        SendMessage message = SendMessage.builder()
                .chatId(String.valueOf(chatId))
                .text(textToSend)
                .build();
        execute(message);
    }
}
    
    