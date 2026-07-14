package prova_dev.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import prova_dev.dto.FuncionarioRequestDTO;
import prova_dev.dto.FuncionarioResponseDTO;
import prova_dev.dto.VinculoRequestDTO;
import prova_dev.exception.RegraNegocioException;
import prova_dev.model.Cargo;
import prova_dev.model.Departamento;
import prova_dev.model.Funcionario;
import prova_dev.model.Vinculo;
import prova_dev.repository.CargoRepository;
import prova_dev.repository.DepartamentoRepository;
import prova_dev.repository.FuncionarioRepository;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FuncionarioService {

    private final FuncionarioRepository funcionarioRepository;
    private final CargoRepository cargoRepository;
    private final DepartamentoRepository departamentoRepository;

    @Transactional
    public void salvar(FuncionarioRequestDTO dto) {
        if (funcionarioRepository.existsByCpf(dto.cpf())) {
            throw new RegraNegocioException("Este CPF já está cadastrado no sistema.");
        }

        Funcionario funcionario = new Funcionario();
        funcionario.setNome(dto.nome());
        funcionario.setCpf(dto.cpf());
        funcionario.setAtivo(true);

        for (VinculoRequestDTO vinculoDto : dto.vinculos()) {
            if (funcionarioRepository.existeMatriculaNaEmpresa(vinculoDto.matricula(), vinculoDto.empresa())) {
                throw new RegraNegocioException(
                        "A matrícula " + vinculoDto.matricula()
                                + " já está cadastrada na empresa " + vinculoDto.empresa()
                );
            }

            Cargo cargo = buscarCargo(vinculoDto.cargoId());
            Departamento departamento = buscarDepartamento(vinculoDto.departamentoId());

            Vinculo vinculo = new Vinculo();
            vinculo.setEmpresa(vinculoDto.empresa());
            vinculo.setMatricula(vinculoDto.matricula());
            vinculo.setCargo(cargo);
            vinculo.setDepartamento(departamento);
            vinculo.setAtivo(true);

            funcionario.addVinculo(vinculo);
        }

        funcionarioRepository.save(funcionario);
    }

    @Transactional(readOnly = true)
    public Page<FuncionarioResponseDTO> filtrar(
            String nome,
            String cpf,
            String matricula,
            String empresa,
            Long cargoId,
            Long departamentoId,
            Boolean ativo,
            Pageable pageable
    ) {
        String nomeFiltro = (nome == null || nome.trim().isEmpty()) ? "" : nome.trim();
        String cpfFiltro = (cpf == null || cpf.trim().isEmpty()) ? "" : cpf.trim();
        String matriculaFiltro = (matricula == null || matricula.trim().isEmpty()) ? "" : matricula.trim();
        String empresaFiltro = (empresa == null || empresa.trim().isEmpty()) ? "" : empresa.trim();

        Long cargoIdFiltro = (cargoId == null) ? 0L : cargoId;
        Long deptoIdFiltro = (departamentoId == null) ? 0L : departamentoId;

        return funcionarioRepository
                .filtrar(nomeFiltro, cpfFiltro, matriculaFiltro, empresaFiltro, cargoIdFiltro, deptoIdFiltro, ativo, pageable)
                .map(FuncionarioResponseDTO::new);
    }

    @Transactional(readOnly = true)
    public FuncionarioResponseDTO buscarPorId(Long id) {
        Funcionario funcionario = funcionarioRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException("Funcionário não encontrado com ID: " + id));
        return new FuncionarioResponseDTO(funcionario);
    }

    @Transactional
    public void atualizar(Long id, FuncionarioRequestDTO dto) {
        Funcionario funcionario = funcionarioRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException("Funcionário não encontrado."));

        if (!funcionario.getCpf().equals(dto.cpf()) && funcionarioRepository.existsByCpf(dto.cpf())) {
            throw new RegraNegocioException("Este CPF já está cadastrado para outro funcionário.");
        }

        funcionario.setNome(dto.nome());
        funcionario.setCpf(dto.cpf());

        sincronizarVinculos(funcionario, dto.vinculos());

        boolean desejadoAtivo = dto.ativo() == null || dto.ativo();
        if (!desejadoAtivo && possuiVinculoAtivo(funcionario)) {
            throw new RegraNegocioException(
                    "Não é possível inativar o funcionário enquanto houver vínculo ativo. "
                            + "Inative todos os vínculos antes."
            );
        }
        funcionario.setAtivo(desejadoAtivo);

        funcionarioRepository.save(funcionario);
    }

    private void sincronizarVinculos(Funcionario funcionario, java.util.List<VinculoRequestDTO> vinculosDto) {
        Map<Long, Vinculo> existentesPorId = funcionario.getVinculos().stream()
                .filter(v -> v.getId() != null)
                .collect(Collectors.toMap(Vinculo::getId, Function.identity()));

        Set<Long> idsRecebidos = new HashSet<>();

        for (VinculoRequestDTO vinculoDto : vinculosDto) {
            boolean ativo = vinculoDto.ativo() == null || vinculoDto.ativo();

            if (ativo && funcionarioRepository.existeMatriculaNaEmpresaEmOutroFuncionario(
                    vinculoDto.matricula(), vinculoDto.empresa(), funcionario.getId()
            )) {
                throw new RegraNegocioException(
                        "A matrícula " + vinculoDto.matricula()
                                + " já pertence a outro funcionário na empresa " + vinculoDto.empresa()
                );
            }

            Cargo cargo = buscarCargo(vinculoDto.cargoId());
            Departamento departamento = buscarDepartamento(vinculoDto.departamentoId());

            if (vinculoDto.id() != null) {
                Vinculo existente = existentesPorId.get(vinculoDto.id());
                if (existente == null) {
                    throw new RegraNegocioException("Vínculo não encontrado: " + vinculoDto.id());
                }
                existente.setEmpresa(vinculoDto.empresa());
                existente.setMatricula(vinculoDto.matricula());
                existente.setCargo(cargo);
                existente.setDepartamento(departamento);
                existente.setAtivo(ativo);
                idsRecebidos.add(vinculoDto.id());
            } else {
                Vinculo novo = new Vinculo();
                novo.setEmpresa(vinculoDto.empresa());
                novo.setMatricula(vinculoDto.matricula());
                novo.setCargo(cargo);
                novo.setDepartamento(departamento);
                novo.setAtivo(ativo);
                funcionario.addVinculo(novo);
            }
        }

        // Vínculos existentes omitidos do payload são inativados (nunca excluídos)
        for (Vinculo existente : funcionario.getVinculos()) {
            if (existente.getId() != null && !idsRecebidos.contains(existente.getId())) {
                existente.setAtivo(false);
            }
        }

        validarMatriculasAtivasUnicasNoFuncionario(funcionario);
    }

    private void validarMatriculasAtivasUnicasNoFuncionario(Funcionario funcionario) {
        Set<String> chaves = new HashSet<>();
        for (Vinculo v : funcionario.getVinculos()) {
            if (!Boolean.TRUE.equals(v.getAtivo())) {
                continue;
            }
            String chave = normalize(v.getEmpresa()) + "|" + normalize(v.getMatricula());
            if (!chaves.add(chave)) {
                throw new RegraNegocioException(
                        "A matrícula " + v.getMatricula()
                                + " está duplicada na empresa " + v.getEmpresa()
                                + " entre vínculos ativos deste funcionário."
                );
            }
        }
    }

    private boolean possuiVinculoAtivo(Funcionario funcionario) {
        return funcionario.getVinculos().stream().anyMatch(v -> Boolean.TRUE.equals(v.getAtivo()));
    }

    private Cargo buscarCargo(Long cargoId) {
        return cargoRepository.findById(cargoId)
                .orElseThrow(() -> new RegraNegocioException("Cargo não encontrado: " + cargoId));
    }

    private Departamento buscarDepartamento(Long departamentoId) {
        return departamentoRepository.findById(departamentoId)
                .orElseThrow(() -> new RegraNegocioException("Departamento não encontrado: " + departamentoId));
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim().toUpperCase();
    }
}
