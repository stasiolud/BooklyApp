package org.example.backend.controller;

import org.example.backend.dto.BookDTO;
import org.example.backend.model.Book;
import org.example.backend.repository.BookRepository;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/books")
public class AdminBookController {

    private final BookRepository bookRepo;

    public AdminBookController(BookRepository bookRepo) {
        this.bookRepo = bookRepo;
    }

    @GetMapping
    public ResponseEntity<Page<BookDTO>> listAllBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Book> booksPage;

        if (search != null && !search.isBlank()) {
            booksPage = bookRepo.findByTitleContainingIgnoreCaseAndAvailableTrue(search.trim(), pageable);
        } else {
            booksPage = bookRepo.findAllByAvailableTrueOrderByIdDesc(pageable);
        }

        Page<BookDTO> dtoPage = booksPage.map(this::toDto);
        return ResponseEntity.ok(dtoPage);
    }

    private BookDTO toDto(Book b) {
        return new BookDTO(
                b.getId(),
                b.getTitle(),
                b.getDescription(),
                b.getBookCondition(),
                b.getAuthorName(),
                b.getPrice(),
                b.getPictureUrl(),
                b.getUser().getFirstName(),
                b.getUser().getId(),
                b.getUser().getProfilePictureUrl(),
                b.isAvailable()
        );
    }
}
