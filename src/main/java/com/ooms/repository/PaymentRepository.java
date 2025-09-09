package com.ooms.repository;

import com.ooms.entity.Order;
import com.ooms.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByOrder(Order order);

    Optional<Payment> findByTransactionId(String transactionId);
}
