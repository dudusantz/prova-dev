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

        for (VinculoRequestDTO vinculoDto : dto.vinculos()) {
            
            if (funcionarioRepository.existeMatriculaNaEmpresa(vinculoDto.matricula(), vinculoDto.empresa())) {
                throw new RegraNegocioException("A matrícula " + vinculoDto.matricula() + " já está cadastrada na empresa " + vinculoDto.empresa());
            }

            Cargo cargo = cargoRepository.findById(vinculoDto.cargoId())
                    .orElseThrow(() -> new RegraNegocioException("Cargo não encontrado: " + vinculoDto.cargoId()));
                    
            Departamento departamento = departamentoRepository.findById(vinculoDto.departamentoId())
                    .orElseThrow(() -> new RegraNegocioException("Departamento não encontrado: " + vinculoDto.departamentoId()));

            Vinculo vinculo = new Vinculo();
            vinculo.setEmpresa(vinculoDto.empresa());
            vinculo.setMatricula(vinculoDto.matricula());
            vinculo.setCargo(cargo);
            vinculo.setDepartamento(departamento);

            funcionario.addVinculo(vinculo);
        }

        funcionarioRepository.save(funcionario);
    }

    @Transactional(readOnly = true)
    public Page<FuncionarioResponseDTO> filtrar(String nome, String cpf, String matricula, String empresa, Long cargoId, Long departamentoId, Pageable pageable) {
        
        String nomeFiltro = (nome == null || nome.trim().isEmpty()) ? "" : nome;
        String cpfFiltro = (cpf == null || cpf.trim().isEmpty()) ? "" : cpf; 
        String matriculaFiltro = (matricula == null || matricula.trim().isEmpty()) ? "" : matricula;
        String empresaFiltro = (empresa == null || empresa.trim().isEmpty()) ? "" : empresa;
        
        Long cargoIdFiltro = (cargoId == null) ? 0L : cargoId;
        Long deptoIdFiltro = (departamentoId == null) ? 0L : departamentoId;

        return funcionarioRepository.filtrar(nomeFiltro, cpfFiltro, matriculaFiltro, empresaFiltro, cargoIdFiltro, deptoIdFiltro, pageable)
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

        funcionario.getVinculos().clear();
        
        for (VinculoRequestDTO vinculoDto : dto.vinculos()) {
            
            if (funcionarioRepository.existeMatriculaNaEmpresaEmOutroFuncionario(vinculoDto.matricula(), vinculoDto.empresa(), id)) {
                throw new RegraNegocioException("A matrícula " + vinculoDto.matricula() + " já pertence a outro funcionário na empresa " + vinculoDto.empresa());
            }

            Cargo cargo = cargoRepository.findById(vinculoDto.cargoId())
                    .orElseThrow(() -> new RegraNegocioException("Cargo não encontrado"));
            Departamento departamento = departamentoRepository.findById(vinculoDto.departamentoId())
                    .orElseThrow(() -> new RegraNegocioException("Departamento não encontrado"));

            Vinculo vinculo = new Vinculo();
            vinculo.setEmpresa(vinculoDto.empresa());
            vinculo.setMatricula(vinculoDto.matricula());
            vinculo.setCargo(cargo);
            vinculo.setDepartamento(departamento);

            funcionario.addVinculo(vinculo);
        }

        funcionarioRepository.save(funcionario);
    }
}