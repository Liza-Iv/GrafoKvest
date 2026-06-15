package com.grafokwest.dto;

public class ProgressResponse {
    private int completedCount;
    private int totalCount;
    private String message;

    public ProgressResponse(int completedCount, int totalCount, String message) {
        this.completedCount = completedCount;
        this.totalCount = totalCount;
        this.message = message;
    }

    public int getCompletedCount() { return completedCount; }
    public int getTotalCount() { return totalCount; }
    public String getMessage() { return message; }
}