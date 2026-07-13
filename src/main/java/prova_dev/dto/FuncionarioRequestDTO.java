package prova_dev.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import org.hibernate.validator.constraints.br.CPF; // Validador nativo de CPF do Hibernate

import java.util.List;

public record FuncionarioRequestDTO(
    @NotBlank(message = "O nome é obrigatório")
    String nome,
    
    @NotBlank(message = "O CPF é obrigatório")
    @CPF(message = "CPF inválido") // Um detalhe sênior: o próprio Java já valida se o cálculo matemático do CPF é real
    String cpf,
    
    @NotEmpty(message = "O funcionário deve ter pelo menos um vínculo")
    @Valid // Garante que a validação desça para dentro de cada vínculo na lista
    List<VinculoRequestDTO> vinculos
) {}