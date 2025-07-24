package org.example.backend.repository;

import org.example.backend.model.Withdrawal;
import org.example.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WithdrawalRepository extends JpaRepository<Withdrawal, Long> {
    List<Withdrawal> findAllByUserOrderByTimestampDesc(User user);

    Page<Withdrawal> findAllByUserOrderByTimestampDesc(User user, Pageable pageable);
}
