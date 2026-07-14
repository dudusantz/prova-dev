package prova_dev.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record VinculoRequestDTO(
    Long id,

    @NotBlank(message = "A empresa é obrigatória")
    String empresa,

    @NotBlank(message = "A matrícula é obrigatória")
    String matricula,

    @NotNull(message = "O ID do cargo é obrigatório")
    Long cargoId,

    @NotNull(message = "O ID do departamento é obrigatório")
    Long departamentoId,

    Boolean ativo
) {}
