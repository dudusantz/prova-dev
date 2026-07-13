package prova_dev.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import prova_dev.dto.CargoRequestDTO;
import prova_dev.dto.CargoResponseDTO;
import prova_dev.exception.RegraNegocioException;
import prova_dev.model.Cargo;
import prova_dev.repository.CargoRepository;

@Service
@RequiredArgsConstructor
public class CargoService {

    private final CargoRepository cargoRepository;

    @Transactional
    public CargoResponseDTO salvar(CargoRequestDTO dto) {
        String codigo = dto.codigoCargo(); // Captura o dado enviado
        
        // --- VALIDAÇÃO BLINDADA ---
        if (cargoRepository.existeCodigoIgual(codigo)) {
            throw new RegraNegocioException("Já existe um cargo cadastrado com o código: " + codigo);
        }

        Cargo cargo = new Cargo();
        cargo.setDescricao(dto.descricao());
        cargo.setCodigoCargo(codigo);

        cargo = cargoRepository.save(cargo);
        return new CargoResponseDTO(cargo);
    }

    @Transactional(readOnly = true)
    public CargoResponseDTO buscarPorId(Long id) {
        Cargo cargo = cargoRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException("Cargo não encontrado com ID: " + id));
        return new CargoResponseDTO(cargo);
    }

    @Transactional
    public CargoResponseDTO atualizar(Long id, CargoRequestDTO dto) {
        Cargo cargo = cargoRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException("Cargo não encontrado."));

        String codigo = dto.codigoCargo();

        // --- VALIDAÇÃO BLINDADA ---
        if (cargoRepository.existeCodigoIgualEmOutroCargo(codigo, id)) {
            throw new RegraNegocioException("O código '" + codigo + "' já está sendo usado por outro cargo.");
        }

        cargo.setDescricao(dto.descricao());
        cargo.setCodigoCargo(codigo);

        cargo = cargoRepository.save(cargo);
        return new CargoResponseDTO(cargo);
    }

    @Transactional(readOnly = true)
    public Page<CargoResponseDTO> filtrar(String descricao, String codigo, Pageable pageable) {
        String descFiltro = (descricao == null || descricao.trim().isEmpty()) ? "" : descricao.trim();
        String codFiltro = (codigo == null || codigo.trim().isEmpty()) ? "" : codigo.trim();

        return cargoRepository.filtrar(descFiltro, codFiltro, pageable)
                .map(CargoResponseDTO::new);
    }
}