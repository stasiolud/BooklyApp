package org.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class TransactionDTO {
    private Long id;
    private BookInfoDTO book;
    private ShipmentDTO shipment;
    private LocalDateTime timestamp;
}
