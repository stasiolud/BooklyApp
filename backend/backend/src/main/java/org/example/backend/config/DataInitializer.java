package org.example.backend.config;

import org.example.backend.model.Role;
import org.example.backend.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    private final RoleRepository roleRepo;

    public DataInitializer(RoleRepository roleRepo) {
        this.roleRepo = roleRepo;
    }

    @Override
    public void run(String... args) {
        if (!roleRepo.existsById("ROLE_USER")) {
            roleRepo.save(new Role("ROLE_USER"));
        }
        if (!roleRepo.existsById("ROLE_ADMIN")) {
            roleRepo.save(new Role("ROLE_ADMIN"));
        }
    }
}
