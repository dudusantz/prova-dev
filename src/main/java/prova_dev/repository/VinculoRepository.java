package prova_dev.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import prova_dev.model.Vinculo;

public interface VinculoRepository extends JpaRepository<Vinculo, Long> {
}