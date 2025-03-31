package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Issue;
import com.springboot.MyTodoList.service.IssueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/issues")
public class IssueController {

    @Autowired
    private IssueService issueService;

    // Get all issues
    @GetMapping
    public List<Issue> getAllIssues() {
        return issueService.getAllIssues();
    }

    // Get a specific issue by ID
    @GetMapping("/{id}")
    public ResponseEntity<Issue> getIssueById(@PathVariable Long id) {
        Optional<Issue> issue = issueService.getIssueById(id);
        return issue.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Create a new issue
    @PostMapping
    public ResponseEntity<Issue> createIssue(@RequestBody Issue issue) {
        Issue createdIssue = issueService.createIssue(issue);
        return new ResponseEntity<>(createdIssue, HttpStatus.CREATED);
    }

    // Update an existing issue
    @PutMapping("/{id}")
    public ResponseEntity<Issue> updateIssue(@PathVariable Long id, @RequestBody Issue issueDetails) {
        try {
            Issue updatedIssue = issueService.updateIssue(id, issueDetails);
            return new ResponseEntity<>(updatedIssue, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete an issue
    @DeleteMapping("/{id}")
    public ResponseEntity<Boolean> deleteIssue(@PathVariable Long id) {
        boolean isDeleted = issueService.deleteIssue(id);
        if (isDeleted) {
            return new ResponseEntity<>(true, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(false, HttpStatus.NOT_FOUND);
        }
    }
} 