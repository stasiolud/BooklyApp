package org.example.backend.controller;

import org.example.backend.dto.UserDTO;
import org.example.backend.model.User;
import org.example.backend.repository.UserRepository;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserRepository userRepo;

    public AdminUserController(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    @GetMapping
    public ResponseEntity<Page<UserDTO>> listAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        Page<User> usersPage;

        if (search != null && !search.isBlank()) {
            String term = search.trim();
            usersPage = userRepo.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                    term, term, term, pageable);
        } else {
            usersPage = userRepo.findAll(pageable);
        }

        Page<UserDTO> dtoPage = usersPage.map(this::toDto);
        return ResponseEntity.ok(dtoPage);
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
