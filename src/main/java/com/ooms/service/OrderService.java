package com.ooms.service;

import com.ooms.entity.Order;
import com.ooms.entity.OrderStatus;
import com.ooms.entity.User;
import com.ooms.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    public List<Order> getOrdersByUser(User user) {
        return orderRepository.findByUser(user);
    }

    public Order placeOrder(Order order) {
        // TODO: Implement full order placement logic with cart, stock update, etc.
        return orderRepository.save(order);
    }

    public Order updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(OrderStatus.valueOf(status.toUpperCase()));
        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Map<String, Object> getRevenueReport() {
        Map<String, Object> report = new HashMap<>();
        // TODO: Implement actual revenue calculation
        report.put("total", 0.0);
        return report;
    }

    public Map<String, Object> getSalesReport() {
        Map<String, Object> report = new HashMap<>();
        // TODO: Implement actual sales report
        report.put("totalOrders", orderRepository.count());
        return report;
    }

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", orderRepository.count());
        stats.put("totalRevenue", 0.0); // TODO: Calculate actual revenue
        return stats;
    }
}
