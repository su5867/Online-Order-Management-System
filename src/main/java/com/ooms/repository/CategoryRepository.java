package com.ooms.repository;

import com.ooms.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByParent(Category parent);

    List<Category> findByParentIsNull();
}
