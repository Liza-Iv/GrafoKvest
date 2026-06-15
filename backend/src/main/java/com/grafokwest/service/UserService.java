package com.grafokwest.service;

import com.grafokwest.model.Child;
import com.grafokwest.model.User;
import com.grafokwest.repository.ChildRepository;
import com.grafokwest.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final ChildRepository childRepository;
    private final ActivityLogService activityLogService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);

    public UserService(UserRepository userRepository,
                       ChildRepository childRepository,
                       ActivityLogService activityLogService) {
        this.userRepository = userRepository;
        this.childRepository = childRepository;
        this.activityLogService = activityLogService;
    }

    public User register(String fullName, String email, String password, String role, String childName) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Пользователь с таким email уже существует");
        }
        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role != null ? role : "parent");
        user = userRepository.save(user);

        if ("parent".equals(user.getRole()) && childName != null && !childName.isEmpty()) {
            Child child = new Child();
            child.setName(childName);
            child.setUser(user);
            childRepository.save(child);
            user.getChildren().add(child);
        }
        activityLogService.log(user, "REGISTER", "{\"userId\":" + user.getId() + "}");
        return user;
    }

    public User login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Неверный email или пароль"));
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Неверный email или пароль");
        }
        activityLogService.log(user, "LOGIN", "{\"userId\":" + user.getId() + "}");
        return user;
    }
}