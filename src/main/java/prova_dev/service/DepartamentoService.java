package prova_dev.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import prova_dev.dto.DepartamentoRequestDTO;
import prova_dev.dto.DepartamentoResponseDTO;
import prova_dev.exception.RegraNegocioException;
import prova_dev.model.Departamento;
import prova_dev.repository.DepartamentoRepository;

@Service
@RequiredArgsConstructor
public class DepartamentoService {

    private final DepartamentoRepository departamentoRepository;

    @Transactional
    public DepartamentoResponseDTO salvar(DepartamentoRequestDTO dto) {
        String codigo = dto.codigoDepartamento();
        
        if (departamentoRepository.existeCodigoIgual(codigo)) {
            throw new RegraNegocioException("Já existe um departamento cadastrado com o código: " + codigo);
        }

        Departamento departamento = new Departamento();
        departamento.setDescricao(dto.descricao());
        departamento.setCodigoDepartamento(codigo);

        departamento = departamentoRepository.save(departamento);
        return new DepartamentoResponseDTO(departamento);
    }

    @Transactional(readOnly = true)
    public DepartamentoResponseDTO buscarPorId(Long id) {
        Departamento departamento = departamentoRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException("Departamento não encontrado com ID: " + id));
        return new DepartamentoResponseDTO(departamento);
    }

    @Transactional
    public DepartamentoResponseDTO atualizar(Long id, DepartamentoRequestDTO dto) {
        Departamento departamento = departamentoRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException("Departamento não encontrado."));

        String codigo = dto.codigoDepartamento();

        if (departamentoRepository.existeCodigoIgualEmOutroDepartamento(codigo, id)) {
            throw new RegraNegocioException("O código '" + codigo + "' já está sendo usado por outro departamento.");
        }

        departamento.setDescricao(dto.descricao());
        departamento.setCodigoDepartamento(codigo);

        departamento = departamentoRepository.save(departamento);
        return new DepartamentoResponseDTO(departamento);
    }

    @Transactional(readOnly = true)
    public Page<DepartamentoResponseDTO> filtrar(String descricao, String codigo, Pageable pageable) {
        String descFiltro = (descricao == null || descricao.trim().isEmpty()) ? "" : descricao.trim();
        String codFiltro = (codigo == null || codigo.trim().isEmpty()) ? "" : codigo.trim();

        return departamentoRepository.filtrar(descFiltro, codFiltro, pageable)
                .map(DepartamentoResponseDTO::new);
    }
}