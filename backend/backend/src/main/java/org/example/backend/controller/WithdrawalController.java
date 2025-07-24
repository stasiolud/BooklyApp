package org.example.backend.controller;

import org.example.backend.dto.WithdrawalDTO;
import org.example.backend.dto.WithdrawalRequestDTO;
import org.example.backend.service.WithdrawalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/withdrawals")
public class WithdrawalController {

    @Autowired
    private WithdrawalService withdrawalService;

    @PostMapping
    public ResponseEntity<WithdrawalDTO> create(
            @RequestBody WithdrawalRequestDTO request,
            Authentication auth
    ) {
        String email = auth.getName();
        WithdrawalDTO dto = withdrawalService.createWithdrawal(email, request);
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public ResponseEntity<Page<WithdrawalDTO>> history(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        String email = auth.getName();
        Page<WithdrawalDTO> history = withdrawalService.listWithdrawals(email, page, size);
        return ResponseEntity.ok(history);
    }
}
