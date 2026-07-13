import { Download, Plus, Edit, Search, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select, { components } from 'react-select';
import { api } from '../../services/api';
import { baixarRelatorioPdf } from '../../services/relatorio';

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
    color: 'black',
    fontWeight: '600',
    fontSize: '14px'
  }),
  singleValue: (base) => ({
    ...base,
    color: 'black',
    fontWeight: '600',
    fontSize: '14px'
  }),
  placeholder: (base) => ({
    ...base,
    color: '#d1d5db',
    fontSize: '14px',
    fontWeight: '400'
  }),
  indicatorSeparator: () => ({
    display: 'none'
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: '0px 4px',
    color: '#6b7280',
    cursor: 'pointer',
    '&:hover': { color: '#3078b4' }
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
    backgroundColor: state.isSelected ? '#3078b4' : state.isFocused ? '#eef2f6' : 'white',
    color: state.isSelected ? 'white' : 'black',
    cursor: 'pointer',
    '&:active': { backgroundColor: '#276496' }
  })
};

// Componente de Input de Texto normal
const FilterInput = ({ label, placeholder, value, onChange }) => (
  <fieldset className="border border-gray-300 rounded px-2 pb-1.5 pt-0 bg-white focus-within:border-[#3078b4] transition-colors">
    <legend className="text-[12px] text-gray-600 px-1 font-medium">{label}</legend>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full outline-none text-sm placeholder-gray-300 bg-transparent text-black font-semibold"
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
    <fieldset className="border border-gray-300 rounded px-2 pb-1.5 pt-0 bg-white focus-within:border-[#3078b4] transition-colors min-w-0">
      <legend className="text-[12px] text-gray-600 px-1 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
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
      const resCargos = await api.get('/cargos', { params: { page: 0, size: 1000 } });
      const resDeptos = await api.get('/departamentos', { params: { page: 0, size: 1000 } });
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
          <h1 className="text-4xl font-bold text-[#3078b4] mb-1">Funcionários</h1>
          <p className="text-gray-500 text-sm">Veja os funcionários cadastrados no sistema.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleBaixarRelatorio}
            className="flex items-center gap-2 px-4 py-2 border-2 border-[#3078b4] text-[#3078b4] rounded bg-white hover:bg-blue-50 font-semibold transition-colors text-sm"
          >
            <Download size={18} />
            Baixar Relatório
          </button>
          <button
            onClick={() => navigate('/funcionarios/novo')}
            className="flex items-center gap-2 px-4 py-2 bg-[#3078b4] text-white rounded hover:bg-[#276496] font-semibold transition-colors text-sm shadow-sm"
          >
            <Plus size={18} />
            Novo Funcionário
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.3)] border border-gray-100 p-6">
        
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
          <button onClick={handleLimparFiltros} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 text-gray-500 rounded hover:bg-gray-50 font-semibold transition-colors">
            <RotateCcw size={14} /> Limpar Filtros
          </button>
          <button onClick={() => handleFiltrar(0)} className="flex items-center gap-1.5 px-5 py-1.5 text-xs bg-[#3078b4] text-white rounded hover:bg-[#276496] font-semibold transition-colors shadow-sm">
            <Search size={14} /> Filtrar
          </button>
        </div>

        {/* Tabela de Dados */}
        <div className="border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-[#eef2f6]">
              <tr>
                <th className="py-3 px-4 w-16 text-center text-[#3078b4] font-bold text-sm">Editar</th>
                <th className="py-3 px-4 text-[#3078b4] font-bold text-sm">Nome</th>
                <th className="py-3 px-4 text-[#3078b4] font-bold text-sm">CPF</th>
                <th className="py-3 px-4 text-[#3078b4] font-bold text-sm">Empresa(s)</th>
                <th className="py-3 px-4 text-[#3078b4] font-bold text-sm">Matrícula(s)</th>
                <th className="py-3 px-4 text-[#3078b4] font-bold text-sm">Cargo(s)</th>
                <th className="py-3 px-4 text-[#3078b4] font-bold text-sm">Departamento(s)</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr><td colSpan="7" className="py-8 text-center text-gray-500">Buscando registros no servidor...</td></tr>
              ) : funcionarios.length === 0 ? (
                <tr><td colSpan="7" className="py-8 text-center text-gray-500">Nenhum funcionário atende aos critérios de busca selecionados.</td></tr>
              ) : (
                funcionarios.map((func) => (
                  <tr key={func.id} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => navigate(`/funcionarios/editar/${func.id}`)} className="bg-[#3078b4] p-1.5 rounded text-white hover:bg-[#276496] transition-colors" title="Editar">
                        <Edit size={16} strokeWidth={2.5} />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-black">{func.nome}</td>
                    <td className="py-3 px-4 text-sm font-bold text-black whitespace-nowrap">{func.cpf}</td>
                    
                    <td className="py-3 px-4 text-xs font-medium text-gray-600">
                      {func.vinculos?.length > 0 ? func.vinculos.map(v => v.empresa).join(' / ') : '-'}
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-gray-600">
                      {func.vinculos?.length > 0 ? func.vinculos.map(v => v.matricula).join(' / ') : '-'}
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-gray-600">
                      {func.vinculos?.length > 0 ? func.vinculos.map(v => {
                        const cargo = cargosDb.find(c => c.codigoCargo === v.codigoCargo || c.id === v.cargoId);
                        return cargo ? cargo.descricao : v.descricaoCargo || 'N/D';
                      }).join(' / ') : '-'}
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-gray-600">
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

        {totalPaginas > 1 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-500 font-medium">
              A visualizar página {pagina + 1} de {totalPaginas}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleFiltrar(pagina - 1)}
                disabled={pagina === 0}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                Anterior
              </button>
              <button
                onClick={() => handleFiltrar(pagina + 1)}
                disabled={pagina >= totalPaginas - 1}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                Próxima
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}