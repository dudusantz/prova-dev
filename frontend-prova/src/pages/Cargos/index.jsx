import { Download, Plus, Edit, Search, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { baixarRelatorioPdf } from '../../services/relatorio';
import { Pagination } from '../../components/Pagination';

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
          <h1 className="text-4xl font-bold text-azul-base mb-1">Cargos</h1>
          <p className="text-corpo text-sm">Veja os cargos cadastrados no sistema.</p>
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
            onClick={() => navigate('/cargos/novo')}
            className="flex items-center gap-2 px-4 py-2 bg-azul-base text-white rounded hover:bg-azul-hover font-semibold transition-colors text-sm shadow-sm"
          >
            <Plus size={18} />
            Novo Cargo
          </button>
        </div>
      </div>

      <div className="bg-fundo rounded-xl shadow-[0_2px_10px_-3px_rgba(51,121,188,0.25)] border border-outline p-6">
        
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
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-outline text-corpo rounded hover:bg-fundo-2 font-semibold transition-colors"
          >
            <RotateCcw size={14} />
            Limpar Filtros
          </button>
          <button 
            onClick={() => handleFiltrar(0)}
            className="flex items-center gap-1.5 px-5 py-1.5 text-xs bg-azul-base text-white rounded hover:bg-azul-hover font-semibold transition-colors shadow-sm"
          >
            <Search size={14} />
            Filtrar
          </button>
        </div>

        <div className="border border-outline rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-azul-leve">
              <tr>
                <th className="py-3 px-4 w-20 text-center text-azul-base font-bold text-sm">Editar</th>
                <th className="py-3 px-4 text-azul-base font-bold text-sm">Nome</th>
                <th className="py-3 px-4 text-azul-base font-bold text-sm">Código</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-corpo">
                    Buscando registros no servidor...
                  </td>
                </tr>
              ) : cargos.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-corpo">
                    Nenhum cargo encontrado.
                  </td>
                </tr>
              ) : (
                cargos.map((cargo) => (
                  <tr key={cargo.id} className="border-t border-outline hover:bg-fundo-2 transition-colors">
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => navigate(`/cargos/editar/${cargo.id}`)}
                        className="bg-azul-base p-1.5 rounded text-white hover:bg-azul-hover transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} strokeWidth={2.5} />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-destaque">{cargo.descricao}</td>
                    <td className="py-3 px-4 text-sm font-bold text-destaque">{cargo.codigoCargo || cargo.codigo}</td>
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