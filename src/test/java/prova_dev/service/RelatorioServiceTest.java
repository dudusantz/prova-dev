package prova_dev.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import prova_dev.dto.CargoResponseDTO;
import prova_dev.dto.DepartamentoResponseDTO;
import prova_dev.dto.FuncionarioResponseDTO;
import prova_dev.dto.VinculoResponseDTO;
import prova_dev.exception.RegraNegocioException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class RelatorioServiceTest {

    private RelatorioService relatorioService;

    @BeforeEach
    void setUp() {
        // Construtor exige os 3 services; para testar a montagem do PDF nao precisamos deles.
        relatorioService = new RelatorioService(null, null, null);
    }

    @Test
    void deveGerarPdfFuncionariosComTodosOsFiltrados() {
        FuncionarioResponseDTO funcionario = new FuncionarioResponseDTO(
                1L,
                "Ana Silva",
                "529.982.247-25",
                List.of(new VinculoResponseDTO(
                        1L, "Empresa X", "MAT-1", "DEV", "Desenvolvedor", "TI", "Tecnologia"
                ))
        );

        byte[] pdf = relatorioService.montarPdfFuncionarios(List.of(funcionario));

        assertNotNull(pdf);
        assertTrue(pdf.length > 100);
        assertEquals('%', (char) pdf[0]);
        assertEquals('P', (char) pdf[1]);
        assertEquals('D', (char) pdf[2]);
        assertEquals('F', (char) pdf[3]);
    }

    @Test
    void deveRecusarRelatorioFuncionariosSemDados() {
        RegraNegocioException ex = assertThrows(
                RegraNegocioException.class,
                () -> relatorioService.montarPdfFuncionarios(List.of())
        );
        assertEquals("N\u00e3o h\u00e1 dados para gerar o relat\u00f3rio.", ex.getMessage());
    }

    @Test
    void deveGerarPdfCargos() {
        byte[] pdf = relatorioService.montarPdfCargos(
                List.of(new CargoResponseDTO(1L, "DEV-01", "Desenvolvedor", true))
        );

        assertNotNull(pdf);
        assertTrue(pdf.length > 100);
        assertEquals('%', (char) pdf[0]);
    }

    @Test
    void deveGerarPdfDepartamentos() {
        byte[] pdf = relatorioService.montarPdfDepartamentos(
                List.of(new DepartamentoResponseDTO(1L, "TI-01", "Tecnologia", true))
        );

        assertNotNull(pdf);
        assertTrue(pdf.length > 100);
        assertEquals('%', (char) pdf[0]);
    }
}
