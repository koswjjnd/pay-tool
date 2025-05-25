package com.paytool.dto;

import lombok.Data;

@Data
public class CreateUserInput {
    private String username;
    private String password;
    private String email;
    private String name;
} 