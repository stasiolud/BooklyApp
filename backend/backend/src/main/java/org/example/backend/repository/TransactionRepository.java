package org.example.backend.repository;

import org.example.backend.model.Transaction;
import org.example.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByBuyerId(Long buyerId);

    List<Transaction> findBySellerId(Long sellerId);

    Page<Transaction> findByBuyerOrderByTimestampDesc(User buyer, Pageable pageable);

    Page<Transaction> findBySellerOrderByTimestampDesc(User seller, Pageable pageable);
}