import { X, Save, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';

const FormInput = ({ label, placeholder, value, onChange, maxLength }) => (
  <fieldset className="border border-outline rounded px-2 pb-1.5 pt-0 bg-fundo focus-within:border-azul-base transition-colors">
    <legend className="text-[12px] text-titulo-campo px-1 font-medium">{label}</legend>
    <input 
      type="text" 
      placeholder={placeholder} 
      value={value || ''} 
      onChange={onChange} 
      maxLength={maxLength} 
      className="w-full outline-none text-sm placeholder:text-placeholder bg-transparent text-destaque" 
    />
  </fieldset>
);

export default function EditarCargo() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [descricao, setDescricao] = useState('');
  const [codigo, setCodigo] = useState('');
  
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  
  // Estado para capturar e exibir erros elegantes
  const [erroMensagem, setErroMensagem] = useState('');

  useEffect(() => {
    async function carregarDados() {
      try {
        const response = await api.get(`/cargos/${id}`);
        const cargo = response.data;
        setDescricao(cargo.descricao);
        // Suporta tanto a nomenclatura 'codigoCargo' quanto 'codigo' vinda do backend
        setCodigo(cargo.codigoCargo || cargo.codigo || ''); 
      } catch (error) {
        console.error("Erro ao carregar dados do cargo:", error);
        setErroMensagem("Erro ao carregar os dados do cargo para edição.");
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, [id]);

  async function handleSalvar() {
    setErroMensagem(''); 
    
    if (!descricao || !codigo) { 
      setErroMensagem("Preencha a descrição e o código do cargo."); 
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
      return; 
    }

    setSalvando(true);
    try {
      const payload = {
        descricao: descricao,
        codigoCargo: codigo 
      };
      
      await api.put(`/cargos/${id}`, payload);
      navigate('/cargos'); 
      
    } catch (error) {
      const msgJava = error.response?.data?.message || "Ocorreu um erro ao atualizar o cargo.";
      setErroMensagem(msgJava);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSalvando(false);
    }
  }
  if (carregando) return <div className="p-8 text-center text-corpo">Carregando dados do cargo...</div>;

  return (
    <div className="w-full max-w-4xl mx-auto pb-10 flex flex-col relative">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-azul-base mb-1">Editar Cargo</h1>
        <p className="text-corpo text-sm">Altere as informações deste cargo</p>
      </div>

      {/* Componente visual de Erro (Tarja Vermelha) */}
      {erroMensagem && (
        <div className="mb-6 flex items-center gap-3 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
          <p className="text-sm font-medium">{erroMensagem}</p>
        </div>
      )}

      <div className="bg-fundo rounded-xl border border-outline p-6 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-azul-base mb-6">Informações Gerais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput 
            label="Descrição do Cargo" 
            placeholder="Ex: Desenvolvedor Backend" 
            value={descricao} 
            onChange={(e) => { setDescricao(e.target.value); setErroMensagem(''); }} 
            maxLength={100} 
          />
          <FormInput 
            label="Código do Cargo" 
            placeholder="Ex: DEV-BACK" 
            value={codigo} 
            onChange={(e) => { setCodigo(e.target.value); setErroMensagem(''); }} 
            maxLength={50} 
          />
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <button 
          onClick={() => navigate('/cargos')} 
          className="flex items-center gap-2 px-10 py-2 border border-azul-base text-azul-base rounded bg-fundo hover:bg-azul-leve font-semibold transition-colors text-sm"
        >
          <X size={18} /> Cancelar
        </button>
        <button 
          onClick={handleSalvar} 
          disabled={salvando} 
          className="flex items-center gap-2 px-10 py-2 bg-azul-base text-white rounded hover:bg-azul-hover font-semibold transition-colors text-sm shadow-sm disabled:opacity-70"
        >
          <Save size={18} /> {salvando ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  );
}