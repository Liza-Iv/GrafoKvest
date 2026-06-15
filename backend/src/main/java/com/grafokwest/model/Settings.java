package com.grafokwest.model;

import jakarta.persistence.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "settings")
public class Settings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_id", unique = true, nullable = false)
    private Child child;

    @Column(name = "voice_enabled", nullable = false)
    private Boolean voiceEnabled = true;

    @Column(name = "sound_enabled", nullable = false)
    private Boolean soundEnabled = true;

    @Column(name = "speech_rate", nullable = false, length = 20)
    private String speechRate = "normal";

    @Column(name = "icon_style", nullable = false, length = 20)
    private String iconStyle = "regular";

    @Column(name = "big_font", nullable = false)
    private Boolean bigFont = false;

    @Column(name = "color_theme", nullable = false, length = 20)
    private String colorTheme = "standard";

    @Column(name = "hints_enabled", nullable = false)
    private Boolean hintsEnabled = true;

    @Column(name = "timer_enabled", nullable = false)
    private Boolean timerEnabled = false;

    @Column(name = "timer_duration", nullable = false)
    private Integer timerDuration = 5;

    @Column(name = "updated_at", nullable = false)
    private ZonedDateTime updatedAt = ZonedDateTime.now();

    public Settings() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Child getChild() { return child; }
    public void setChild(Child child) { this.child = child; }
    public Boolean getVoiceEnabled() { return voiceEnabled; }
    public void setVoiceEnabled(Boolean voiceEnabled) { this.voiceEnabled = voiceEnabled; }
    public Boolean getSoundEnabled() { return soundEnabled; }
    public void setSoundEnabled(Boolean soundEnabled) { this.soundEnabled = soundEnabled; }
    public String getSpeechRate() { return speechRate; }
    public void setSpeechRate(String speechRate) { this.speechRate = speechRate; }
    public String getIconStyle() { return iconStyle; }
    public void setIconStyle(String iconStyle) { this.iconStyle = iconStyle; }
    public Boolean getBigFont() { return bigFont; }
    public void setBigFont(Boolean bigFont) { this.bigFont = bigFont; }
    public String getColorTheme() { return colorTheme; }
    public void setColorTheme(String colorTheme) { this.colorTheme = colorTheme; }
    public Boolean getHintsEnabled() { return hintsEnabled; }
    public void setHintsEnabled(Boolean hintsEnabled) { this.hintsEnabled = hintsEnabled; }
    public Boolean getTimerEnabled() { return timerEnabled; }
    public void setTimerEnabled(Boolean timerEnabled) { this.timerEnabled = timerEnabled; }
    public Integer getTimerDuration() { return timerDuration; }
    public void setTimerDuration(Integer timerDuration) { this.timerDuration = timerDuration; }
    public ZonedDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(ZonedDateTime updatedAt) { this.updatedAt = updatedAt; }
}