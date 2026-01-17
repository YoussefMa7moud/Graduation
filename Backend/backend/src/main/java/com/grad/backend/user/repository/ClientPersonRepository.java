package com.grad.backend.user.repository;

import com.grad.backend.user.entity.ClientPerson;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientPersonRepository extends JpaRepository<ClientPerson, Long> {
}
