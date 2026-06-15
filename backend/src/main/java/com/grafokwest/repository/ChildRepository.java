package com.grafokwest.repository;

import com.grafokwest.model.Child;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChildRepository extends JpaRepository<Child, Long> {
    List<Child> findByUserId(Long userId);
}