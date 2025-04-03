package com.springboot.MyTodoList.model;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "ISSUE")
public class Issue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ISSUE_ID")
    private Long issueId;

    @Column(name = "ISSUE_TITLE", length = 100)
    private String issueTitle;

    @Column(name = "ISSUE_DESCRIPTION", length = 4000)
    private String issueDescription;

    @Column(name = "DUE_DATE")
    private Date dueDate;

    @Column(name = "ISSUE_TYPE", length = 100)
    private String issueType;

    @Column(name = "ESTIMATION")
    private Integer estimation;

    @Column(name = "ASSIGNEE")
    private Long assignee;

    @Column(name = "ID_SPRINT")
    private Long idSprint;

    @Column(name = "TEAM", length = 100)
    private String team;

    @Column(name = "STATUS")
    private Integer status;

    @Column(name = "HOURS_WORKED")
    private Integer hoursWorked;

    @Column(name = "COMPLETION_NOTES", length = 4000)
    private String completionNotes;

    // Getters and Setters
    public Long getIssueId() {
        return issueId;
    }

    public void setIssueId(Long issueId) {
        this.issueId = issueId;
    }

    public String getIssueTitle() {
        return issueTitle;
    }

    public void setIssueTitle(String issueTitle) {
        this.issueTitle = issueTitle;
    }

    public String getIssueDescription() {
        return issueDescription;
    }

    public void setIssueDescription(String issueDescription) {
        this.issueDescription = issueDescription;
    }

    public Date getDueDate() {
        return dueDate;
    }

    public void setDueDate(Date dueDate) {
        this.dueDate = dueDate;
    }

    public String getIssueType() {
        return issueType;
    }

    public void setIssueType(String issueType) {
        this.issueType = issueType;
    }

    public Integer getEstimation() {
        return estimation;
    }

    public void setEstimation(Integer estimation) {
        this.estimation = estimation;
    }

    public Long getAssignee() {
        return assignee;
    }

    public void setAssignee(Long assignee) {
        this.assignee = assignee;
    }

    public Long getIdSprint() {
        return idSprint;
    }

    public void setIdSprint(Long idSprint) {
        this.idSprint = idSprint;
    }

    public String getTeam() {
        return team;
    }

    public void setTeam(String team) {
        this.team = team;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public Integer getHoursWorked() {
        return hoursWorked;
    }

    public void setHoursWorked(Integer hoursWorked) {
        this.hoursWorked = hoursWorked;
    }

    public String getCompletionNotes() {
        return completionNotes;
    }

    public void setCompletionNotes(String completionNotes) {
        this.completionNotes = completionNotes;
    }

} 