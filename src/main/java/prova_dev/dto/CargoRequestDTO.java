package prova_dev.dto;

import jakarta.validation.constraints.NotBlank;

public record CargoRequestDTO(
    @NotBlank(message = "O código do cargo é obrigatório")
    String codigoCargo,
    
    @NotBlank(message = "A descrição é obrigatória")
    String descricao
) {}