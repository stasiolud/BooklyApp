package org.example.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User buyer;

    @ManyToOne
    private User seller;

    @OneToOne
    private Book book;

    @OneToOne(cascade = CascadeType.ALL)
    private Shipment shipment;

    @OneToOne(cascade = CascadeType.ALL)
    private Payment payment;

    private LocalDateTime timestamp;

    @Column(nullable = false)
    private BigDecimal price;
}
