package com.paytool.repository;

import com.paytool.model.Group;
import com.paytool.model.PaymentCard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentCardRepository extends JpaRepository<PaymentCard, Long> {
    List<PaymentCard> findByGroup(Group group);
    Optional<PaymentCard> findByCardNumber(String cardNumber);
} 