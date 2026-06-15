package com.grafokwest.controller;

import com.grafokwest.config.JwtUtil;
import com.grafokwest.model.*;
import com.grafokwest.repository.*;
import com.grafokwest.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.*;

@RestController
@RequestMapping("/api")
public class ProfileController {

    private final UserRepository userRepository;
    private final ChildRepository childRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final ProgressService progressService;
    private final ActivityLogService activityLogService;
    private final JwtUtil jwtUtil;

    public ProfileController(UserRepository userRepository,
                             ChildRepository childRepository,
                             FamilyMemberRepository familyMemberRepository,
                             ProgressService progressService,
                             ActivityLogService activityLogService,
                             JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.childRepository = childRepository;
        this.familyMemberRepository = familyMemberRepository;
        this.progressService = progressService;
        this.activityLogService = activityLogService;
        this.jwtUtil = jwtUtil;
    }

    private User getCurrentUser(String authHeader) {
        Long userId = jwtUtil.getUserIdFromToken(authHeader);
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String auth) {
        User user = getCurrentUser(auth);

        List<Map<String, Object>> childrenList = new ArrayList<>();
        for (Child child : user.getChildren()) {
            Map<String, Object> cm = new LinkedHashMap<>();
            cm.put("id", child.getId());
            cm.put("name", child.getName());
            cm.put("age", child.getAge());
            cm.put("totalStars", (int) progressService.getTotalCount(child.getId()));
            cm.put("todayProgress", (int) progressService.getTodayCount(child.getId()));
            cm.put("totalTasks", 5);
            cm.put("weekProgress", (int) progressService.getWeekCount(child.getId()));
            childrenList.add(cm);
        }

        List<Map<String, String>> familyList = new ArrayList<>();
        for (FamilyMember fm : user.getFamilyMembers()) {
            Map<String, String> fmMap = new LinkedHashMap<>();
            fmMap.put("id", fm.getId().toString());
            fmMap.put("name", fm.getName());
            fmMap.put("role", fm.getRole());
            familyList.add(fmMap);
        }

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("parentName", user.getFullName());
        resp.put("parentEmail", user.getEmail());
        resp.put("children", childrenList);
        resp.put("familyMembers", familyList);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/profile/child")
    public ResponseEntity<?> addChild(@RequestHeader("Authorization") String auth,
                                      @RequestBody Map<String, Object> body) {
        User user = getCurrentUser(auth);
        String name = (String) body.get("name");
        Integer age = body.get("age") != null ? ((Number) body.get("age")).intValue() : null;
        if (name == null || name.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "Имя обязательно"));
        Child child = new Child();
        child.setName(name);
        child.setAge(age);
        child.setUser(user);
        child = childRepository.save(child);
        return ResponseEntity.status(201).body(Map.of("message", "Ребёнок добавлен", "childId", child.getId()));
    }

    @PostMapping("/profile/family")
    public ResponseEntity<?> addFamilyMember(@RequestHeader("Authorization") String auth,
                                             @RequestBody Map<String, String> body) {
        User user = getCurrentUser(auth);
        String name = body.get("name");
        String role = body.get("role");
        if (name == null || name.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "Имя обязательно"));
        FamilyMember fm = new FamilyMember();
        fm.setName(name);
        fm.setRole(role != null ? role : "father");
        fm.setUser(user);
        fm = familyMemberRepository.save(fm);
        return ResponseEntity.status(201).body(Map.of("message", "Член семьи добавлен", "id", fm.getId()));
    }

    @PutMapping("/profile/update-name")
    public ResponseEntity<?> updateName(@RequestHeader("Authorization") String auth,
                                        @RequestBody Map<String, String> body) {
        User user = getCurrentUser(auth);
        String newName = body.get("fullName");
        if (newName == null || newName.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "Имя обязательно"));
        user.setFullName(newName);
        user.setUpdatedAt(ZonedDateTime.now());
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Имя обновлено"));
    }

    @PutMapping("/profile/update-child")
    public ResponseEntity<?> updateChild(@RequestHeader("Authorization") String auth,
                                         @RequestBody Map<String, Object> body) {
        getCurrentUser(auth);
        Long childId = body.get("childId") != null ? ((Number) body.get("childId")).longValue() : null;
        String name = (String) body.get("name");
        Integer age = body.get("age") != null ? ((Number) body.get("age")).intValue() : null;
        if (childId == null || name == null || name.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error", "ID и имя обязательны"));
        Child child = childRepository.findById(childId).orElse(null);
        if (child == null) return ResponseEntity.status(404).body(Map.of("error", "Ребёнок не найден"));
        child.setName(name);
        child.setAge(age);
        childRepository.save(child);
        return ResponseEntity.ok(Map.of("message", "Данные ребёнка обновлены"));
    }
}