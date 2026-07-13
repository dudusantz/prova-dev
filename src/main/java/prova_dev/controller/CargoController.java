package prova_dev.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import prova_dev.dto.CargoRequestDTO;
import prova_dev.dto.CargoResponseDTO;
import prova_dev.service.CargoService;
import prova_dev.service.RelatorioService;

@RestController
@RequestMapping("/api/cargos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CargoController {

    private final CargoService cargoService;
    private final RelatorioService relatorioService;

    @PostMapping
    public ResponseEntity<CargoResponseDTO> criar(@RequestBody @Valid CargoRequestDTO dto) {
        CargoResponseDTO cargoSalvo = cargoService.salvar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(cargoSalvo);
    }

    @GetMapping("/relatorio")
    public ResponseEntity<byte[]> baixarRelatorio(
            @RequestParam(required = false) String descricao,
            @RequestParam(required = false) String codigo
    ) {
        byte[] pdf = relatorioService.gerarRelatorioCargos(descricao, codigo);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=relatorio-cargos.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CargoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(cargoService.buscarPorId(id));
    }

    @GetMapping
    public ResponseEntity<Page<CargoResponseDTO>> listar(
            @RequestParam(required = false) String descricao,
            @RequestParam(required = false) String codigo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(cargoService.filtrar(descricao, codigo, pageable));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CargoResponseDTO> atualizar(@PathVariable Long id, @RequestBody @Valid CargoRequestDTO dto) {
        return ResponseEntity.ok(cargoService.atualizar(id, dto));
    }
}
