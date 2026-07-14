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
import prova_dev.dto.DepartamentoRequestDTO;
import prova_dev.dto.DepartamentoResponseDTO;
import prova_dev.service.DepartamentoService;
import prova_dev.service.RelatorioService;

@RestController
@RequestMapping("/api/departamentos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DepartamentoController {

    private final DepartamentoService departamentoService;
    private final RelatorioService relatorioService;

    @PostMapping
    public ResponseEntity<DepartamentoResponseDTO> criar(@RequestBody @Valid DepartamentoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(departamentoService.salvar(dto));
    }

    @GetMapping("/relatorio")
    public ResponseEntity<byte[]> baixarRelatorio(
            @RequestParam(required = false) String descricao,
            @RequestParam(required = false) String codigo
    ) {
        // Relatório sempre lista apenas cadastros ativos
        byte[] pdf = relatorioService.gerarRelatorioDepartamentos(descricao, codigo, true);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=relatorio-departamentos.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DepartamentoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(departamentoService.buscarPorId(id));
    }

    @GetMapping
    public ResponseEntity<Page<DepartamentoResponseDTO>> listar(
            @RequestParam(required = false) String descricao,
            @RequestParam(required = false) String codigo,
            @RequestParam(required = false, defaultValue = "true") Boolean ativo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Boolean todos
    ) {
        Boolean filtroAtivo = Boolean.TRUE.equals(todos) ? null : ativo;
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(departamentoService.filtrar(descricao, codigo, filtroAtivo, pageable));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DepartamentoResponseDTO> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid DepartamentoRequestDTO dto
    ) {
        return ResponseEntity.ok(departamentoService.atualizar(id, dto));
    }
}
