package prova_dev.dto;

import prova_dev.model.Cargo;

public record CargoResponseDTO(
    Long id,
    String codigoCargo,
    String descricao,
    Boolean ativo
) {
    public CargoResponseDTO(Cargo cargo) {
        this(cargo.getId(), cargo.getCodigoCargo(), cargo.getDescricao(), cargo.getAtivo());
    }
}
