package org.example.backend.dto;

import lombok.Data;
import org.example.backend.model.Payment;
import org.example.backend.model.Shipment;

@Data
public class TransactionRequestDTO {
    private Long bookId;
    private Shipment shipment;
    private Payment payment;
}
