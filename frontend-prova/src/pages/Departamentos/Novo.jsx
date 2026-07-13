import { X, Check, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const FormInput = ({ label, placeholder, value, onChange, maxLength }) => (
  <fieldset className="border border-gray-300 rounded px-2 pb-1.5 pt-0 bg-white focus-within:border-[#3078b4] transition-colors">
    <legend className="text-[12px] text-gray-600 px-1 font-medium">{label}</legend>
    <input 
      type="text" 
      placeholder={placeholder} 
      value={value || ''} 
      onChange={onChange} 
      maxLength={maxLength} 
      className="w-full outline-none text-sm placeholder-gray-300 bg-transparent text-black" 
    />
  </fieldset>
);

export default function NovoDepartamento() {
  const navigate = useNavigate();
  
  const [descricao, setDescricao] = useState('');
  const [codigo, setCodigo] = useState('');
  
  const [salvando, setSalvando] = useState(false);
  
  const [erroMensagem, setErroMensagem] = useState('');

  async function handleSalvar() {
    // 1. Limpa erros antigos
    setErroMensagem(''); 
    
    // 2. Validação do Front
    if (!descricao || !codigo) { 
      setErroMensagem("Preencha a descrição e o código do departamento."); 
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
      return; 
    }

    setSalvando(true);
    try {
      const payload = {
        descricao: descricao,
        codigoDepartamento: codigo 
      };
      
      await api.post('/departamentos', payload);
      navigate('/departamentos'); 
      
    } catch (error) {
      // 3. Captura a mensagem do backend sem usar alert()
      const msgJava = error.response?.data?.message || "Ocorreu um erro ao salvar o departamento.";
      setErroMensagem(msgJava);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto pb-10 flex flex-col relative">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-[#3078b4] mb-1">Cadastro de Departamento</h1>
        <p className="text-gray-500 text-sm">Adicione as informações do novo departamento</p>
      </div>

      {/* Nossa Tarja Vermelha Padronizada */}
      {erroMensagem && (
        <div className="mb-6 flex items-center gap-3 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
          <p className="text-sm font-medium">{erroMensagem}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-[#3078b4] mb-6">Informações Gerais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput 
            label="Descrição do Departamento" 
            placeholder="Ex: Recursos Humanos" 
            value={descricao} 
            onChange={(e) => { setDescricao(e.target.value); setErroMensagem(''); }} 
            maxLength={100} 
          />
          <FormInput 
            label="Código do Departamento" 
            placeholder="Ex: RH-01" 
            value={codigo} 
            onChange={(e) => { setCodigo(e.target.value); setErroMensagem(''); }} 
            maxLength={50} 
          />
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <button 
          onClick={() => navigate('/departamentos')} 
          className="flex items-center gap-2 px-10 py-2 border border-[#3078b4] text-[#3078b4] rounded bg-white hover:bg-blue-50 font-semibold transition-colors text-sm"
        >
          <X size={18} /> Cancelar
        </button>
        <button 
          onClick={handleSalvar} 
          disabled={salvando} 
          className="flex items-center gap-2 px-10 py-2 bg-[#3078b4] text-white rounded hover:bg-[#276496] font-semibold transition-colors text-sm shadow-sm disabled:opacity-70"
        >
          <Check size={18} /> {salvando ? 'Salvando...' : 'Confirmar'}
        </button>
      </div>
    </div>
  );
}