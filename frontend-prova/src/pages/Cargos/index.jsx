import { Download, Plus, Edit, Search, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { baixarRelatorioPdf } from '../../services/relatorio';

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

export default function Cargos() {
  const navigate = useNavigate();
  const [cargos, setCargos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [filtroDescricao, setFiltroDescricao] = useState('');
  const [filtroCodigo, setFiltroCodigo] = useState('');

  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  useEffect(() => {
    handleFiltrar(0);
  }, []);

  async function handleFiltrar(pageIndex = 0) {
    setCarregando(true);
    try {
      const response = await api.get('/cargos', {
        params: {
          descricao: filtroDescricao,
          codigo: filtroCodigo,
          page: pageIndex,
          size: 10
        }
      });
      setCargos(response.data.content);
      setTotalPaginas(response.data.totalPages);
      setPagina(pageIndex);
    } catch (error) {
      console.error("Erro ao filtrar cargos:", error);
    } finally {
      setCarregando(false);
    }
  }

  function handleLimparFiltros() {
    setFiltroDescricao('');
    setFiltroCodigo('');
    handleFiltrar(0);
  }

  async function handleBaixarRelatorio() {
    try {
      await baixarRelatorioPdf(
        '/cargos/relatorio',
        {
          descricao: filtroDescricao,
          codigo: filtroCodigo,
        },
        'relatorio-cargos.pdf'
      );
    } catch (error) {
      alert(error.message || 'Não foi possível gerar o relatório.');
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-4xl font-bold text-[#3078b4] mb-1">Cargos</h1>
          <p className="text-gray-500 text-sm">Veja os cargos cadastrados no sistema.</p>
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
            onClick={() => navigate('/cargos/novo')}
            className="flex items-center gap-2 px-4 py-2 bg-[#3078b4] text-white rounded hover:bg-[#276496] font-semibold transition-colors text-sm shadow-sm"
          >
            <Plus size={18} />
            Novo Cargo
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.3)] border border-gray-100 p-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 items-end">
          <FilterInput
            label="Descrição do Cargo"
            placeholder="Procure pelo nome do cargo"
            value={filtroDescricao}
            onChange={(e) => setFiltroDescricao(e.target.value)}
          />
          <FilterInput
            label="Código"
            placeholder="Procure pelo código do cargo"
            value={filtroCodigo}
            onChange={(e) => setFiltroCodigo(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 mb-6">
          <button 
            onClick={handleLimparFiltros}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 text-gray-500 rounded hover:bg-gray-50 font-semibold transition-colors"
          >
            <RotateCcw size={14} />
            Limpar Filtros
          </button>
          <button 
            onClick={() => handleFiltrar(0)}
            className="flex items-center gap-1.5 px-5 py-1.5 text-xs bg-[#3078b4] text-white rounded hover:bg-[#276496] font-semibold transition-colors shadow-sm"
          >
            <Search size={14} />
            Filtrar
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#eef2f6]">
              <tr>
                <th className="py-3 px-4 w-20 text-center text-[#3078b4] font-bold text-sm">Editar</th>
                <th className="py-3 px-4 text-[#3078b4] font-bold text-sm">Nome</th>
                <th className="py-3 px-4 text-[#3078b4] font-bold text-sm">Código</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-gray-500">
                    Buscando registros no servidor...
                  </td>
                </tr>
              ) : cargos.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-gray-500">
                    Nenhum cargo encontrado.
                  </td>
                </tr>
              ) : (
                cargos.map((cargo) => (
                  <tr key={cargo.id} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => navigate(`/cargos/editar/${cargo.id}`)}
                        className="bg-[#3078b4] p-1.5 rounded text-white hover:bg-[#276496] transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} strokeWidth={2.5} />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-black">{cargo.descricao}</td>
                    <td className="py-3 px-4 text-sm font-bold text-black">{cargo.codigoCargo || cargo.codigo}</td>
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