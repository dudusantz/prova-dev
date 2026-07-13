package prova_dev.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import prova_dev.model.Cargo;

@Repository
public interface CargoRepository extends JpaRepository<Cargo, Long> {

    // 1. Validação blindada para Cadastro (ignora espaços extras e letras minúsculas)
    @Query("SELECT COUNT(c) > 0 FROM Cargo c WHERE UPPER(TRIM(c.codigoCargo)) = UPPER(TRIM(:codigo))")
    boolean existeCodigoIgual(@Param("codigo") String codigo);

    // 2. Validação blindada para Edição (ignora o próprio cargo que está sendo editado)
    @Query("SELECT COUNT(c) > 0 FROM Cargo c WHERE UPPER(TRIM(c.codigoCargo)) = UPPER(TRIM(:codigo)) AND c.id <> :id")
    boolean existeCodigoIgualEmOutroCargo(@Param("codigo") String codigo, @Param("id") Long id);

    // 3. Filtro da listagem (paginado)
    @Query("SELECT c FROM Cargo c WHERE " +
           "(:descricao = '' OR LOWER(c.descricao) LIKE LOWER(CONCAT('%', :descricao, '%'))) AND " +
           "(:codigo = '' OR LOWER(c.codigoCargo) LIKE LOWER(CONCAT('%', :codigo, '%')))")
    Page<Cargo> filtrar(
            @Param("descricao") String descricao,
            @Param("codigo") String codigo,
            Pageable pageable
    );
}
