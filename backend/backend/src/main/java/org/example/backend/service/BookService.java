package org.example.backend.service;

import org.example.backend.model.Book;
import org.example.backend.model.User;
import org.example.backend.repository.BookRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@Service
public class BookService {
    private final BookRepository bookRepo;
    private final UserRepository userRepo;
    private final FileStorageService fileStorage;

    public BookService(BookRepository bookRepo,
                       UserRepository userRepo,
                       FileStorageService fileStorage) {
        this.bookRepo = bookRepo;
        this.userRepo = userRepo;
        this.fileStorage = fileStorage;
    }

    @Transactional
    public Book createBook(String title,
                           String description,
                           String condition,
                           String author,
                           String priceStr,
                           MultipartFile file,
                           String userEmail) {
        User user = userRepo.findByEmail(userEmail).orElseThrow();
        BigDecimal price = new BigDecimal(priceStr.replace(',', '.'));
        String filename = fileStorage.storeFile(file);

        Book b = new Book();
        b.setTitle(title);
        b.setDescription(description);
        b.setBookCondition(condition);
        b.setAuthorName(author);
        b.setPrice(price);
        b.setPictureUrl("/uploads/" + filename);
        b.setUser(user);
        b.setAvailable(true);
        return bookRepo.save(b);
    }

    public Book updateBook(Long id, String title, String description, String condition, String authorName,
                           String price, MultipartFile file, String userEmail) {
        Book book = bookRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Książka nie znaleziona"));


        User currentUser = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Użytkownik nieznaleziony"));

        boolean isOwner = book.getUser().getEmail().equals(userEmail);
        boolean isAdmin = currentUser.getRole().getName().equals("ROLE_ADMIN");

        if (!isOwner && !isAdmin) {

            throw new AccessDeniedException("Brak dostępu do edycji tej książki");
        }

        book.setTitle(title);
        book.setDescription(description);
        book.setBookCondition(condition);
        book.setAuthorName(authorName);
        book.setPrice(new BigDecimal(price));

        if (file != null && !file.isEmpty()) {
            String pictureUrl = fileStorage.storeFile(file);
            book.setPictureUrl("/uploads/" + pictureUrl);

        }

        return bookRepo.save(book);
    }

    @Transactional
    public void deleteBook(Long id, String userEmail) {
        Book book = bookRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Książka nie znaleziona"));

        User currentUser = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Użytkownik nieznaleziony"));

        boolean isOwner = book.getUser().getEmail().equals(userEmail);
        boolean isAdmin = currentUser.getRole().getName().equals("ROLE_ADMIN");

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("Brak dostępu do usunięcia tej książki");
        }

        bookRepo.delete(book);
    }

    public Book findById(Long id) {
        Book book = bookRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Książka nie znaleziona"));
        return book;
    }
}
