package com.ooms.controller;

import com.ooms.repository.OrderRepository;
import com.ooms.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    // Removed conflicting sales report method - now handled by AdminController

    @GetMapping("/best-selling-products")
    public ResponseEntity<List<Object[]>> getBestSellingProducts(
            @RequestParam(defaultValue = "10") int limit) {

        List<Object[]> bestSellers = orderRepository.getBestSellingProducts(limit);
        return ResponseEntity.ok(bestSellers);
    }

    @GetMapping("/order-status-summary")
    public ResponseEntity<Map<String, Long>> getOrderStatusSummary() {
        Map<String, Long> summary = new HashMap<>();
        summary.put("PLACED", orderRepository.countByStatus("PLACED"));
        summary.put("PROCESSED", orderRepository.countByStatus("PROCESSED"));
        summary.put("SHIPPED", orderRepository.countByStatus("SHIPPED"));
        summary.put("DELIVERED", orderRepository.countByStatus("DELIVERED"));
        summary.put("CANCELLED", orderRepository.countByStatus("CANCELLED"));

        return ResponseEntity.ok(summary);
    }
}
