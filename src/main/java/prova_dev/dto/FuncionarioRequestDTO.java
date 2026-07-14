package prova_dev.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import org.hibernate.validator.constraints.br.CPF;

import java.util.List;

public record FuncionarioRequestDTO(
    @NotBlank(message = "O nome é obrigatório")
    String nome,

    @NotBlank(message = "O CPF é obrigatório")
    @CPF(message = "CPF inválido")
    String cpf,

    Boolean ativo,

    @NotEmpty(message = "O funcionário deve ter pelo menos um vínculo")
    @Valid
    List<VinculoRequestDTO> vinculos
) {}
