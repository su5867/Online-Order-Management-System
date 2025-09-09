package com.ooms.controller;

import com.ooms.entity.CartItem;
import com.ooms.entity.User;
import com.ooms.service.CartService;
import com.ooms.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<CartItem>> getCart(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(cartService.getCartItems(user));
    }

    @PostMapping
    public ResponseEntity<CartItem> addToCart(@AuthenticationPrincipal UserDetails userDetails, @RequestBody CartItem cartItem) {
        User user = userService.findByEmail(userDetails.getUsername()).orElseThrow();
        cartItem.setUser(user);
        return ResponseEntity.ok(cartService.addToCart(cartItem));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long id) {
        cartService.removeFromCart(id);
        return ResponseEntity.noContent().build();
    }
}
