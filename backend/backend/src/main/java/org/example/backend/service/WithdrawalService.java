package org.example.backend.service;

import org.example.backend.dto.WithdrawalDTO;
import org.example.backend.dto.WithdrawalRequestDTO;
import org.example.backend.model.User;
import org.example.backend.model.Withdrawal;
import org.example.backend.repository.UserRepository;
import org.example.backend.repository.WithdrawalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WithdrawalService {
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private WithdrawalRepository withdrawalRepo;

    public WithdrawalDTO createWithdrawal(String userEmail, WithdrawalRequestDTO req) {
        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Użytkownik niezalogowany")
                );

        if (req.getAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kwota musi być > 0");
        }
        if (user.getBalance().compareTo(req.getAmount()) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Niewystarczające środki");
        }

        user.setBalance(user.getBalance().subtract(req.getAmount()));
        userRepo.save(user);

        Withdrawal w = new Withdrawal();
        w.setUser(user);
        w.setAccountNumber(req.getAccountNumber());
        w.setAmount(req.getAmount());
        w.setTimestamp(LocalDateTime.now());
        Withdrawal saved = withdrawalRepo.save(w);

        return new WithdrawalDTO(
                saved.getId(),
                saved.getAccountNumber(),
                saved.getAmount(),
                saved.getTimestamp()
        );
    }

    public Page<WithdrawalDTO> listWithdrawals(String userEmail, int page, int size) {
        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Użytkownik niezalogowany")
                );

        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<Withdrawal> pageW = withdrawalRepo.findAllByUserOrderByTimestampDesc(user, pageable);

        return pageW.map(w ->
                new WithdrawalDTO(w.getId(), w.getAccountNumber(), w.getAmount(), w.getTimestamp())
        );
    }
}
