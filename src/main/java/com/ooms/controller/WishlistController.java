package com.ooms.controller;

import com.ooms.entity.User;
import com.ooms.entity.WishlistItem;
import com.ooms.service.UserService;
import com.ooms.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<WishlistItem>> getWishlist(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(wishlistService.getWishlist(user));
    }

    @PostMapping
    public ResponseEntity<WishlistItem> addToWishlist(@AuthenticationPrincipal UserDetails userDetails, @RequestBody WishlistItem item) {
        User user = userService.findByEmail(userDetails.getUsername()).orElseThrow();
        item.setUser(user);
        return ResponseEntity.ok(wishlistService.addToWishlist(item));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable Long id) {
        wishlistService.removeFromWishlist(id);
        return ResponseEntity.noContent().build();
    }
}
