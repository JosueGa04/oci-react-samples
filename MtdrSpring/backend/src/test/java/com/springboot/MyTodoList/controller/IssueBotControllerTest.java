package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Issue;
import com.springboot.MyTodoList.model.User;
import com.springboot.MyTodoList.service.IssueService;
import com.springboot.MyTodoList.service.UserService;
import com.springboot.MyTodoList.util.BotLabels;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Chat;
import org.telegram.telegrambots.meta.api.objects.Message;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IssueBotControllerTest {

    @Mock
    private IssueService issueService;

    @Mock
    private UserService userService;

    private IssueBotController botController;
    private static final String BOT_TOKEN = "test_token";
    private static final String BOT_NAME = "test_bot";

    @BeforeEach
    void setUp() throws TelegramApiException {
        MockitoAnnotations.openMocks(this);
        botController = spy(new IssueBotController(BOT_TOKEN, BOT_NAME, issueService, userService));
        doReturn(new Message()).when(botController).execute(any(SendMessage.class));
    }

    @Test
    void testCreateTask() throws TelegramApiException {
        // Mock user (Project Manager)
        User projectManager = new User();
        projectManager.setUserId(5L);
        projectManager.setUserRol("Project Manager");
        projectManager.setTelegramId(123L);

        // Mock developer
        User developer = new User();
        developer.setUserId(1L);
        developer.setUserRol("Engineer");
        developer.setUserName("Test Developer");

        // Setup mocks
        when(userService.findByTelegramId(123L)).thenReturn(projectManager);
        when(userService.getUsersByRole("Engineer")).thenReturn(Arrays.asList(developer));
        when(userService.getUserById(1L)).thenReturn(Optional.of(developer));
        when(issueService.createIssue(any(Issue.class))).thenReturn(new Issue());

        // Create base update with user info
        Update update = createBaseUpdate(123L);
        Message message = update.getMessage();

        // Test task creation steps
        // 1. Start task creation
        message.setText(BotLabels.CREATE_NEW_TASK.getLabel());
        botController.onUpdateReceived(update);

        // 2. Enter title
        message.setText("Test Task");
        botController.onUpdateReceived(update);

        // 3. Enter description
        message.setText("Test Description");
        botController.onUpdateReceived(update);

        // 4. Enter estimation
        message.setText("5");
        botController.onUpdateReceived(update);

        // 5. Enter due date
        message.setText("2024-12-31");
        botController.onUpdateReceived(update);

        // 6. Select developer
        message.setText("1");
        botController.onUpdateReceived(update);

        // Verify issue creation
        verify(issueService, times(1)).createIssue(any(Issue.class));
        verify(botController, atLeastOnce()).execute(any(SendMessage.class));
    }

    @Test
    void testViewCompletedTasksInSprint() throws TelegramApiException {
        // Mock user
        User user = new User();
        user.setUserId(1L);
        user.setTelegramId(123L);

        // Mock completed issues
        Issue completedIssue1 = new Issue();
        completedIssue1.setIssueId(1L);
        completedIssue1.setIssueTitle("Completed Task 1");
        completedIssue1.setStatus(1);
        completedIssue1.setHoursWorked(5);

        Issue completedIssue2 = new Issue();
        completedIssue2.setIssueId(2L);
        completedIssue2.setIssueTitle("Completed Task 2");
        completedIssue2.setStatus(1);
        completedIssue2.setHoursWorked(3);

        // Setup mocks
        when(userService.findByTelegramId(123L)).thenReturn(user);
        when(issueService.getIssuesByAssignee(1L)).thenReturn(Arrays.asList(completedIssue1, completedIssue2));

        // Create base update with user info
        Update update = createBaseUpdate(123L);
        Message message = update.getMessage();
        
        // Send command to view completed tasks
        message.setText(BotLabels.MY_ASSIGNED_ISSUES.getLabel());
        botController.onUpdateReceived(update);

        // Verify service calls
        verify(issueService, times(1)).getIssuesByAssignee(1L);
    }

    @Test
    void testViewUserCompletedTasksInSprint() throws TelegramApiException {
        // Mock Project Manager
        User projectManager = new User();
        projectManager.setUserId(5L);
        projectManager.setUserRol("Project Manager");
        projectManager.setTelegramId(123L);

        // Mock developer
        User developer = new User();
        developer.setUserId(1L);
        developer.setUserRol("Engineer");
        developer.setUserName("Test Developer");

        // Mock completed issues
        Issue completedIssue = new Issue();
        completedIssue.setIssueId(1L);
        completedIssue.setIssueTitle("Completed Task");
        completedIssue.setStatus(1);
        completedIssue.setHoursWorked(5);
        completedIssue.setAssignee(1L);

        // Setup mocks
        when(userService.findByTelegramId(123L)).thenReturn(projectManager);
        when(userService.getUsersByRole("Engineer")).thenReturn(Arrays.asList(developer));
        when(userService.getUserById(1L)).thenReturn(Optional.of(developer));
        when(issueService.getIssuesByAssignee(1L)).thenReturn(Arrays.asList(completedIssue));

        // Create base update with user info
        Update update = createBaseUpdate(123L);
        Message message = update.getMessage();
        
        // Send command to view developer stats
        message.setText(BotLabels.DEVELOPER_STATS.getLabel());
        botController.onUpdateReceived(update);

        // Select developer
        message.setText("1");
        botController.onUpdateReceived(update);

        // Verify service calls
        verify(userService, times(1)).getUserById(1L);
        verify(issueService, times(1)).getIssuesByAssignee(1L);
    }

    private Update createBaseUpdate(Long telegramId) {
        Update update = new Update();
        Message message = new Message();
        Chat chat = new Chat();
        chat.setId(telegramId);
        message.setChat(chat);
        
        org.telegram.telegrambots.meta.api.objects.User telegramUser = new org.telegram.telegrambots.meta.api.objects.User();
        telegramUser.setId(telegramId);
        message.setFrom(telegramUser);
        
        update.setMessage(message);
        return update;
    }
} 