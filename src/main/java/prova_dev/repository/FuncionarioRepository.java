package prova_dev.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import prova_dev.model.Funcionario;

@Repository
public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {

    boolean existsByCpf(String cpf);

    // Verifica se a matrícula existe na MESMA empresa (Criação)
    @Query("SELECT COUNT(v) > 0 FROM Funcionario f JOIN f.vinculos v WHERE UPPER(TRIM(v.matricula)) = UPPER(TRIM(:matricula)) AND UPPER(TRIM(v.empresa)) = UPPER(TRIM(:empresa))")
    boolean existeMatriculaNaEmpresa(@Param("matricula") String matricula, @Param("empresa") String empresa);

    // Verifica se a matrícula existe na MESMA empresa, ignorando o próprio funcionário (Edição)
    @Query("SELECT COUNT(v) > 0 FROM Funcionario f JOIN f.vinculos v WHERE UPPER(TRIM(v.matricula)) = UPPER(TRIM(:matricula)) AND UPPER(TRIM(v.empresa)) = UPPER(TRIM(:empresa)) AND f.id <> :funcionarioId")
    boolean existeMatriculaNaEmpresaEmOutroFuncionario(@Param("matricula") String matricula, @Param("empresa") String empresa, @Param("funcionarioId") Long funcionarioId);

    @Query("SELECT DISTINCT f FROM Funcionario f " +
           "LEFT JOIN f.vinculos v " +
           "WHERE (:nome = '' OR LOWER(f.nome) LIKE LOWER(CONCAT('%', :nome, '%'))) " +
           "AND (:cpf = '' OR f.cpf = :cpf) " +
           "AND (:matricula = '' OR v.matricula = :matricula) " +
           "AND (:empresa = '' OR LOWER(v.empresa) LIKE LOWER(CONCAT('%', :empresa, '%'))) " +
           "AND (:cargoId = 0L OR v.cargo.id = :cargoId) " +
           "AND (:departamentoId = 0L OR v.departamento.id = :departamentoId)")
    Page<Funcionario> filtrar(
        @Param("nome") String nome,
        @Param("cpf") String cpf,
        @Param("matricula") String matricula,
        @Param("empresa") String empresa,
        @Param("cargoId") Long cargoId,
        @Param("departamentoId") Long departamentoId,
        Pageable pageable
    );
}