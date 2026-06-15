package com.grafokwest.controller;

import com.grafokwest.config.JwtUtil;
import com.grafokwest.model.Child;
import com.grafokwest.model.Settings;
import com.grafokwest.repository.ChildRepository;
import com.grafokwest.repository.SettingsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingsRepository settingsRepository;
    private final ChildRepository childRepository;
    private final JwtUtil jwtUtil;

    public SettingsController(SettingsRepository settingsRepository,
                              ChildRepository childRepository,
                              JwtUtil jwtUtil) {
        this.settingsRepository = settingsRepository;
        this.childRepository = childRepository;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/{childId}")
    public ResponseEntity<Map<String, Object>> getSettings(@PathVariable Long childId) {
        var opt = settingsRepository.findByChildId(childId);
        if (opt.isPresent()) {
            var s = opt.get();
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("voiceEnabled", s.getVoiceEnabled());
            map.put("soundEnabled", s.getSoundEnabled());
            map.put("speechRate", s.getSpeechRate());
            map.put("iconStyle", s.getIconStyle());
            map.put("bigFont", s.getBigFont());
            map.put("colorTheme", s.getColorTheme());
            map.put("hintsEnabled", s.getHintsEnabled());
            map.put("timerEnabled", s.getTimerEnabled());
            map.put("timerDuration", s.getTimerDuration());
            return ResponseEntity.ok(map);
        }
        return ResponseEntity.ok(getDefaults());
    }

    @PostMapping("/{childId}")
    public ResponseEntity<?> saveSettings(@RequestHeader("Authorization") String auth,
                                          @PathVariable Long childId,
                                          @RequestBody Map<String, Object> body) {
        // Проверка авторизации
        jwtUtil.getUserIdFromToken(auth);

        Child child = childRepository.findById(childId).orElse(null);
        if (child == null) return ResponseEntity.status(404).body(Map.of("error", "Ребёнок не найден"));

        Settings s = settingsRepository.findByChildId(childId).orElse(new Settings());
        s.setChild(child);
        if (body.containsKey("voiceEnabled")) s.setVoiceEnabled((Boolean) body.get("voiceEnabled"));
        if (body.containsKey("soundEnabled")) s.setSoundEnabled((Boolean) body.get("soundEnabled"));
        if (body.containsKey("speechRate")) s.setSpeechRate((String) body.get("speechRate"));
        if (body.containsKey("iconStyle")) s.setIconStyle((String) body.get("iconStyle"));
        if (body.containsKey("bigFont")) s.setBigFont((Boolean) body.get("bigFont"));
        if (body.containsKey("colorTheme")) s.setColorTheme((String) body.get("colorTheme"));
        if (body.containsKey("hintsEnabled")) s.setHintsEnabled((Boolean) body.get("hintsEnabled"));
        if (body.containsKey("timerEnabled")) s.setTimerEnabled((Boolean) body.get("timerEnabled"));
        if (body.containsKey("timerDuration")) s.setTimerDuration(((Number) body.get("timerDuration")).intValue());
        s.setUpdatedAt(ZonedDateTime.now());
        settingsRepository.save(s);
        return ResponseEntity.ok(Map.of("message", "Настройки сохранены"));
    }

    private Map<String, Object> getDefaults() {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("voiceEnabled", true);
        map.put("soundEnabled", true);
        map.put("speechRate", "normal");
        map.put("iconStyle", "regular");
        map.put("bigFont", false);
        map.put("colorTheme", "standard");
        map.put("hintsEnabled", true);
        map.put("timerEnabled", false);
        map.put("timerDuration", 5);
        return map;
    }
}