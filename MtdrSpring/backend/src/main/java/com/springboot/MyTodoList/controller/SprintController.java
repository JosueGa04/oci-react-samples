package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.service.SprintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/sprints")
public class SprintController {

    @Autowired
    private SprintService sprintService;

    // Get all sprints
    @GetMapping
    public List<Sprint> getAllSprints() {
        return sprintService.getAllSprints();
    }

    // Get a specific sprint by ID
    @GetMapping("/{id}")
    public ResponseEntity<Sprint> getSprintById(@PathVariable Long id) {
        Optional<Sprint> sprint = sprintService.getSprintById(id);
        return sprint.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Create a new sprint
    @PostMapping
    public ResponseEntity<Sprint> createSprint(@RequestBody Sprint sprint) {
        Sprint createdSprint = sprintService.createSprint(sprint);
        return new ResponseEntity<>(createdSprint, HttpStatus.CREATED);
    }

    // Update an existing sprint
    @PutMapping("/{id}")
    public ResponseEntity<Sprint> updateSprint(@PathVariable Long id, @RequestBody Sprint sprintDetails) {
        try {
            Sprint updatedSprint = sprintService.updateSprint(id, sprintDetails);
            return new ResponseEntity<>(updatedSprint, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete a sprint
    @DeleteMapping("/{id}")
    public ResponseEntity<Boolean> deleteSprint(@PathVariable Long id) {
        boolean isDeleted = sprintService.deleteSprint(id);
        if (isDeleted) {
            return new ResponseEntity<>(true, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(false, HttpStatus.NOT_FOUND);
        }
    }
} 