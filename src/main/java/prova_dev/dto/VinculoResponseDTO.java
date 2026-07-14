package prova_dev.dto;

import prova_dev.model.Vinculo;

public record VinculoResponseDTO(
    Long id,
    String empresa,
    String matricula,
    Long cargoId,
    String codigoCargo,
    String descricaoCargo,
    Long departamentoId,
    String codigoDepartamento,
    String descricaoDepartamento,
    Boolean ativo
) {
    public VinculoResponseDTO(Vinculo vinculo) {
        this(
            vinculo.getId(),
            vinculo.getEmpresa(),
            vinculo.getMatricula(),
            vinculo.getCargo().getId(),
            vinculo.getCargo().getCodigoCargo(),
            vinculo.getCargo().getDescricao(),
            vinculo.getDepartamento().getId(),
            vinculo.getDepartamento().getCodigoDepartamento(),
            vinculo.getDepartamento().getDescricao(),
            vinculo.getAtivo()
        );
    }
}
