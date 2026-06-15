package com.grafokwest.repository;

import com.grafokwest.model.FamilyMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FamilyMemberRepository extends JpaRepository<FamilyMember, Long> {
    List<FamilyMember> findByUserId(Long userId);
}