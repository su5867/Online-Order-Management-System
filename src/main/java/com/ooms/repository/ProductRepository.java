package com.ooms.repository;

import com.ooms.entity.Category;
import com.ooms.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategory(Category category);

    List<Product> findByNameContainingIgnoreCase(String name);

    Page<Product> findAll(Pageable pageable);

    List<Product> findByCategoryId(Long categoryId);

    @Query("SELECT p FROM Product p WHERE (:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND (:categoryId IS NULL OR p.category.id = :categoryId) AND (:minPrice IS NULL OR p.price >= :minPrice) AND (:maxPrice IS NULL OR p.price <= :maxPrice)")
    Page<Product> findProductsWithFilters(@Param("name") String name, @Param("categoryId") Long categoryId, @Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice, Pageable pageable);
}
