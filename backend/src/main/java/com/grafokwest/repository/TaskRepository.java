package com.grafokwest.repository;

import com.grafokwest.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByIsActiveTrueOrderByOrderIndex();
}