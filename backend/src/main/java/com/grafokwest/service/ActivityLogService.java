package com.grafokwest.service;

import com.grafokwest.model.ActivityLog;
import com.grafokwest.model.User;
import com.grafokwest.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;

@Service
public class ActivityLogService {

    private final ActivityLogRepository repo;

    public ActivityLogService(ActivityLogRepository repo) {
        this.repo = repo;
    }

    public void log(User user, String action, String details) {
        ActivityLog log = new ActivityLog(user, action, details);
        repo.save(log);
    }
}