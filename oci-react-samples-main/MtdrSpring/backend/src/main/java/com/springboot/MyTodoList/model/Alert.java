package com.springboot.MyTodoList.model;

import javax.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "ALERT")
public class Alert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "MESSAGE")
    private String message;

    @Column(name = "TASK_ID")
    private Long taskId;

    @Column(name = "TASK")
    private String task;

    @Column(name = "PROJECT_ID")
    private Long projectId;

    @Column(name = "USER_ID")
    private String userId;  // User for notifications

    @Column(name = "PRIORITY")
    private String priority;

    @Column(name = "SCHEDULED_TIME")
    private OffsetDateTime scheduledTime;

    @Column(name = "STATUS")
    private String status;  // e.g., 'PENDING', 'SENT'


    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public String getTask() {
        return task;
    }

    public void setTask(String task) {
        this.task = task;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public OffsetDateTime getScheduledTime() {
        return scheduledTime;
    }

    public void setScheduledTime(OffsetDateTime scheduledTime) {
        this.scheduledTime = scheduledTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "Alert{" +
                "id=" + id +
                ", message='" + message + '\'' +
                ", taskId=" + taskId +
                ", task='" + task + '\'' +
                ", projectId=" + projectId +
                ", userId='" + userId + '\'' +
                ", priority='" + priority + '\'' +
                ", scheduledTime=" + scheduledTime +
                ", status='" + status + '\'' +
                '}';
    }
}
