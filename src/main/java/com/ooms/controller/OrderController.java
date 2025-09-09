package com.ooms.controller;

import com.ooms.entity.Order;
import com.ooms.entity.User;
import com.ooms.service.OrderService;
import com.ooms.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<Order>> getUserOrders(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername()).orElseThrow();
        List<Order> orders = orderService.getOrdersByUser(user);
        return ResponseEntity.ok(orders);
    }

    @PostMapping
    public ResponseEntity<Order> placeOrder(@AuthenticationPrincipal UserDetails userDetails, @Valid @RequestBody Order order) {
        User user = userService.findByEmail(userDetails.getUsername()).orElseThrow();
        order.setUser(user);
        Order placedOrder = orderService.placeOrder(order);
        return ResponseEntity.ok(placedOrder);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        Order updatedOrder = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(updatedOrder);
    }
}
