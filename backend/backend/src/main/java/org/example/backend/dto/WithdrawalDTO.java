package org.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class WithdrawalDTO {
    private Long id;
    private String accountNumber;
    private BigDecimal amount;
    private LocalDateTime timestamp;
}
