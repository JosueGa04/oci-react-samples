package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Issue;
import com.springboot.MyTodoList.repository.IssueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class IssueService {

    @Autowired
    private IssueRepository issueRepository;

    // Create a new issue
    public Issue createIssue(Issue issue) {
        return issueRepository.save(issue);
    }

    // Get all issues
    public List<Issue> getAllIssues() {
        return issueRepository.findAll();
    }

    // Get an issue by ID
    public Optional<Issue> getIssueById(Long id) {
        return issueRepository.findById(id);
    }

    // Get issues by assignee
    public List<Issue> getIssuesByAssignee(Long assigneeId) {
        return issueRepository.findByAssignee(assigneeId);
    }

    // Update an existing issue
    public Issue updateIssue(Long id, Issue issueDetails) throws Exception {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new Exception("Issue not found"));

        issue.setIssueTitle(issueDetails.getIssueTitle());
        issue.setIssueDescription(issueDetails.getIssueDescription());
        issue.setDueDate(issueDetails.getDueDate());
        issue.setIssueType(issueDetails.getIssueType());
        issue.setEstimation(issueDetails.getEstimation());
        issue.setAssignee(issueDetails.getAssignee());
        issue.setIdSprint(issueDetails.getIdSprint());
        issue.setTeam(issueDetails.getTeam());
        issue.setStatus(issueDetails.getStatus());
        issue.setHoursWorked(issueDetails.getHoursWorked());

        return issueRepository.save(issue);
    }

    // Delete an issue
    public boolean deleteIssue(Long id) {
        try {
            issueRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
} 