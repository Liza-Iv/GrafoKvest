package com.grafokwest.controller;

import com.grafokwest.config.JwtUtil;
import com.grafokwest.model.*;
import com.grafokwest.repository.*;
import com.grafokwest.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final ProgressService progressService;
    private final UserRepository userRepository;
    private final ChildRepository childRepository;
    private final TaskRepository taskRepository;
    private final ProgressRepository progressRepository;
    private final JwtUtil jwtUtil;

    public ProgressController(ProgressService progressService,
                              UserRepository userRepository,
                              ChildRepository childRepository,
                              TaskRepository taskRepository,
                              ProgressRepository progressRepository,
                              JwtUtil jwtUtil) {
        this.progressService = progressService;
        this.userRepository = userRepository;
        this.childRepository = childRepository;
        this.taskRepository = taskRepository;
        this.progressRepository = progressRepository;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/{childId}")
    public Map<String, Object> getProgress(@PathVariable Long childId) {
        long today = progressService.getTodayCount(childId);
        long week = progressService.getWeekCount(childId);
        long total = progressService.getTotalCount(childId);
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("todayCount", today);
        resp.put("weekCount", week);
        resp.put("totalCount", total);
        resp.put("todayPercent", Math.min((today / 5.0) * 100, 100));
        resp.put("weekPercent", Math.min((week / 35.0) * 100, 100));
        return resp;
    }

    @PostMapping("/{taskId}")
    public ResponseEntity<?> saveProgress(@RequestHeader("Authorization") String auth,
                                          @PathVariable Long taskId,
                                          @RequestParam Long childId) {
        User user = userRepository.findById(jwtUtil.getUserIdFromToken(auth))
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        Child child = childRepository.findById(childId).orElse(null);
        if (child == null) return ResponseEntity.status(404).body(Map.of("error", "Ребёнок не найден"));
        if (!child.getUser().getId().equals(user.getId()))
            return ResponseEntity.status(403).body(Map.of("error", "Нет доступа"));

        Task task = taskRepository.findById(taskId).orElse(null);
        if (task == null) return ResponseEntity.status(404).body(Map.of("error", "Задание не найдено"));

        boolean exists = progressRepository.existsByChildIdAndTaskIdAndCompletedAt(childId, taskId, LocalDate.now());
        if (exists) return ResponseEntity.ok(Map.of("message", "Уже выполнено сегодня"));

        Progress p = new Progress();
        p.setUser(user);
        p.setChild(child);
        p.setTask(task);
        p.setCompletedAt(LocalDate.now());
        progressRepository.save(p);
        return ResponseEntity.ok(Map.of("message", "Прогресс сохранён"));
    }
}