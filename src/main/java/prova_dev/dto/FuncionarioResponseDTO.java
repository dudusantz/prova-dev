package prova_dev.dto;

import prova_dev.model.Funcionario;
import java.util.List;

public record FuncionarioResponseDTO(
    Long id,
    String nome,
    String cpf,
    List<VinculoResponseDTO> vinculos
) {
    public FuncionarioResponseDTO(Funcionario funcionario) {
        this(
            funcionario.getId(),
            funcionario.getNome(),
            funcionario.getCpf(),
            funcionario.getVinculos().stream().map(VinculoResponseDTO::new).toList()
        );
    }
}