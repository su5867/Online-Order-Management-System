package com.ooms.service;

import com.ooms.entity.CartItem;
import com.ooms.entity.Product;
import com.ooms.entity.User;
import com.ooms.repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    public List<CartItem> getCartItems(User user) {
        return cartRepository.findByUser(user);
    }

    public CartItem addToCart(CartItem cartItem) {
        Optional<CartItem> existing = cartRepository.findByUserAndProduct(cartItem.getUser(), cartItem.getProduct());
        if (existing.isPresent()) {
            existing.get().setQuantity(existing.get().getQuantity() + cartItem.getQuantity());
            return cartRepository.save(existing.get());
        } else {
            return cartRepository.save(cartItem);
        }
    }

    public void removeFromCart(Long id) {
        cartRepository.deleteById(id);
    }
}
