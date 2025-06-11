package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.repository.SprintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SprintService {

    @Autowired
    private SprintRepository sprintRepository;

    // Create a new sprint
    public Sprint createSprint(Sprint sprint) {
        return sprintRepository.save(sprint);
    }

    // Get all sprints
    public List<Sprint> getAllSprints() {
        return sprintRepository.findAll();
    }

    // Get a sprint by ID
    public Optional<Sprint> getSprintById(Long id) {
        return sprintRepository.findById(id);
    }

    // Get the most recent sprint
    public Optional<Sprint> getMostRecentSprint() {
        List<Sprint> sprints = sprintRepository.findAll();
        if (sprints.isEmpty()) {
            return Optional.empty();
        }
        return sprints.stream()
                .max((s1, s2) -> s1.getEndDate().compareTo(s2.getEndDate()));
    }

    // Update an existing sprint
    public Sprint updateSprint(Long id, Sprint sprintDetails) throws Exception {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new Exception("Sprint not found"));

        sprint.setStartDate(sprintDetails.getStartDate());
        sprint.setEndDate(sprintDetails.getEndDate());
        sprint.setSprintGoal(sprintDetails.getSprintGoal());

        return sprintRepository.save(sprint);
    }

    // Delete a sprint
    public boolean deleteSprint(Long id) {
        try {
            sprintRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
} 