package org.example.backend.controller;

import org.example.backend.dto.TransactionDTO;
import org.example.backend.dto.TransactionRequestDTO;
import org.example.backend.model.Transaction;
import org.example.backend.model.User;
import org.example.backend.repository.UserRepository;
import org.example.backend.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<Transaction> placeOrder(
            @RequestBody TransactionRequestDTO request,
            Authentication auth
    ) {
        String buyerEmail = auth.getName();
        Transaction tx = transactionService.createTransaction(
                request.getBookId(),
                request.getShipment(),
                request.getPayment(),
                buyerEmail
        );
        return ResponseEntity.ok(tx);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionDTO> getTransaction(
            @PathVariable Long id,
            Authentication auth
    ) {
        String userEmail = auth.getName();
        TransactionDTO dto = transactionService.getTransaction(id, userEmail);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/bought")
    public ResponseEntity<Page<TransactionDTO>> bought(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long userId
    ) {
        String requesterEmail = auth.getName();
        String targetEmail = requesterEmail;

        if (userId != null) {
            User current = userRepository.findByEmail(requesterEmail)
                    .orElseThrow(() -> new RuntimeException("Użytkownik nieznaleziony"));
            boolean isAdmin = current.getRole().getName().equals("ROLE_ADMIN");
            if (!isAdmin) {
                throw new AccessDeniedException("Brak dostępu do cudzej historii");
            }
            User target = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Użytkownik nieznaleziony: " + userId));
            targetEmail = target.getEmail();
        }

        Page<TransactionDTO> pageDto = transactionService
                .listBought(targetEmail, page, size);
        return ResponseEntity.ok(pageDto);
    }

    @GetMapping("/sold")
    public ResponseEntity<Page<TransactionDTO>> sold(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long userId
    ) {
        String requesterEmail = auth.getName();
        String targetEmail = requesterEmail;

        if (userId != null) {
            User current = userRepository.findByEmail(requesterEmail)
                    .orElseThrow(() -> new RuntimeException("Użytkownik nieznaleziony"));
            boolean isAdmin = current.getRole().getName().equals("ROLE_ADMIN");
            if (!isAdmin) {
                throw new AccessDeniedException("Brak dostępu do cudzej historii");
            }
            User target = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Użytkownik nieznaleziony: " + userId));
            targetEmail = target.getEmail();
        }

        Page<TransactionDTO> pageDto = transactionService
                .listSold(targetEmail, page, size);
        return ResponseEntity.ok(pageDto);
    }
}
