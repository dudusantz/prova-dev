package prova_dev.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import prova_dev.dto.FuncionarioRequestDTO;
import prova_dev.dto.FuncionarioResponseDTO;
import prova_dev.service.FuncionarioService;
import prova_dev.service.RelatorioService;

@RestController
@RequestMapping("/api/funcionarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FuncionarioController {

    private final FuncionarioService funcionarioService;
    private final RelatorioService relatorioService;

    @PostMapping
    public ResponseEntity<Void> criar(@RequestBody @Valid FuncionarioRequestDTO dto) {
        funcionarioService.salvar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping
    public ResponseEntity<Page<FuncionarioResponseDTO>> listar(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) String cpf,
            @RequestParam(required = false) String matricula,
            @RequestParam(required = false) String empresa,
            @RequestParam(required = false) Long cargoId,
            @RequestParam(required = false) Long departamentoId,
            @RequestParam(required = false, defaultValue = "true") Boolean ativo,
            @RequestParam(required = false) Boolean todos,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Boolean filtroAtivo = Boolean.TRUE.equals(todos) ? null : ativo;
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(funcionarioService.filtrar(
                nome, cpf, matricula, empresa, cargoId, departamentoId, filtroAtivo, pageable
        ));
    }

    @GetMapping("/relatorio")
    public ResponseEntity<byte[]> baixarRelatorio(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) String cpf,
            @RequestParam(required = false) String matricula,
            @RequestParam(required = false) String empresa,
            @RequestParam(required = false) Long cargoId,
            @RequestParam(required = false) Long departamentoId
    ) {
        // Relatório sempre lista apenas funcionários ativos
        byte[] pdf = relatorioService.gerarRelatorioFuncionarios(
                nome, cpf, matricula, empresa, cargoId, departamentoId, true
        );
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=relatorio-funcionarios.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FuncionarioResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(funcionarioService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> atualizar(@PathVariable Long id, @RequestBody @Valid FuncionarioRequestDTO dto) {
        funcionarioService.atualizar(id, dto);
        return ResponseEntity.ok().build();
    }
}
