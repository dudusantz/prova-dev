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
import prova_dev.dto.FuncionarioRequestDTO;
import prova_dev.dto.FuncionarioResponseDTO;
import prova_dev.dto.VinculoRequestDTO;
import prova_dev.exception.RegraNegocioException;
import prova_dev.model.Cargo;
import prova_dev.model.Departamento;
import prova_dev.model.Funcionario;
import prova_dev.repository.CargoRepository;
import prova_dev.repository.DepartamentoRepository;
import prova_dev.repository.FuncionarioRepository;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FuncionarioServiceTest {

    @Mock
    private FuncionarioRepository funcionarioRepository;

    @Mock
    private CargoRepository cargoRepository;

    @Mock
    private DepartamentoRepository departamentoRepository;

    @InjectMocks
    private FuncionarioService funcionarioService;

    @Test
    void deveRecusarCadastroQuandoCpfDuplicado() {
        when(funcionarioRepository.existsByCpf("529.982.247-25")).thenReturn(true);

        FuncionarioRequestDTO dto = new FuncionarioRequestDTO(
                "Ana Silva",
                "529.982.247-25",
                List.of(new VinculoRequestDTO("Empresa X", "MAT-001", 1L, 1L))
        );

        RegraNegocioException ex = assertThrows(RegraNegocioException.class, () -> funcionarioService.salvar(dto));
        assertEquals("Este CPF já está cadastrado no sistema.", ex.getMessage());
        verify(funcionarioRepository, never()).save(any());
    }

    @Test
    void deveCadastrarFuncionarioComMultiplosVinculos() {
        when(funcionarioRepository.existsByCpf("529.982.247-25")).thenReturn(false);
        when(funcionarioRepository.existeMatriculaNaEmpresa(anyString(), anyString())).thenReturn(false);

        Cargo cargo1 = cargo(1L, "DEV", "Desenvolvedor");
        Cargo cargo2 = cargo(2L, "QA", "Analista QA");
        Departamento depto1 = departamento(10L, "TI", "Tecnologia");
        Departamento depto2 = departamento(20L, "RH", "Recursos Humanos");

        when(cargoRepository.findById(1L)).thenReturn(Optional.of(cargo1));
        when(cargoRepository.findById(2L)).thenReturn(Optional.of(cargo2));
        when(departamentoRepository.findById(10L)).thenReturn(Optional.of(depto1));
        when(departamentoRepository.findById(20L)).thenReturn(Optional.of(depto2));
        when(funcionarioRepository.save(any(Funcionario.class))).thenAnswer(inv -> inv.getArgument(0));

        FuncionarioRequestDTO dto = new FuncionarioRequestDTO(
                "Ana Silva",
                "529.982.247-25",
                List.of(
                        new VinculoRequestDTO("Empresa A", "MAT-001", 1L, 10L),
                        new VinculoRequestDTO("Empresa B", "MAT-002", 2L, 20L)
                )
        );

        assertDoesNotThrow(() -> funcionarioService.salvar(dto));

        ArgumentCaptor<Funcionario> captor = ArgumentCaptor.forClass(Funcionario.class);
        verify(funcionarioRepository).save(captor.capture());

        Funcionario salvo = captor.getValue();
        assertEquals("Ana Silva", salvo.getNome());
        assertEquals("529.982.247-25", salvo.getCpf());
        assertEquals(2, salvo.getVinculos().size());
        assertEquals("Empresa A", salvo.getVinculos().get(0).getEmpresa());
        assertEquals("MAT-002", salvo.getVinculos().get(1).getMatricula());
    }

    @Test
    void deveRecusarCadastroQuandoCargoNaoExiste() {
        when(funcionarioRepository.existsByCpf(anyString())).thenReturn(false);
        when(funcionarioRepository.existeMatriculaNaEmpresa(anyString(), anyString())).thenReturn(false);
        when(cargoRepository.findById(99L)).thenReturn(Optional.empty());

        FuncionarioRequestDTO dto = new FuncionarioRequestDTO(
                "Ana Silva",
                "529.982.247-25",
                List.of(new VinculoRequestDTO("Empresa X", "MAT-001", 99L, 1L))
        );

        RegraNegocioException ex = assertThrows(RegraNegocioException.class, () -> funcionarioService.salvar(dto));
        assertTrue(ex.getMessage().contains("Cargo não encontrado"));
        verify(funcionarioRepository, never()).save(any());
    }

    @Test
    void deveRecusarCadastroQuandoDepartamentoNaoExiste() {
        when(funcionarioRepository.existsByCpf(anyString())).thenReturn(false);
        when(funcionarioRepository.existeMatriculaNaEmpresa(anyString(), anyString())).thenReturn(false);
        when(cargoRepository.findById(1L)).thenReturn(Optional.of(cargo(1L, "DEV", "Desenvolvedor")));
        when(departamentoRepository.findById(99L)).thenReturn(Optional.empty());

        FuncionarioRequestDTO dto = new FuncionarioRequestDTO(
                "Ana Silva",
                "529.982.247-25",
                List.of(new VinculoRequestDTO("Empresa X", "MAT-001", 1L, 99L))
        );

        RegraNegocioException ex = assertThrows(RegraNegocioException.class, () -> funcionarioService.salvar(dto));
        assertTrue(ex.getMessage().contains("Departamento não encontrado"));
    }

    @Test
    void deveRecusarCadastroQuandoMatriculaJaExisteNaEmpresa() {
        when(funcionarioRepository.existsByCpf(anyString())).thenReturn(false);
        when(funcionarioRepository.existeMatriculaNaEmpresa("MAT-001", "Empresa X")).thenReturn(true);

        FuncionarioRequestDTO dto = new FuncionarioRequestDTO(
                "Ana Silva",
                "529.982.247-25",
                List.of(new VinculoRequestDTO("Empresa X", "MAT-001", 1L, 1L))
        );

        RegraNegocioException ex = assertThrows(RegraNegocioException.class, () -> funcionarioService.salvar(dto));
        assertTrue(ex.getMessage().contains("já está cadastrada"));
        verify(funcionarioRepository, never()).save(any());
    }

    @Test
    void deveAtualizarVinculosDoFuncionario() {
        Funcionario existente = new Funcionario();
        existente.setId(5L);
        existente.setNome("Nome Antigo");
        existente.setCpf("529.982.247-25");

        when(funcionarioRepository.findById(5L)).thenReturn(Optional.of(existente));
        when(funcionarioRepository.existeMatriculaNaEmpresaEmOutroFuncionario(anyString(), anyString(), eq(5L)))
                .thenReturn(false);
        when(cargoRepository.findById(1L)).thenReturn(Optional.of(cargo(1L, "DEV", "Desenvolvedor")));
        when(departamentoRepository.findById(10L)).thenReturn(Optional.of(departamento(10L, "TI", "Tecnologia")));
        when(funcionarioRepository.save(any(Funcionario.class))).thenAnswer(inv -> inv.getArgument(0));

        FuncionarioRequestDTO dto = new FuncionarioRequestDTO(
                "Nome Novo",
                "529.982.247-25",
                List.of(new VinculoRequestDTO("Empresa Nova", "MAT-999", 1L, 10L))
        );

        assertDoesNotThrow(() -> funcionarioService.atualizar(5L, dto));

        ArgumentCaptor<Funcionario> captor = ArgumentCaptor.forClass(Funcionario.class);
        verify(funcionarioRepository).save(captor.capture());

        Funcionario atualizado = captor.getValue();
        assertEquals("Nome Novo", atualizado.getNome());
        assertEquals(1, atualizado.getVinculos().size());
        assertEquals("Empresa Nova", atualizado.getVinculos().get(0).getEmpresa());
        assertEquals("MAT-999", atualizado.getVinculos().get(0).getMatricula());
    }

    @Test
    void deveRecusarAtualizacaoQuandoCpfPertenceAOutroFuncionario() {
        Funcionario existente = new Funcionario();
        existente.setId(5L);
        existente.setNome("Ana");
        existente.setCpf("529.982.247-25");

        when(funcionarioRepository.findById(5L)).thenReturn(Optional.of(existente));
        when(funcionarioRepository.existsByCpf("390.533.447-05")).thenReturn(true);

        FuncionarioRequestDTO dto = new FuncionarioRequestDTO(
                "Ana",
                "390.533.447-05",
                List.of(new VinculoRequestDTO("Empresa X", "MAT-001", 1L, 1L))
        );

        RegraNegocioException ex = assertThrows(RegraNegocioException.class, () -> funcionarioService.atualizar(5L, dto));
        assertEquals("Este CPF já está cadastrado para outro funcionário.", ex.getMessage());
        verify(funcionarioRepository, never()).save(any());
    }

    @Test
    void deveFiltrarNormalizandoParametrosVaziosENulos() {
        Pageable pageable = PageRequest.of(0, 10);
        Funcionario funcionario = new Funcionario();
        funcionario.setId(1L);
        funcionario.setNome("Ana");
        funcionario.setCpf("529.982.247-25");

        when(funcionarioRepository.filtrar(eq(""), eq(""), eq(""), eq(""), eq(0L), eq(0L), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(funcionario)));

        Page<FuncionarioResponseDTO> resultado = funcionarioService.filtrar(null, "  ", null, "", null, null, pageable);

        assertEquals(1, resultado.getTotalElements());
        assertEquals("Ana", resultado.getContent().get(0).nome());
        verify(funcionarioRepository).filtrar("", "", "", "", 0L, 0L, pageable);
    }

    @Test
    void deveFiltrarRepassandoCriteriosInformados() {
        Pageable pageable = PageRequest.of(1, 10);
        when(funcionarioRepository.filtrar("Ana", "529.982.247-25", "MAT-1", "Empresa", 3L, 7L, pageable))
                .thenReturn(Page.empty(pageable));

        Page<FuncionarioResponseDTO> resultado = funcionarioService.filtrar(
                "Ana", "529.982.247-25", "MAT-1", "Empresa", 3L, 7L, pageable
        );

        assertTrue(resultado.isEmpty());
        verify(funcionarioRepository).filtrar("Ana", "529.982.247-25", "MAT-1", "Empresa", 3L, 7L, pageable);
    }

    private static Cargo cargo(Long id, String codigo, String descricao) {
        Cargo cargo = new Cargo();
        cargo.setId(id);
        cargo.setCodigoCargo(codigo);
        cargo.setDescricao(descricao);
        return cargo;
    }

    private static Departamento departamento(Long id, String codigo, String descricao) {
        Departamento departamento = new Departamento();
        departamento.setId(id);
        departamento.setCodigoDepartamento(codigo);
        departamento.setDescricao(descricao);
        return departamento;
    }
}
