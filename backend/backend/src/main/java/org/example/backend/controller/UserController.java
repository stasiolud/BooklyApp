package org.example.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.example.backend.dto.UserDTO;
import org.example.backend.model.User;
import org.example.backend.repository.UserRepository;
import org.example.backend.service.FileStorageService;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserRepository userRepo;
    private final FileStorageService fileStorage;

    public UserController(UserRepository userRepo, FileStorageService fileStorage) {
        this.userRepo = userRepo;
        this.fileStorage = fileStorage;
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        User u = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony: " + id));
        return ResponseEntity.ok(toDto(u));
    }

    @GetMapping("/by-email")
    public ResponseEntity<UserDTO> getUserByEmail(@RequestParam String email) {
        User u = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony: " + email));
        return ResponseEntity.ok(toDto(u));
    }

    @PutMapping(
            value = "/{id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<UserDTO> updateProfile(
            @PathVariable Long id,
            @RequestParam(required = false) String firstName,
            @RequestParam(required = false) String lastName,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) BigDecimal balance,
            @RequestParam(required = false) Integer rating,
            @RequestPart(value = "file", required = false) MultipartFile file,
            Authentication auth
    ) {
        User current = userRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        User target = userRepo.findById(id)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Użytkownik nie znaleziony: " + id));

        boolean isOwner = current.getId().equals(id);
        boolean isAdmin = current.getRole().getName().equals("ROLE_ADMIN");
        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("Brak dostępu do edycji profilu");
        }

        if (isAdmin) {
            if (firstName != null) target.setFirstName(firstName);
            if (lastName != null) target.setLastName(lastName);
            if (balance != null) target.setBalance(balance);
            if (rating != null) target.setRating(rating);
        }

        if (description != null) target.setDescription(description);
        if (file != null && !file.isEmpty()) {
            String filename = fileStorage.storeFile(file);
            target.setProfilePictureUrl("/uploads/" + filename);
        }

        userRepo.save(target);
        return ResponseEntity.ok(toDto(target));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(Authentication auth) {
        User u = userRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Nie uwierzytelniony"));
        return ResponseEntity.ok(toDto(u));
    }

    private UserDTO toDto(User u) {
        return new UserDTO(
                u.getId(),
                u.getFirstName(),
                u.getLastName(),
                u.getProfilePictureUrl(),
                u.getDescription(),
                u.getBalance(),
                u.getRating()
        );
    }
}
