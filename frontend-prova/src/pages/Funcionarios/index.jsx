import { Download, Plus, Edit, Search, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select, { components } from 'react-select';
import { api } from '../../services/api';
import { baixarRelatorioPdf } from '../../services/relatorio';
import { Pagination } from '../../components/Pagination';
import { colors } from '../../theme/colors';

const selectStyles = {
  control: (base) => ({
    ...base,
    border: 'none',
    boxShadow: 'none',
    backgroundColor: 'transparent',
    minHeight: 'auto',
    cursor: 'text'
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0px',
  }),
  input: (base) => ({
    ...base,
    margin: '0px',
    padding: '0px',
    color: colors.destaque,
    fontWeight: '600',
    fontSize: '14px'
  }),
  singleValue: (base) => ({
    ...base,
    color: colors.destaque,
    fontWeight: '600',
    fontSize: '14px'
  }),
  placeholder: (base) => ({
    ...base,
    color: colors.placeholder,
    fontSize: '14px',
    fontWeight: '400'
  }),
  indicatorSeparator: () => ({
    display: 'none'
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: '0px 4px',
    color: colors.corpoTexto,
    cursor: 'pointer',
    '&:hover': { color: colors.azulBase }
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: '0px 4px',
    color: '#ef4444',
    cursor: 'pointer',
    '&:hover': { color: '#b91c1c' }
  }),
  option: (base, state) => ({
    ...base,
    fontSize: '14px',
    backgroundColor: state.isSelected ? colors.azulBase : state.isFocused ? colors.azulLeve : colors.background,
    color: state.isSelected ? colors.background : colors.destaque,
    cursor: 'pointer',
    '&:active': { backgroundColor: colors.azulHover }
  })
};

// Componente de Input de Texto normal
const FilterInput = ({ label, placeholder, value, onChange }) => (
  <fieldset className="border border-outline rounded px-2 pb-1.5 pt-0 bg-fundo focus-within:border-azul-base transition-colors">
    <legend className="text-[12px] text-titulo-campo px-1 font-medium">{label}</legend>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full outline-none text-sm placeholder:text-placeholder bg-transparent text-destaque font-semibold"
    />
  </fieldset>
);

// Interceptador de Input para blindar contra textos gigantes
const CustomInput = (props) => (
  <components.Input {...props} maxLength={40} />
);

const FilterSelect = ({ label, placeholder, options, value, onChange }) => {
  const selectedOption = options.find(opt => opt.value === value) || null;

  return (
    <fieldset className="border border-outline rounded px-2 pb-1.5 pt-0 bg-fundo focus-within:border-azul-base transition-colors min-w-0">
      <legend className="text-[12px] text-titulo-campo px-1 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
        {label}
      </legend>
      <Select
        options={options}
        value={selectedOption}
        onChange={(selected) => onChange(selected ? selected.value : '')}
        placeholder={placeholder}
        styles={selectStyles}
        isClearable={true}
        noOptionsMessage={() => "Nenhum registro encontrado"}
        components={{ Input: CustomInput }}
      />
    </fieldset>
  );
};

export default function Funcionarios() {
  const navigate = useNavigate();
  const [funcionarios, setFuncionarios] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Estados dos filtros
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroCpf, setFiltroCpf] = useState('');
  const [filtroMatricula, setFiltroMatricula] = useState('');
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [filtroCargo, setFiltroCargo] = useState('');
  const [filtroDepartamento, setFiltroDepartamento] = useState('');

  // Novos estados para o motor de paginação
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  // Listas para os Dropdowns
  const [cargosDb, setCargosDb] = useState([]);
  const [departamentosDb, setDepartamentosDb] = useState([]);

  useEffect(() => {
    handleFiltrar(0); // Força a busca da primeira página ao entrar no ecrã
    carregarListasAuxiliares();
  }, []);

  async function carregarListasAuxiliares() {
    try {
      const resCargos = await api.get('/cargos', { params: { page: 0, size: 1000, ativo: true } });
      const resDeptos = await api.get('/departamentos', { params: { page: 0, size: 1000, ativo: true } });
      setCargosDb(resCargos.data.content || resCargos.data);
      setDepartamentosDb(resDeptos.data.content || resDeptos.data);
    } catch (error) {
      console.error("Erro ao carregar listas:", error);
    }
  }

  // A função única e mestre que controla Busca e Paginação simultaneamente
  async function handleFiltrar(pageIndex = 0) {
    setCarregando(true);
    try {
      const response = await api.get('/funcionarios', {
        params: {
          nome: filtroNome,
          cpf: filtroCpf,
          matricula: filtroMatricula,
          empresa: filtroEmpresa,
          cargoId: filtroCargo,
          departamentoId: filtroDepartamento,
          page: pageIndex,
          size: 10 // Registos por página
        }
      });
      setFuncionarios(response.data.content); // A lista real agora vem dentro de "content"
      setTotalPaginas(response.data.totalPages);
      setPagina(pageIndex);
    } catch (error) {
      console.error("Erro ao filtrar funcionários:", error);
    } finally {
      setCarregando(false);
    }
  }

  function handleLimparFiltros() {
    setFiltroNome('');
    setFiltroCpf('');
    setFiltroMatricula('');
    setFiltroEmpresa('');
    setFiltroCargo('');
    setFiltroDepartamento('');
    handleFiltrar(0); // Reseta a busca limpando tudo
  }

  // Relatório PDF gerado no backend com TODOS os registos do filtro actual
  async function handleBaixarRelatorio() {
    try {
      await baixarRelatorioPdf(
        '/funcionarios/relatorio',
        {
          nome: filtroNome,
          cpf: filtroCpf,
          matricula: filtroMatricula,
          empresa: filtroEmpresa,
          cargoId: filtroCargo || undefined,
          departamentoId: filtroDepartamento || undefined,
        },
        'relatorio-funcionarios.pdf'
      );
    } catch (error) {
      alert(error.message || 'Não foi possível gerar o relatório.');
    }
  }

  const opcoesCargos = cargosDb.map(c => ({ value: c.id, label: c.descricao }));
  const opcoesDepartamentos = departamentosDb.map(d => ({ value: d.id, label: d.descricao }));

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-4xl font-bold text-azul-base mb-1">Funcionários</h1>
          <p className="text-corpo text-sm">Veja os funcionários cadastrados no sistema.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleBaixarRelatorio}
            className="flex items-center gap-2 px-4 py-2 border-2 border-azul-base text-azul-base rounded bg-fundo hover:bg-azul-leve font-semibold transition-colors text-sm"
          >
            <Download size={18} />
            Baixar Relatório
          </button>
          <button
            onClick={() => navigate('/funcionarios/novo')}
            className="flex items-center gap-2 px-4 py-2 bg-azul-base text-white rounded hover:bg-azul-hover font-semibold transition-colors text-sm shadow-sm"
          >
            <Plus size={18} />
            Novo Funcionário
          </button>
        </div>
      </div>

      <div className="bg-fundo rounded-xl shadow-[0_2px_10px_-3px_rgba(51,121,188,0.25)] border border-outline p-6">
        
        {/* Área de Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 items-end">
          <div className="lg:col-span-2">
            <FilterInput label="Nome do Funcionário" placeholder="Procure pelo funcionário" value={filtroNome} onChange={(e) => setFiltroNome(e.target.value)} />
          </div>
          <FilterInput label="CPF" placeholder="000.000.000-00" value={filtroCpf} onChange={(e) => setFiltroCpf(e.target.value)} />
          <FilterInput label="Matrícula" placeholder="0000000000" value={filtroMatricula} onChange={(e) => setFiltroMatricula(e.target.value)} />
          <FilterInput label="Empresa" placeholder="Procure pela empresa" value={filtroEmpresa} onChange={(e) => setFiltroEmpresa(e.target.value)} />
          
          <FilterSelect 
            label="Cargo" 
            placeholder="Todos os Cargos" 
            options={opcoesCargos} 
            value={filtroCargo} 
            onChange={setFiltroCargo} 
          />
          <FilterSelect 
            label="Departamento" 
            placeholder="Todos os Deptos" 
            options={opcoesDepartamentos} 
            value={filtroDepartamento} 
            onChange={setFiltroDepartamento} 
          />
        </div>

        {/* Botões de Ação do Filtro */}
        <div className="flex justify-end gap-3 mb-6">
          <button onClick={handleLimparFiltros} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-outline text-corpo rounded hover:bg-fundo-2 font-semibold transition-colors">
            <RotateCcw size={14} /> Limpar Filtros
          </button>
          <button onClick={() => handleFiltrar(0)} className="flex items-center gap-1.5 px-5 py-1.5 text-xs bg-azul-base text-white rounded hover:bg-azul-hover font-semibold transition-colors shadow-sm">
            <Search size={14} /> Filtrar
          </button>
        </div>

        {/* Tabela de Dados */}
        <div className="border border-outline rounded-lg overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-azul-leve">
              <tr>
                <th className="py-3 px-4 w-16 text-center text-azul-base font-bold text-sm">Editar</th>
                <th className="py-3 px-4 text-azul-base font-bold text-sm">Nome</th>
                <th className="py-3 px-4 text-azul-base font-bold text-sm">CPF</th>
                <th className="py-3 px-4 text-azul-base font-bold text-sm">Empresa(s)</th>
                <th className="py-3 px-4 text-azul-base font-bold text-sm">Matrícula(s)</th>
                <th className="py-3 px-4 text-azul-base font-bold text-sm">Cargo(s)</th>
                <th className="py-3 px-4 text-azul-base font-bold text-sm">Departamento(s)</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr><td colSpan="7" className="py-8 text-center text-corpo">Buscando registros no servidor...</td></tr>
              ) : funcionarios.length === 0 ? (
                <tr><td colSpan="7" className="py-8 text-center text-corpo">Nenhum funcionário atende aos critérios de busca selecionados.</td></tr>
              ) : (
                funcionarios.map((func) => (
                  <tr key={func.id} className="border-t border-outline hover:bg-fundo-2 transition-colors">
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => navigate(`/funcionarios/editar/${func.id}`)} className="bg-azul-base p-1.5 rounded text-white hover:bg-azul-hover transition-colors" title="Editar">
                        <Edit size={16} strokeWidth={2.5} />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-destaque">{func.nome}</td>
                    <td className="py-3 px-4 text-sm font-bold text-destaque whitespace-nowrap">{func.cpf}</td>
                    
                    <td className="py-3 px-4 text-xs font-medium text-titulo-campo">
                      {func.vinculos?.length > 0 ? func.vinculos.map(v => v.empresa).join(' / ') : '-'}
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-titulo-campo">
                      {func.vinculos?.length > 0 ? func.vinculos.map(v => v.matricula).join(' / ') : '-'}
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-titulo-campo">
                      {func.vinculos?.length > 0 ? func.vinculos.map(v => {
                        const cargo = cargosDb.find(c => c.codigoCargo === v.codigoCargo || c.id === v.cargoId);
                        return cargo ? cargo.descricao : v.descricaoCargo || 'N/D';
                      }).join(' / ') : '-'}
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-titulo-campo">
                      {func.vinculos?.length > 0 ? func.vinculos.map(v => {
                        const depto = departamentosDb.find(d => d.codigoDepartamento === v.codigoDepartamento || d.id === v.departamentoId);
                        return depto ? depto.descricao : v.descricaoDepartamento || 'N/D';
                      }).join(' / ') : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          pagina={pagina}
          totalPaginas={totalPaginas}
          onChange={handleFiltrar}
        />

      </div>
    </div>
  );
}