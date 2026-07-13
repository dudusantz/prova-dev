package prova_dev.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import prova_dev.dto.DepartamentoRequestDTO;
import prova_dev.dto.DepartamentoResponseDTO;
import prova_dev.exception.RegraNegocioException;
import prova_dev.model.Departamento;
import prova_dev.repository.DepartamentoRepository;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DepartamentoServiceTest {

    @Mock
    private DepartamentoRepository departamentoRepository;

    @InjectMocks
    private DepartamentoService departamentoService;

    @Test
    void deveCadastrarDepartamentoQuandoCodigoDisponivel() {
        when(departamentoRepository.existeCodigoIgual("TI-01")).thenReturn(false);
        when(departamentoRepository.save(any(Departamento.class))).thenAnswer(inv -> {
            Departamento departamento = inv.getArgument(0);
            departamento.setId(1L);
            return departamento;
        });

        DepartamentoResponseDTO response = departamentoService.salvar(
                new DepartamentoRequestDTO("TI-01", "Tecnologia")
        );

        assertEquals(1L, response.id());
        assertEquals("TI-01", response.codigoDepartamento());
        assertEquals("Tecnologia", response.descricao());

        ArgumentCaptor<Departamento> captor = ArgumentCaptor.forClass(Departamento.class);
        verify(departamentoRepository).save(captor.capture());
        assertEquals("TI-01", captor.getValue().getCodigoDepartamento());
    }

    @Test
    void deveRecusarCadastroQuandoCodigoDuplicado() {
        when(departamentoRepository.existeCodigoIgual("TI-01")).thenReturn(true);

        RegraNegocioException ex = assertThrows(
                RegraNegocioException.class,
                () -> departamentoService.salvar(new DepartamentoRequestDTO("TI-01", "Tecnologia"))
        );

        assertTrue(ex.getMessage().contains("Já existe um departamento cadastrado com o código"));
        verify(departamentoRepository, never()).save(any());
    }

    @Test
    void deveAtualizarDepartamentoQuandoCodigoNaoConflita() {
        Departamento existente = new Departamento();
        existente.setId(1L);
        existente.setCodigoDepartamento("TI-01");
        existente.setDescricao("Antigo");

        when(departamentoRepository.findById(1L)).thenReturn(Optional.of(existente));
        when(departamentoRepository.existeCodigoIgualEmOutroDepartamento("TI-02", 1L)).thenReturn(false);
        when(departamentoRepository.save(any(Departamento.class))).thenAnswer(inv -> inv.getArgument(0));

        DepartamentoResponseDTO response = departamentoService.atualizar(
                1L,
                new DepartamentoRequestDTO("TI-02", "Novo")
        );

        assertEquals("TI-02", response.codigoDepartamento());
        assertEquals("Novo", response.descricao());
    }

    @Test
    void deveRecusarAtualizacaoQuandoCodigoUsadoPorOutroDepartamento() {
        Departamento existente = new Departamento();
        existente.setId(1L);
        existente.setCodigoDepartamento("TI-01");
        existente.setDescricao("Antigo");

        when(departamentoRepository.findById(1L)).thenReturn(Optional.of(existente));
        when(departamentoRepository.existeCodigoIgualEmOutroDepartamento("RH-01", 1L)).thenReturn(true);

        RegraNegocioException ex = assertThrows(
                RegraNegocioException.class,
                () -> departamentoService.atualizar(1L, new DepartamentoRequestDTO("RH-01", "RH"))
        );

        assertTrue(ex.getMessage().contains("já está sendo usado por outro departamento"));
        verify(departamentoRepository, never()).save(any());
    }

    @Test
    void deveFiltrarNormalizandoParametrosVazios() {
        Pageable pageable = PageRequest.of(0, 10);
        Departamento departamento = new Departamento();
        departamento.setId(1L);
        departamento.setCodigoDepartamento("TI-01");
        departamento.setDescricao("Tecnologia");

        when(departamentoRepository.filtrar(eq(""), eq(""), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(departamento)));

        Page<DepartamentoResponseDTO> resultado = departamentoService.filtrar("  ", null, pageable);

        assertEquals(1, resultado.getTotalElements());
        assertEquals("TI-01", resultado.getContent().get(0).codigoDepartamento());
        verify(departamentoRepository).filtrar("", "", pageable);
    }

    @Test
    void deveFiltrarRepassandoCriteriosInformados() {
        Pageable pageable = PageRequest.of(0, 10);
        when(departamentoRepository.filtrar("Tec", "TI", pageable)).thenReturn(Page.empty(pageable));

        Page<DepartamentoResponseDTO> resultado = departamentoService.filtrar("Tec", "TI", pageable);

        assertTrue(resultado.isEmpty());
        verify(departamentoRepository).filtrar("Tec", "TI", pageable);
    }
}
