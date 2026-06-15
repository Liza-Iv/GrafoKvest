package com.grafokwest.model;

import jakarta.persistence.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(name = "short_text", nullable = false, columnDefinition = "TEXT")
    private String shortText;

    @Column(name = "full_text", nullable = false, columnDefinition = "TEXT")
    private String fullText;

    private String image;
    private String picto;

    @Column(nullable = false)
    private Integer difficulty = 1; // 1=лёгкое, 2=среднее, 3=сложное

    @Column(name = "time_minutes", nullable = false)
    private Integer timeMinutes = 5;

    @Column(columnDefinition = "TEXT")
    private String materials;

    @Column(columnDefinition = "TEXT")
    private String hint;

    @Column(columnDefinition = "TEXT")
    private String develops;

    @Column(name = "order_index")
    private Integer orderIndex = 0;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false)
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private ZonedDateTime updatedAt = ZonedDateTime.now();

    @Column(name = "character_image")
    private String characterImage;

    public String getCharacterImage() { return characterImage; }
    public void setCharacterImage(String characterImage) { this.characterImage = characterImage; }

    // Геттеры и сеттеры
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getShortText() { return shortText; }
    public void setShortText(String shortText) { this.shortText = shortText; }
    public String getFullText() { return fullText; }
    public void setFullText(String fullText) { this.fullText = fullText; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public String getPicto() { return picto; }
    public void setPicto(String picto) { this.picto = picto; }
    public Integer getDifficulty() { return difficulty; }
    public void setDifficulty(Integer difficulty) { this.difficulty = difficulty; }
    public Integer getTimeMinutes() { return timeMinutes; }
    public void setTimeMinutes(Integer timeMinutes) { this.timeMinutes = timeMinutes; }
    public String getMaterials() { return materials; }
    public void setMaterials(String materials) { this.materials = materials; }
    public String getHint() { return hint; }
    public void setHint(String hint) { this.hint = hint; }
    public String getDevelops() { return develops; }
    public void setDevelops(String develops) { this.develops = develops; }
    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
    public ZonedDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(ZonedDateTime updatedAt) { this.updatedAt = updatedAt; }
}