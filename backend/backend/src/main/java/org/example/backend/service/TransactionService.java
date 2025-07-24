package org.example.backend.service;

import java.time.LocalDateTime;

import org.example.backend.dto.BookInfoDTO;
import org.example.backend.dto.ShipmentDTO;
import org.example.backend.dto.TransactionDTO;
import org.example.backend.model.*;
import org.example.backend.repository.BookRepository;
import org.example.backend.repository.TransactionRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TransactionService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    public Transaction createTransaction(Long bookId, Shipment shipment, Payment payment, String buyerEmail) {
        User buyer = userRepository.findByEmail(buyerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Użytkownik niezalogowany"));

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Książka nie znaleziona"));

        if (!book.isAvailable()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Książka jest już sprzedana");
        }
        User seller = book.getUser();
        if (seller.getId().equals(buyer.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nie możesz kupić własnej książki");
        }

        Transaction tx = new Transaction();
        tx.setBook(book);
        tx.setSeller(seller);
        tx.setBuyer(buyer);
        tx.setShipment(shipment);
        tx.setPayment(payment);
        tx.setTimestamp(LocalDateTime.now());
        tx.setPrice(book.getPrice());

        book.setAvailable(false);
        bookRepository.save(book);

        Transaction savedTx = transactionRepository.save(tx);

        seller.setRating(seller.getRating() + 1);
        buyer.setRating(buyer.getRating() + 1);
        userRepository.save(seller);
        userRepository.save(buyer);

        seller.setBalance(seller.getBalance().add(savedTx.getPrice()));
        userRepository.save(seller);

        return savedTx;
    }

    public TransactionDTO getTransaction(Long txId, String buyerEmail) {
        User buyer = userRepository.findByEmail(buyerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        Transaction tx = transactionRepository.findById(txId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transakcja nie znaleziona"));

        if (!tx.getBuyer().getId().equals(buyer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Brak dostępu do tej transakcji");
        }

        BookInfoDTO bookDto = new BookInfoDTO(
                tx.getBook().getTitle(),
                tx.getBook().getBookCondition(),
                tx.getBook().getPrice(),
                tx.getBook().getPictureUrl()
        );
        ShipmentDTO shipDto = new ShipmentDTO(
                tx.getShipment().getFirstName(),
                tx.getShipment().getLastName(),
                tx.getShipment().getCity(),
                tx.getShipment().getPostalCode(),
                tx.getShipment().getStreet(),
                tx.getShipment().getStreetNumber(),
                tx.getShipment().getApartmentNumber()
        );
        return new TransactionDTO(tx.getId(), bookDto, shipDto, null);

    }

    public Page<TransactionDTO> listBought(String buyerEmail, int page, int size) {
        User buyer = userRepository.findByEmail(buyerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        Pageable pg = PageRequest.of(page, size, Sort.by("timestamp").descending());
        return transactionRepository.findByBuyerOrderByTimestampDesc(buyer, pg)
                .map(this::toDto);
    }

    public Page<TransactionDTO> listSold(String sellerEmail, int page, int size) {
        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        Pageable pg = PageRequest.of(page, size, Sort.by("timestamp").descending());
        return transactionRepository.findBySellerOrderByTimestampDesc(seller, pg)
                .map(this::toDto);
    }

    private TransactionDTO toDto(Transaction tx) {
        BookInfoDTO book = new BookInfoDTO(
                tx.getBook().getTitle(),
                tx.getBook().getBookCondition(),
                tx.getPrice(),
                tx.getBook().getPictureUrl()
        );
        ShipmentDTO ship = new ShipmentDTO(
                tx.getShipment().getFirstName(),
                tx.getShipment().getLastName(),
                tx.getShipment().getCity(),
                tx.getShipment().getPostalCode(),
                tx.getShipment().getStreet(),
                tx.getShipment().getStreetNumber(),
                tx.getShipment().getApartmentNumber()
        );
        return new TransactionDTO(tx.getId(), book, ship, tx.getTimestamp());
    }
}
