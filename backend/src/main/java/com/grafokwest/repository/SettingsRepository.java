package com.grafokwest.repository;

import com.grafokwest.model.Settings;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SettingsRepository extends JpaRepository<Settings, Long> {
    Optional<Settings> findByChildId(Long childId);
}