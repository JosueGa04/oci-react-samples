package com.springboot.MyTodoList.model;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "SPRINT")
public class Sprint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_SPRINT")
    private Long idSprint;
    
    @Column(name = "START_DATE")
    private Date startDate;

    @Column(name = "END_DATE")
    private Date endDate;
    
    @Column(name = "SPRINT_GOAL", length = 4000)
    private String sprintGoal;

    // Getters and Setters
    public Long getIdSprint() {
        return idSprint;
    }

    public void setIdSprint(Long idSprint) {
        this.idSprint = idSprint;
    }

    public Date getStartDate() {
        return startDate;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public Date getEndDate() {
        return endDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }

    public String getSprintGoal() {
        return sprintGoal;
    }

    public void setSprintGoal(String sprintGoal) {
        this.sprintGoal = sprintGoal;
    }
}
