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
import prova_dev.dto.CargoRequestDTO;
import prova_dev.dto.CargoResponseDTO;
import prova_dev.exception.RegraNegocioException;
import prova_dev.model.Cargo;
import prova_dev.repository.CargoRepository;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CargoServiceTest {

    @Mock
    private CargoRepository cargoRepository;

    @InjectMocks
    private CargoService cargoService;

    @Test
    void deveCadastrarCargoQuandoCodigoDisponivel() {
        when(cargoRepository.existeCodigoIgual("DEV-01")).thenReturn(false);
        when(cargoRepository.save(any(Cargo.class))).thenAnswer(inv -> {
            Cargo cargo = inv.getArgument(0);
            cargo.setId(1L);
            return cargo;
        });

        CargoResponseDTO response = cargoService.salvar(new CargoRequestDTO("DEV-01", "Desenvolvedor", null));

        assertEquals(1L, response.id());
        assertEquals("DEV-01", response.codigoCargo());
        assertEquals("Desenvolvedor", response.descricao());
        assertTrue(response.ativo());

        ArgumentCaptor<Cargo> captor = ArgumentCaptor.forClass(Cargo.class);
        verify(cargoRepository).save(captor.capture());
        assertEquals("DEV-01", captor.getValue().getCodigoCargo());
        assertTrue(captor.getValue().getAtivo());
    }

    @Test
    void deveRecusarCadastroQuandoCodigoDuplicado() {
        when(cargoRepository.existeCodigoIgual("DEV-01")).thenReturn(true);

        RegraNegocioException ex = assertThrows(
                RegraNegocioException.class,
                () -> cargoService.salvar(new CargoRequestDTO("DEV-01", "Desenvolvedor", null))
        );

        assertTrue(ex.getMessage().contains("Já existe um cargo cadastrado com o código"));
        verify(cargoRepository, never()).save(any());
    }

    @Test
    void deveAtualizarCargoQuandoCodigoNaoConflita() {
        Cargo existente = new Cargo();
        existente.setId(1L);
        existente.setCodigoCargo("DEV-01");
        existente.setDescricao("Antigo");
        existente.setAtivo(true);

        when(cargoRepository.findById(1L)).thenReturn(Optional.of(existente));
        when(cargoRepository.existeCodigoIgualEmOutroCargo("DEV-02", 1L)).thenReturn(false);
        when(cargoRepository.save(any(Cargo.class))).thenAnswer(inv -> inv.getArgument(0));

        CargoResponseDTO response = cargoService.atualizar(1L, new CargoRequestDTO("DEV-02", "Novo", null));

        assertEquals("DEV-02", response.codigoCargo());
        assertEquals("Novo", response.descricao());
        assertTrue(response.ativo());
    }

    @Test
    void deveInativarCargoNaEdicao() {
        Cargo existente = new Cargo();
        existente.setId(1L);
        existente.setCodigoCargo("DEV-01");
        existente.setDescricao("Desenvolvedor");
        existente.setAtivo(true);

        when(cargoRepository.findById(1L)).thenReturn(Optional.of(existente));
        when(cargoRepository.existeCodigoIgualEmOutroCargo("DEV-01", 1L)).thenReturn(false);
        when(cargoRepository.save(any(Cargo.class))).thenAnswer(inv -> inv.getArgument(0));

        CargoResponseDTO response = cargoService.atualizar(
                1L,
                new CargoRequestDTO("DEV-01", "Desenvolvedor", false)
        );

        assertFalse(response.ativo());
    }

    @Test
    void deveAtivarCargoNaEdicao() {
        Cargo existente = new Cargo();
        existente.setId(1L);
        existente.setCodigoCargo("DEV-01");
        existente.setDescricao("Desenvolvedor");
        existente.setAtivo(false);

        when(cargoRepository.findById(1L)).thenReturn(Optional.of(existente));
        when(cargoRepository.existeCodigoIgualEmOutroCargo("DEV-01", 1L)).thenReturn(false);
        when(cargoRepository.save(any(Cargo.class))).thenAnswer(inv -> inv.getArgument(0));

        CargoResponseDTO response = cargoService.atualizar(
                1L,
                new CargoRequestDTO("DEV-01", "Desenvolvedor", true)
        );

        assertTrue(response.ativo());
    }

    @Test
    void deveRecusarAtualizacaoQuandoCodigoUsadoPorOutroCargo() {
        Cargo existente = new Cargo();
        existente.setId(1L);
        existente.setCodigoCargo("DEV-01");
        existente.setDescricao("Antigo");

        when(cargoRepository.findById(1L)).thenReturn(Optional.of(existente));
        when(cargoRepository.existeCodigoIgualEmOutroCargo("QA-01", 1L)).thenReturn(true);

        RegraNegocioException ex = assertThrows(
                RegraNegocioException.class,
                () -> cargoService.atualizar(1L, new CargoRequestDTO("QA-01", "QA", null))
        );

        assertTrue(ex.getMessage().contains("já está sendo usado por outro cargo"));
        verify(cargoRepository, never()).save(any());
    }

    @Test
    void deveFiltrarNormalizandoParametrosVazios() {
        Pageable pageable = PageRequest.of(0, 10);
        Cargo cargo = new Cargo();
        cargo.setId(1L);
        cargo.setCodigoCargo("DEV-01");
        cargo.setDescricao("Desenvolvedor");
        cargo.setAtivo(true);

        when(cargoRepository.filtrar(eq(""), eq(""), eq(true), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(cargo)));

        Page<CargoResponseDTO> resultado = cargoService.filtrar(null, "  ", true, pageable);

        assertEquals(1, resultado.getTotalElements());
        assertEquals("DEV-01", resultado.getContent().get(0).codigoCargo());
        verify(cargoRepository).filtrar("", "", true, pageable);
    }

    @Test
    void deveFiltrarRepassandoCriteriosInformados() {
        Pageable pageable = PageRequest.of(0, 10);
        when(cargoRepository.filtrar("Dev", "DEV", null, pageable)).thenReturn(Page.empty(pageable));

        Page<CargoResponseDTO> resultado = cargoService.filtrar("Dev", "DEV", null, pageable);

        assertTrue(resultado.isEmpty());
        verify(cargoRepository).filtrar("Dev", "DEV", null, pageable);
    }
}
