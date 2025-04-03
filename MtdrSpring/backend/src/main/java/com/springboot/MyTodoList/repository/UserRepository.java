package com.springboot.MyTodoList.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.springboot.MyTodoList.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUserId(String userId); // Método para buscar un usuario por su userId
    User findByTelegramId(Long telegramId);
} 

