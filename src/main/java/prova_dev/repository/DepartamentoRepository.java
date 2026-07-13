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

    // Validação blindada para Cadastro
    @Query("SELECT COUNT(d) > 0 FROM Departamento d WHERE UPPER(TRIM(d.codigoDepartamento)) = UPPER(TRIM(:codigo))")
    boolean existeCodigoIgual(@Param("codigo") String codigo);

    // Validação blindada para Edição
    @Query("SELECT COUNT(d) > 0 FROM Departamento d WHERE UPPER(TRIM(d.codigoDepartamento)) = UPPER(TRIM(:codigo)) AND d.id <> :id")
    boolean existeCodigoIgualEmOutroDepartamento(@Param("codigo") String codigo, @Param("id") Long id);

    // Filtro inteligente para a tela de listagem (paginado)
    @Query("SELECT d FROM Departamento d WHERE " +
           "(:descricao = '' OR LOWER(d.descricao) LIKE LOWER(CONCAT('%', :descricao, '%'))) AND " +
           "(:codigo = '' OR LOWER(d.codigoDepartamento) LIKE LOWER(CONCAT('%', :codigo, '%')))")
    Page<Departamento> filtrar(
            @Param("descricao") String descricao,
            @Param("codigo") String codigo,
            Pageable pageable
    );
}
