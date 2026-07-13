package prova_dev.service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import prova_dev.dto.CargoResponseDTO;
import prova_dev.dto.DepartamentoResponseDTO;
import prova_dev.dto.FuncionarioResponseDTO;
import prova_dev.dto.VinculoResponseDTO;
import prova_dev.exception.RegraNegocioException;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RelatorioService {

    private static final Color AZUL_CABECALHO = new Color(48, 120, 180);
    private static final Color CINZA_ALTERNADO = new Color(245, 245, 245);
    private static final DateTimeFormatter FORMATADOR_DATA =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    private final FuncionarioService funcionarioService;
    private final CargoService cargoService;
    private final DepartamentoService departamentoService;

    @Transactional(readOnly = true)
    public byte[] gerarRelatorioFuncionarios(
            String nome,
            String cpf,
            String matricula,
            String empresa,
            Long cargoId,
            Long departamentoId
    ) {
        List<FuncionarioResponseDTO> dados = funcionarioService
                .filtrar(nome, cpf, matricula, empresa, cargoId, departamentoId, Pageable.unpaged())
                .getContent();
        return montarPdfFuncionarios(dados);
    }

    @Transactional(readOnly = true)
    public byte[] gerarRelatorioCargos(String descricao, String codigo) {
        List<CargoResponseDTO> dados = cargoService.filtrar(descricao, codigo, Pageable.unpaged()).getContent();
        return montarPdfCargos(dados);
    }

    @Transactional(readOnly = true)
    public byte[] gerarRelatorioDepartamentos(String descricao, String codigo) {
        List<DepartamentoResponseDTO> dados = departamentoService
                .filtrar(descricao, codigo, Pageable.unpaged())
                .getContent();
        return montarPdfDepartamentos(dados);
    }

    byte[] montarPdfFuncionarios(List<FuncionarioResponseDTO> dados) {
        garantirDados(dados);

        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4.rotate(), 36, 36, 36, 36);
            PdfWriter.getInstance(document, out);
            document.open();

            adicionarCabecalho(document, "Relat\u00f3rio de Funcion\u00e1rios", dados.size());

            PdfPTable tabela = new PdfPTable(6);
            tabela.setWidthPercentage(100);
            tabela.setWidths(new float[]{2.2f, 1.4f, 1.8f, 1.4f, 1.8f, 1.8f});
            adicionarCabecalhosTabela(
                    tabela,
                    "Nome",
                    "CPF",
                    "Empresa(s)",
                    "Matr\u00edcula(s)",
                    "Cargo(s)",
                    "Departamento(s)"
            );

            boolean zebra = false;
            for (FuncionarioResponseDTO func : dados) {
                List<VinculoResponseDTO> vinculos = func.vinculos() == null ? List.of() : func.vinculos();
                adicionarCelula(tabela, func.nome(), zebra);
                adicionarCelula(tabela, func.cpf(), zebra);
                adicionarCelula(tabela, juntar(vinculos, VinculoResponseDTO::empresa), zebra);
                adicionarCelula(tabela, juntar(vinculos, VinculoResponseDTO::matricula), zebra);
                adicionarCelula(tabela, juntar(vinculos, VinculoResponseDTO::descricaoCargo), zebra);
                adicionarCelula(tabela, juntar(vinculos, VinculoResponseDTO::descricaoDepartamento), zebra);
                zebra = !zebra;
            }

            document.add(tabela);
            document.close();
            return out.toByteArray();
        } catch (DocumentException e) {
            throw new RegraNegocioException("Falha ao gerar o relat\u00f3rio de funcion\u00e1rios.");
        }
    }

    byte[] montarPdfCargos(List<CargoResponseDTO> dados) {
        garantirDados(dados);

        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(document, out);
            document.open();

            adicionarCabecalho(document, "Relat\u00f3rio de Cargos", dados.size());

            PdfPTable tabela = new PdfPTable(2);
            tabela.setWidthPercentage(100);
            tabela.setWidths(new float[]{3f, 2f});
            adicionarCabecalhosTabela(tabela, "Nome / Descri\u00e7\u00e3o", "C\u00f3digo");

            boolean zebra = false;
            for (CargoResponseDTO cargo : dados) {
                adicionarCelula(tabela, cargo.descricao(), zebra);
                adicionarCelula(tabela, cargo.codigoCargo(), zebra);
                zebra = !zebra;
            }

            document.add(tabela);
            document.close();
            return out.toByteArray();
        } catch (DocumentException e) {
            throw new RegraNegocioException("Falha ao gerar o relat\u00f3rio de cargos.");
        }
    }

    byte[] montarPdfDepartamentos(List<DepartamentoResponseDTO> dados) {
        garantirDados(dados);

        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(document, out);
            document.open();

            adicionarCabecalho(document, "Relat\u00f3rio de Departamentos", dados.size());

            PdfPTable tabela = new PdfPTable(2);
            tabela.setWidthPercentage(100);
            tabela.setWidths(new float[]{3f, 2f});
            adicionarCabecalhosTabela(tabela, "Descri\u00e7\u00e3o do Departamento", "C\u00f3digo");

            boolean zebra = false;
            for (DepartamentoResponseDTO depto : dados) {
                adicionarCelula(tabela, depto.descricao(), zebra);
                adicionarCelula(tabela, depto.codigoDepartamento(), zebra);
                zebra = !zebra;
            }

            document.add(tabela);
            document.close();
            return out.toByteArray();
        } catch (DocumentException e) {
            throw new RegraNegocioException("Falha ao gerar o relat\u00f3rio de departamentos.");
        }
    }

    private void garantirDados(List<?> dados) {
        if (dados == null || dados.isEmpty()) {
            throw new RegraNegocioException("N\u00e3o h\u00e1 dados para gerar o relat\u00f3rio.");
        }
    }

    private void adicionarCabecalho(Document document, String titulo, int total) throws DocumentException {
        Font tituloFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, AZUL_CABECALHO);
        Font metaFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.DARK_GRAY);

        Paragraph tituloParagrafo = new Paragraph(titulo, tituloFont);
        tituloParagrafo.setSpacingAfter(6f);
        document.add(tituloParagrafo);

        document.add(new Paragraph("Gerado em: " + LocalDateTime.now().format(FORMATADOR_DATA), metaFont));
        Paragraph totalParagrafo = new Paragraph("Total de registros: " + total, metaFont);
        totalParagrafo.setSpacingAfter(14f);
        document.add(totalParagrafo);
    }

    private void adicionarCabecalhosTabela(PdfPTable tabela, String... titulos) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
        for (String titulo : titulos) {
            PdfPCell cell = new PdfPCell(new Phrase(titulo, font));
            cell.setBackgroundColor(AZUL_CABECALHO);
            cell.setHorizontalAlignment(Element.ALIGN_LEFT);
            cell.setPadding(6f);
            tabela.addCell(cell);
        }
    }

    private void adicionarCelula(PdfPTable tabela, String valor, boolean zebra) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.BLACK);
        PdfPCell cell = new PdfPCell(new Phrase(valor == null || valor.isBlank() ? "-" : valor, font));
        cell.setPadding(5f);
        if (zebra) {
            cell.setBackgroundColor(CINZA_ALTERNADO);
        }
        tabela.addCell(cell);
    }

    private String juntar(List<VinculoResponseDTO> vinculos, Function<VinculoResponseDTO, String> mapper) {
        if (vinculos.isEmpty()) {
            return "-";
        }
        return vinculos.stream()
                .map(mapper)
                .map(v -> v == null || v.isBlank() ? "N/D" : v)
                .collect(Collectors.joining("\n"));
    }
}
