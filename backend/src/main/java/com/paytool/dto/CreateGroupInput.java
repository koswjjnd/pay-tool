package com.paytool.dto;

import lombok.Data;

@Data
public class CreateGroupInput {
    private Long leaderId;
    private Double totalAmount;
    private String description;
} 