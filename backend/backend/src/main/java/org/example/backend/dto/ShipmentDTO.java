package org.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ShipmentDTO {
    private String firstName;
    private String lastName;
    private String city;
    private String postalCode;
    private String street;
    private String streetNumber;
    private String apartmentNumber;
}
