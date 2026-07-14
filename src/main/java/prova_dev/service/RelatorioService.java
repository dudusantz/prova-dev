package prova_dev.service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.ColumnText;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPageEventHelper;
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

@Service
@RequiredArgsConstructor
public class RelatorioService {

    /** Azul do estilo espelho ponto (~ #5DADE2), alinhado ao azul-hover da paleta. */
    private static final Color AZUL_CABECALHO = new Color(93, 173, 226);
    private static final Color BORDA = new Color(200, 200, 200);
    private static final Color TEXTO = Color.BLACK;
    private static final Color TEXTO_SECUNDARIO = new Color(82, 82, 82);
    private static final Color FUNDO_ZEBRA = new Color(245, 250, 253);
    private static final DateTimeFormatter FORMATADOR_DATA =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

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
            Long departamentoId,
            Boolean ativo
    ) {
        List<FuncionarioResponseDTO> dados = funcionarioService
                .filtrar(nome, cpf, matricula, empresa, cargoId, departamentoId, ativo, Pageable.unpaged())
                .getContent();
        return montarPdfFuncionarios(dados);
    }

    @Transactional(readOnly = true)
    public byte[] gerarRelatorioCargos(String descricao, String codigo, Boolean ativo) {
        List<CargoResponseDTO> dados = cargoService
                .filtrar(descricao, codigo, ativo, Pageable.unpaged())
                .getContent();
        return montarPdfCargos(dados);
    }

    @Transactional(readOnly = true)
    public byte[] gerarRelatorioDepartamentos(String descricao, String codigo, Boolean ativo) {
        List<DepartamentoResponseDTO> dados = departamentoService
                .filtrar(descricao, codigo, ativo, Pageable.unpaged())
                .getContent();
        return montarPdfDepartamentos(dados);
    }

    byte[] montarPdfFuncionarios(List<FuncionarioResponseDTO> dados) {
        garantirDados(dados);

        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4.rotate(), 36, 36, 48, 42);
            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setPageEvent(new RodapePaginaEvent());
            document.open();

            adicionarCabecalho(document, "Relat\u00f3rio de Funcion\u00e1rios", dados.size());

            PdfPTable tabela = criarTabela(6, new float[]{2.2f, 1.5f, 1.8f, 1.3f, 1.8f, 1.8f});
            adicionarCabecalhosTabela(
                    tabela,
                    "Nome",
                    "CPF",
                    "Empresa",
                    "Matr\u00edcula",
                    "Cargo",
                    "Departamento"
            );

            boolean zebraGrupo = false;
            for (FuncionarioResponseDTO func : dados) {
                List<VinculoResponseDTO> vinculos = vinculosAtivos(func);
                adicionarLinhasFuncionario(tabela, func, vinculos, zebraGrupo);
                zebraGrupo = !zebraGrupo;
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
            Document document = new Document(PageSize.A4, 36, 36, 48, 42);
            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setPageEvent(new RodapePaginaEvent());
            document.open();

            adicionarCabecalho(document, "Relat\u00f3rio de Cargos", dados.size());

            PdfPTable tabela = criarTabela(3, new float[]{3.2f, 1.6f, 1.2f});
            adicionarCabecalhosTabela(tabela, "Nome / Descri\u00e7\u00e3o", "C\u00f3digo", "Situa\u00e7\u00e3o");

            for (CargoResponseDTO cargo : dados) {
                adicionarCelula(tabela, cargo.descricao());
                adicionarCelula(tabela, cargo.codigoCargo());
                adicionarCelula(tabela, situacao(cargo.ativo()));
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
            Document document = new Document(PageSize.A4, 36, 36, 48, 42);
            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setPageEvent(new RodapePaginaEvent());
            document.open();

            adicionarCabecalho(document, "Relat\u00f3rio de Departamentos", dados.size());

            PdfPTable tabela = criarTabela(3, new float[]{3.2f, 1.6f, 1.2f});
            adicionarCabecalhosTabela(
                    tabela,
                    "Descri\u00e7\u00e3o do Departamento",
                    "C\u00f3digo",
                    "Situa\u00e7\u00e3o"
            );

            for (DepartamentoResponseDTO depto : dados) {
                adicionarCelula(tabela, depto.descricao());
                adicionarCelula(tabela, depto.codigoDepartamento());
                adicionarCelula(tabela, situacao(depto.ativo()));
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

    private PdfPTable criarTabela(int colunas, float[] widths) throws DocumentException {
        PdfPTable tabela = new PdfPTable(colunas);
        tabela.setWidthPercentage(100);
        tabela.setWidths(widths);
        tabela.setSpacingBefore(4f);
        tabela.getDefaultCell().setBorderColor(BORDA);
        return tabela;
    }

    private void adicionarCabecalho(Document document, String titulo, int total) throws DocumentException {
        Font marcaFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, AZUL_CABECALHO);
        Font tituloFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, TEXTO);
        Font metaFont = FontFactory.getFont(FontFactory.HELVETICA, 9, TEXTO_SECUNDARIO);

        PdfPTable topo = new PdfPTable(3);
        topo.setWidthPercentage(100);
        topo.setWidths(new float[]{1.4f, 3.2f, 1.8f});

        PdfPCell marca = celulaSemBorda(new Phrase("Gest\u00e3o RH", marcaFont));
        marca.setHorizontalAlignment(Element.ALIGN_LEFT);
        marca.setVerticalAlignment(Element.ALIGN_MIDDLE);

        PdfPCell tituloCell = celulaSemBorda(new Phrase(titulo, tituloFont));
        tituloCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        tituloCell.setVerticalAlignment(Element.ALIGN_MIDDLE);

        PdfPCell dataCell = celulaSemBorda(
                new Phrase(LocalDateTime.now().format(FORMATADOR_DATA), metaFont)
        );
        dataCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        dataCell.setVerticalAlignment(Element.ALIGN_MIDDLE);

        topo.addCell(marca);
        topo.addCell(tituloCell);
        topo.addCell(dataCell);
        topo.setSpacingAfter(8f);
        document.add(topo);

        // Linha separadora suave
        PdfPTable linha = new PdfPTable(1);
        linha.setWidthPercentage(100);
        PdfPCell barra = new PdfPCell();
        barra.setFixedHeight(2.5f);
        barra.setBackgroundColor(AZUL_CABECALHO);
        barra.setBorder(Rectangle.NO_BORDER);
        linha.addCell(barra);
        linha.setSpacingAfter(10f);
        document.add(linha);

        Paragraph resumo = new Paragraph("Total de registros: " + total, metaFont);
        resumo.setSpacingAfter(10f);
        document.add(resumo);
    }

    private PdfPCell celulaSemBorda(Phrase phrase) {
        PdfPCell cell = new PdfPCell(phrase);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(2f);
        return cell;
    }

    private void adicionarCabecalhosTabela(PdfPTable tabela, String... titulos) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
        for (String titulo : titulos) {
            PdfPCell cell = new PdfPCell(new Phrase(titulo, font));
            cell.setBackgroundColor(AZUL_CABECALHO);
            cell.setHorizontalAlignment(Element.ALIGN_LEFT);
            cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            cell.setPadding(6f);
            cell.setBorderColor(BORDA);
            cell.setBorderWidth(0.6f);
            tabela.addCell(cell);
        }
    }

    private void adicionarCelula(PdfPTable tabela, String valor) {
        adicionarCelula(tabela, valor, false);
    }

    private void adicionarCelula(PdfPTable tabela, String valor, boolean zebra) {
        tabela.addCell(criarCelula(valor, 1, zebra, false));
    }

    private void adicionarLinhasFuncionario(
            PdfPTable tabela,
            FuncionarioResponseDTO func,
            List<VinculoResponseDTO> vinculos,
            boolean zebra
    ) {
        if (vinculos.isEmpty()) {
            adicionarCelulaIdentidade(tabela, func.nome(), 1, zebra);
            adicionarCelulaIdentidade(tabela, func.cpf(), 1, zebra);
            adicionarCelula(tabela, "-", zebra);
            adicionarCelula(tabela, "-", zebra);
            adicionarCelula(tabela, "-", zebra);
            adicionarCelula(tabela, "-", zebra);
            return;
        }

        int total = vinculos.size();
        for (int i = 0; i < total; i++) {
            VinculoResponseDTO vinculo = vinculos.get(i);
            if (i == 0) {
                adicionarCelulaIdentidade(tabela, func.nome(), total, zebra);
                adicionarCelulaIdentidade(tabela, func.cpf(), total, zebra);
            }
            adicionarCelula(tabela, vinculo.empresa(), zebra);
            adicionarCelula(tabela, vinculo.matricula(), zebra);
            adicionarCelula(tabela, vinculo.descricaoCargo(), zebra);
            adicionarCelula(tabela, vinculo.descricaoDepartamento(), zebra);
        }
    }

    private void adicionarCelulaIdentidade(PdfPTable tabela, String valor, int rowspan, boolean zebra) {
        PdfPCell cell = criarCelula(valor, rowspan, zebra, true);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        tabela.addCell(cell);
    }

    private PdfPCell criarCelula(String valor, int rowspan, boolean zebra, boolean identidade) {
        Font font = FontFactory.getFont(
                identidade ? FontFactory.HELVETICA_BOLD : FontFactory.HELVETICA,
                8,
                TEXTO
        );
        PdfPCell cell = new PdfPCell(new Phrase(valor == null || valor.isBlank() ? "-" : valor, font));
        cell.setPadding(5f);
        cell.setBorderColor(BORDA);
        cell.setBorderWidth(0.6f);
        cell.setBackgroundColor(zebra ? FUNDO_ZEBRA : Color.WHITE);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        if (rowspan > 1) {
            cell.setRowspan(rowspan);
        }
        return cell;
    }

    private List<VinculoResponseDTO> vinculosAtivos(FuncionarioResponseDTO func) {
        if (func.vinculos() == null) {
            return List.of();
        }
        return func.vinculos().stream()
                .filter(v -> !Boolean.FALSE.equals(v.ativo()))
                .sorted((a, b) -> {
                    String empresaA = a.empresa() == null ? "" : a.empresa();
                    String empresaB = b.empresa() == null ? "" : b.empresa();
                    int porEmpresa = empresaA.compareToIgnoreCase(empresaB);
                    if (porEmpresa != 0) {
                        return porEmpresa;
                    }
                    String matA = a.matricula() == null ? "" : a.matricula();
                    String matB = b.matricula() == null ? "" : b.matricula();
                    return matA.compareToIgnoreCase(matB);
                })
                .toList();
    }

    private String situacao(Boolean ativo) {
        return Boolean.FALSE.equals(ativo) ? "Inativo" : "Ativo";
    }

    /** Rodapé no estilo do espelho ponto: linha + numeração à direita. */
    private static final class RodapePaginaEvent extends PdfPageEventHelper {

        private final Font font = FontFactory.getFont(FontFactory.HELVETICA, 8, TEXTO_SECUNDARIO);

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            float xInicio = document.leftMargin();
            float xFim = document.getPageSize().getWidth() - document.rightMargin();
            float y = document.bottomMargin() - 12;

            writer.getDirectContent().setColorStroke(BORDA);
            writer.getDirectContent().setLineWidth(0.6f);
            writer.getDirectContent().moveTo(xInicio, y + 10);
            writer.getDirectContent().lineTo(xFim, y + 10);
            writer.getDirectContent().stroke();

            ColumnText.showTextAligned(
                    writer.getDirectContent(),
                    Element.ALIGN_RIGHT,
                    new Phrase("P\u00e1gina " + writer.getPageNumber(), font),
                    xFim,
                    y,
                    0
            );
        }
    }
}
