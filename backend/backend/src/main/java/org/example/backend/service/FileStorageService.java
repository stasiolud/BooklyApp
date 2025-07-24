package org.example.backend.service;

import org.example.backend.config.FileStorageProperties;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {
    private final Path storageLocation;

    public FileStorageService(FileStorageProperties props) {
        this.storageLocation = Paths.get(props.getUploadDir()).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.storageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Nie można utworzyć katalogu na pliki", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        String orig = StringUtils.cleanPath(file.getOriginalFilename());
        String ext = "";
        int i = orig.lastIndexOf('.');
        if (i > 0) ext = orig.substring(i);
        String filename = UUID.randomUUID() + ext;
        try {
            if (orig.contains("..")) throw new RuntimeException("Zła nazwa pliku: " + orig);
            Path target = storageLocation.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return filename;
        } catch (Exception ex) {
            throw new RuntimeException("Nie udało się zapisać pliku " + filename, ex);
        }
    }
}
