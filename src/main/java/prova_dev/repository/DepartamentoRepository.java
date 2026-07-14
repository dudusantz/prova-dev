package prova_dev.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import prova_dev.model.Departamento;

@Repository
public interface DepartamentoRepository extends JpaRepository<Departamento, Long> {

    @Query("SELECT COUNT(d) > 0 FROM Departamento d WHERE UPPER(TRIM(d.codigoDepartamento)) = UPPER(TRIM(:codigo))")
    boolean existeCodigoIgual(@Param("codigo") String codigo);

    @Query("SELECT COUNT(d) > 0 FROM Departamento d WHERE UPPER(TRIM(d.codigoDepartamento)) = UPPER(TRIM(:codigo)) AND d.id <> :id")
    boolean existeCodigoIgualEmOutroDepartamento(@Param("codigo") String codigo, @Param("id") Long id);

    @Query("SELECT d FROM Departamento d WHERE " +
           "(:descricao = '' OR LOWER(d.descricao) LIKE LOWER(CONCAT('%', :descricao, '%'))) AND " +
           "(:codigo = '' OR LOWER(d.codigoDepartamento) LIKE LOWER(CONCAT('%', :codigo, '%'))) AND " +
           "(:ativo IS NULL OR d.ativo = :ativo)")
    Page<Departamento> filtrar(
            @Param("descricao") String descricao,
            @Param("codigo") String codigo,
            @Param("ativo") Boolean ativo,
            Pageable pageable
    );
}
