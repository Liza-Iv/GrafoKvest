package com.grafokwest.service;

import com.grafokwest.repository.ProgressRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;

@Service
public class ProgressService {

    private final ProgressRepository progressRepository;

    public ProgressService(ProgressRepository progressRepository) {
        this.progressRepository = progressRepository;
    }

    public long getTotalCount(Long childId) {
        return progressRepository.countByChildId(childId);
    }

    public long getTodayCount(Long childId) {
        return progressRepository.countByChildIdAndCompletedAt(childId, LocalDate.now());
    }

    public long getWeekCount(Long childId) {
        LocalDate today = LocalDate.now();
        LocalDate weekAgo = today.minusDays(7);
        return progressRepository.countByChildIdAndCompletedAtBetween(childId, weekAgo, today);
    }
}