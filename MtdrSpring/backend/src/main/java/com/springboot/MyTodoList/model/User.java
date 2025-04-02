package com.springboot.MyTodoList.model;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "USERS")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "USER_ID", columnDefinition = "NUMBER")
    private Long userId;
    
    @Column(name = "TELEGRAM_ID", columnDefinition = "NUMBER")
    private Long telegramId;
    
    @Column(name = "USER_NAME", columnDefinition = "VARCHAR(4000)")
    private String userName;
    
    @Column(name = "USER_ROL", columnDefinition = "VARCHAR(4000)")
    private String userRol;

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getTelegramId() {
        return telegramId;
    }

    public void setTelegramId(Long telegramId) {
        this.telegramId = telegramId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserRol() {
        return userRol;
    }

    public void setUserRol(String userRol) {
        this.userRol = userRol;
    }
} 