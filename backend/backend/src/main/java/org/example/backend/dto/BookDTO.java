package org.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class BookDTO {
    private Long id;
    private String title;
    private String description;
    private String bookCondition;
    private String authorName;
    private BigDecimal price;
    private String pictureUrl;
    private String userFirstName;
    private Long userId;
    private String userProfilePictureUrl;
    private boolean available;
}
