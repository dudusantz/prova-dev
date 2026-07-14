package prova_dev.dto;

import jakarta.validation.constraints.NotBlank;

public record DepartamentoRequestDTO(
    @NotBlank(message = "O código do departamento é obrigatório")
    String codigoDepartamento,

    @NotBlank(message = "A descrição é obrigatória")
    String descricao,

    Boolean ativo
) {}
