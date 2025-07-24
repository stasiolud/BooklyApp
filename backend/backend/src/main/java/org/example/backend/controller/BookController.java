package org.example.backend.controller;

import org.example.backend.dto.BookDTO;
import org.example.backend.model.Book;
import org.example.backend.repository.BookRepository;
import org.example.backend.service.BookService;
import org.springframework.context.MessageSource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;
    private final BookRepository bookRepo;
    private final MessageSource messageSource;

    public BookController(BookService bookService,
                          BookRepository bookRepo,
                          MessageSource messageSource) {
        this.bookService = bookService;
        this.bookRepo = bookRepo;
        this.messageSource = messageSource;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> addBook(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam("bookCondition") String condition,
            @RequestParam String authorName,
            @RequestParam String price,
            @RequestPart("file") MultipartFile file,
            Authentication auth,
            Locale locale
    ) {
        String userEmail = auth.getName();
        Book created = bookService.createBook(
                title, description, condition, authorName, price, file, userEmail
        );
        String msg = messageSource.getMessage("book.create.success", null, locale);
        return ResponseEntity.ok(Map.of(
                "message", msg,
                "book", mapToDto(created)
        ));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> updateBook(
            @PathVariable Long id,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam("bookCondition") String condition,
            @RequestParam String authorName,
            @RequestParam String price,
            @RequestPart(value = "file", required = false) MultipartFile file,
            Authentication auth,
            Locale locale
    ) {
        String userEmail = auth.getName();
        Book updated = bookService.updateBook(
                id, title, description, condition, authorName, price, file, userEmail
        );
        String msg = messageSource.getMessage("book.update.success", null, locale);
        return ResponseEntity.ok(Map.of(
                "message", msg,
                "book", mapToDto(updated)
        ));
    }

    @GetMapping
    public ResponseEntity<Page<BookDTO>> getBooks(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Book> books;

        if (userId != null) {
            books = bookRepo.findByUserIdAndAvailableTrueOrderByIdDesc(userId, pageable);
        } else if (search != null && !search.isEmpty()) {
            books = bookRepo.findByTitleContainingIgnoreCaseAndAvailableTrue(search, pageable);
        } else {
            books = bookRepo.findAllByAvailableTrueOrderByIdDesc(pageable);
        }

        Page<BookDTO> bookDTOs = books.map(this::mapToDto);
        return ResponseEntity.ok(bookDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookDTO> getBookById(
            @PathVariable Long id,
            Locale locale
    ) {
        Book book = bookRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        messageSource.getMessage("book.not.found", null, locale)
                ));
        return ResponseEntity.ok(mapToDto(book));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteBook(
            @PathVariable Long id,
            Authentication auth,
            Locale locale
    ) {
        bookService.deleteBook(id, auth.getName());
        String msg = messageSource.getMessage("book.delete.success", null, locale);
        return ResponseEntity.ok(Map.of("message", msg));
    }

    private BookDTO mapToDto(Book b) {
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
