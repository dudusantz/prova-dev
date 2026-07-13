package prova_dev.dto;

import prova_dev.model.Departamento;

public record DepartamentoResponseDTO(
    Long id,
    String codigoDepartamento,
    String descricao
) {
    public DepartamentoResponseDTO(Departamento departamento) {
        this(departamento.getId(), departamento.getCodigoDepartamento(), departamento.getDescricao());
    }
}