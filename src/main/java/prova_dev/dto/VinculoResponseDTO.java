package prova_dev.dto;

import prova_dev.model.Vinculo;

public record VinculoResponseDTO(
    Long id,
    String empresa,
    String matricula,
    String codigoCargo,
    String descricaoCargo,
    String codigoDepartamento,
    String descricaoDepartamento
) {
    public VinculoResponseDTO(Vinculo vinculo) {
        this(
            vinculo.getId(),
            vinculo.getEmpresa(),
            vinculo.getMatricula(),
            vinculo.getCargo().getCodigoCargo(),
            vinculo.getCargo().getDescricao(),
            vinculo.getDepartamento().getCodigoDepartamento(),
            vinculo.getDepartamento().getDescricao()
        );
    }
}