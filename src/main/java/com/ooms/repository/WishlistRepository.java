package com.ooms.repository;

import com.ooms.entity.Product;
import com.ooms.entity.User;
import com.ooms.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<WishlistItem, Long> {

    List<WishlistItem> findByUser(User user);

    Optional<WishlistItem> findByUserAndProduct(User user, Product product);

    void deleteByUser(User user);
}
