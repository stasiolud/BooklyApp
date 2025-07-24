package org.example.backend.repository;

import org.example.backend.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByTitleContainingIgnoreCase(String title);

    List<Book> findByUserIdAndAvailableTrueOrderByIdDesc(Long userId);

    List<Book> findAllByAvailableTrueOrderByIdDesc();

    Page<Book> findByUserIdAndAvailableTrueOrderByIdDesc(Long userId, Pageable pageable);

    Page<Book> findAllByAvailableTrueOrderByIdDesc(Pageable pageable);

    Page<Book> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    Page<Book> findByTitleContainingIgnoreCaseAndAvailableTrue(String title, Pageable pageable);


}
