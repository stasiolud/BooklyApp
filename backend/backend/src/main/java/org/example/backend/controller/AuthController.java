package org.example.backend.controller;

import org.example.backend.dto.AuthenticationRequest;
import org.example.backend.dto.AuthenticationResponse;
import org.example.backend.dto.RegistrationRequest;
import org.example.backend.model.Role;
import org.example.backend.model.User;
import org.example.backend.repository.RoleRepository;
import org.example.backend.repository.UserRepository;
import org.example.backend.security.JwtUtils;
import org.springframework.cglib.core.Local;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthenticationManager authManager;
    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    private final MessageSource messageSource;

    public AuthController(AuthenticationManager authManager,
                          UserRepository userRepo,
                          RoleRepository roleRepo,
                          PasswordEncoder encoder,
                          JwtUtils jwtUtils, MessageSource messageSource) {
        this.authManager = authManager;
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.encoder = encoder;
        this.jwtUtils = jwtUtils;
        this.messageSource = messageSource;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegistrationRequest req, Locale locale) {
        if (userRepo.existsByEmail(req.getEmail())) {
            String msg = messageSource.getMessage("auth.email.exists", null, locale);
            return ResponseEntity.badRequest().body(Map.of("message", msg));
        }
        User u = new User();
        u.setEmail(req.getEmail());
        u.setPassword(encoder.encode(req.getPassword()));
        u.setFirstName(req.getFirstName());
        u.setLastName(req.getLastName());

        Role userRole = roleRepo.findById("ROLE_USER")
                .orElseThrow();
        u.setRole(userRole);

        userRepo.save(u);
        String success = messageSource.getMessage("auth.registration.success", null, locale);
        return ResponseEntity.ok(Map.of("message", success));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthenticationRequest req, Locale locale) {
        try {
            Authentication auth = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
            );
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            String token = jwtUtils.generateToken(userDetails);
            return ResponseEntity.ok(new AuthenticationResponse(token));
        } catch (AuthenticationException ex) {
            String msg = messageSource.getMessage("auth.invalid.credentials", null, locale);
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", msg));
        }
    }

}
