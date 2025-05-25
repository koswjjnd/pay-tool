package com.paytool.repository;

import com.paytool.model.Transaction;
import com.paytool.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findBySender(User sender);
    List<Transaction> findByReceiver(User receiver);
    List<Transaction> findBySenderOrReceiver(User user1, User user2);
} 