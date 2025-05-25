package com.paytool.dto;

import lombok.Data;

@Data
public class UpdateUserInput {
    private String email;
    private String name;
    private String password;
} 