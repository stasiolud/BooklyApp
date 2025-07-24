package org.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class BookInfoDTO {
    private String title;
    private String bookCondition;
    private BigDecimal price;
    private String pictureUrl;
}
