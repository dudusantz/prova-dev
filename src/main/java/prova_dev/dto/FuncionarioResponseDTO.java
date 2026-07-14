package prova_dev.dto;

import prova_dev.model.Funcionario;
import java.util.List;

public record FuncionarioResponseDTO(
    Long id,
    String nome,
    String cpf,
    Boolean ativo,
    List<VinculoResponseDTO> vinculos
) {
    public FuncionarioResponseDTO(Funcionario funcionario) {
        this(
            funcionario.getId(),
            funcionario.getNome(),
            funcionario.getCpf(),
            funcionario.getAtivo(),
            funcionario.getVinculos().stream()
                .sorted((a, b) -> {
                    String ea = a.getEmpresa() == null ? "" : a.getEmpresa();
                    String eb = b.getEmpresa() == null ? "" : b.getEmpresa();
                    int cmp = ea.compareToIgnoreCase(eb);
                    if (cmp != 0) return cmp;
                    String ma = a.getMatricula() == null ? "" : a.getMatricula();
                    String mb = b.getMatricula() == null ? "" : b.getMatricula();
                    return ma.compareToIgnoreCase(mb);
                })
                .map(VinculoResponseDTO::new)
                .toList()
        );
    }
}
