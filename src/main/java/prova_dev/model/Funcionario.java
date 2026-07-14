package prova_dev.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "funcionarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Funcionario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome é obrigatório")
    @Column(nullable = false)
    private String nome;

    @NotBlank(message = "O CPF é obrigatório")
    @Column(unique = true, nullable = false, length = 14)
    private String cpf;

    @Column(nullable = false)
    private Boolean ativo = true;

    // Relacionamento Bidirecional: Um funcionário possui uma lista de vínculos.
    // orphanRemoval = true: só remove do banco se o vínculo sair da coleção (não usamos exclusão física).
    @OneToMany(mappedBy = "funcionario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Vinculo> vinculos = new ArrayList<>();

    // Método utilitário (OOP) para manter a consistência bidirecional
    public void addVinculo(Vinculo vinculo) {
        vinculos.add(vinculo);
        vinculo.setFuncionario(this);
    }
}