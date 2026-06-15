package com.grafokwest.controller;

import com.grafokwest.model.Task;
import com.grafokwest.repository.TaskRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TaskController {

    private final TaskRepository taskRepository;

    public TaskController(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    /** GET /api/tasks — получить все активные задания */
    @GetMapping("/tasks")
    public List<Task> getAllTasks() {
        return taskRepository.findByIsActiveTrueOrderByOrderIndex();
    }
}