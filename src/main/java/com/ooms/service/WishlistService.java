package com.ooms.service;

import com.ooms.entity.User;
import com.ooms.entity.WishlistItem;
import com.ooms.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    public List<WishlistItem> getWishlist(User user) {
        return wishlistRepository.findByUser(user);
    }

    public WishlistItem addToWishlist(WishlistItem item) {
        return wishlistRepository.save(item);
    }

    public void removeFromWishlist(Long id) {
        wishlistRepository.deleteById(id);
    }
}
