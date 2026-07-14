package prova_dev.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "departamentos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Departamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O código do departamento é obrigatório")
    @Column(name = "codigo_departamento", unique = true, nullable = false, length = 50)
    private String codigoDepartamento;

    @NotBlank(message = "A descrição do departamento é obrigatória")
    @Column(nullable = false, length = 150)
    private String descricao;

    @Column(nullable = false)
    private Boolean ativo = true;
}
