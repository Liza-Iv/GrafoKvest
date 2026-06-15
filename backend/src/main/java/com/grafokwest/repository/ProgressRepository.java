package com.grafokwest.repository;

import com.grafokwest.model.Progress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;

public interface ProgressRepository extends JpaRepository<Progress, Long> {
    long countByChildId(Long childId);
    long countByChildIdAndCompletedAt(Long childId, LocalDate date);
    long countByChildIdAndCompletedAtBetween(Long childId, LocalDate start, LocalDate end);
    boolean existsByChildIdAndTaskIdAndCompletedAt(Long childId, Long taskId, LocalDate date);
}