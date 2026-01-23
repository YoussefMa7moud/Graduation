package com.grad.backend.Auth.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.grad.backend.Auth.entity.ProjectManager;
public interface ProjectManagerRepository extends JpaRepository<ProjectManager, Long>{
    
}
