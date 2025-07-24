package org.example.backend.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class WithdrawalRequestDTO {
    private String accountNumber;
    private BigDecimal amount;
}
