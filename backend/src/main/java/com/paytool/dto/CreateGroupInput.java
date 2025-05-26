package com.paytool.dto;

import lombok.Data;

@Data
public class CreateGroupInput {
    private Long leaderId;
    private Double totalAmount;
    private String name;
    private String description;
    private Integer totalPeople;

    public Integer getTotalPeople() {
        return totalPeople;
    }
    
    public void setTotalPeople(Integer totalPeople) {
        this.totalPeople = totalPeople;
    }
} 