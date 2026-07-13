package prova_dev.dto;

import prova_dev.model.Cargo;

public record CargoResponseDTO(
    Long id,
    String codigoCargo,
    String descricao
) {
    // Construtor utilitário para transformar a Entidade em DTO facilmente
    public CargoResponseDTO(Cargo cargo) {
        this(cargo.getId(), cargo.getCodigoCargo(), cargo.getDescricao());
    }
}