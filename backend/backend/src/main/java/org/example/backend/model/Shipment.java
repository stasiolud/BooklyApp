package org.example.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import lombok.Data;


@Data
@Entity
public class Shipment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;
    private String email;

    private String phone;
    private String city;
    private String postalCode;
    private String street;
    private String streetNumber;
    private String apartmentNumber;

    public Shipment() {
    }

    public Shipment(String phone, String city, String postalCode, String street,
                    String streetNumber, String apartmentNumber) {
        this.phone = phone;
        this.city = city;
        this.postalCode = postalCode;
        this.street = street;
        this.streetNumber = streetNumber;
        this.apartmentNumber = apartmentNumber;
    }
}
