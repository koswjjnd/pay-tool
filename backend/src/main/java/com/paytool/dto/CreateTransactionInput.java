package com.paytool.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreateTransactionInput {
    private String senderId;
    private String receiverId;
    private BigDecimal amount;
    private String description;
} 