package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {
    // Additional query methods can be defined here if needed
} 