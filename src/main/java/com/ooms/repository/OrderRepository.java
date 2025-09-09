package com.ooms.repository;

import com.ooms.entity.Order;
import com.ooms.entity.OrderStatus;
import com.ooms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUser(User user);

    List<Order> findByStatus(OrderStatus status);

    List<Order> findByUserId(Long userId);

    List<Order> findByUserIdAndStatus(Long userId, OrderStatus status);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE DATE(o.createdAt) BETWEEN :startDate AND :endDate")
    BigDecimal getTotalRevenueBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(o) FROM Order o WHERE DATE(o.createdAt) BETWEEN :startDate AND :endDate")
    Long countOrdersBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT p.name, SUM(oi.quantity) as totalSold FROM OrderItem oi JOIN oi.product p GROUP BY p.id ORDER BY totalSold DESC")
    List<Object[]> getBestSellingProducts(@Param("limit") int limit);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    Long countByStatus(@Param("status") String status);
}
