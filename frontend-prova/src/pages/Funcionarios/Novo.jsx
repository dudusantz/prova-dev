import { X, Check, Plus, Trash2, Edit, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { SearchableSelect } from '../../components/SearchableSelect';

const FormInput = ({ label, placeholder, value, onChange, maxLength }) => (
  <fieldset className="border border-outline rounded px-2 pb-1.5 pt-0 bg-fundo focus-within:border-azul-base transition-colors">
    <legend className="text-[12px] text-titulo-campo px-1 font-medium">{label}</legend>
    <input 
      type="text" 
      placeholder={placeholder} 
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      className="w-full outline-none text-sm placeholder:text-placeholder bg-transparent text-destaque" 
    />
  </fieldset>
);

export default function NovoFuncionario() {
  const navigate = useNavigate();
  
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [vinculos, setVinculos] = useState([]); 
  
  const [cargosDb, setCargosDb] = useState([]);
  const [departamentosDb, setDepartamentosDb] = useState([]);
  
  const [salvando, setSalvando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [erroMensagem, setErroMensagem] = useState('');
  
  // Controle de Edição em Memória idêntico ao do Editar.jsx
  const [vinculoEditandoIndex, setVinculoEditandoIndex] = useState(null);
  
  const [novaEmpresa, setNovaEmpresa] = useState('');
  const [novaMatricula, setNovaMatricula] = useState('');
  const [cargoSelecionado, setCargoSelecionado] = useState('');
  const [departamentoSelecionado, setDepartamentoSelecionado] = useState('');

  useEffect(() => {
    async function carregarDependencias() {
      try {
        const [resCargos, resDeptos] = await Promise.all([
          api.get('/cargos', { params: { page: 0, size: 1000, ativo: true } }),
          api.get('/departamentos', { params: { page: 0, size: 1000, ativo: true } })
        ]);
        setCargosDb(resCargos.data.content || resCargos.data);
        setDepartamentosDb(resDeptos.data.content || resDeptos.data);
      } catch (error) {
        console.error("Erro ao carregar dependências:", error);
      }
    }
    carregarDependencias();
  }, []);

  const handleCpfChange = (e) => {
    let valor = e.target.value.replace(/\D/g, ""); 
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2"); 
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2"); 
    valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2"); 
    setCpf(valor);
    setErroMensagem(''); 
  };

  function abrirModalNovo() {
    setVinculoEditandoIndex(null);
    setNovaEmpresa(''); setNovaMatricula(''); setCargoSelecionado(''); setDepartamentoSelecionado('');
    setModalAberto(true);
  }

  function abrirModalEdicao(index) {
    const v = vinculos[index];
    setVinculoEditandoIndex(index);
    setNovaEmpresa(v.empresa);
    setNovaMatricula(v.matricula);
    setCargoSelecionado(v.cargoId.toString());
    setDepartamentoSelecionado(v.departamentoId.toString());
    setModalAberto(true);
  }

  function salvarVinculoNoModal() {
    if (!novaEmpresa || !novaMatricula || !cargoSelecionado || !departamentoSelecionado) {
      setErroMensagem("Preencha todos os campos do vínculo."); 
      return;
    }

    const matriculaJaExiste = vinculos.some((v, index) =>
      v.matricula === novaMatricula && index !== vinculoEditandoIndex
    );

    if (matriculaJaExiste) {
      setErroMensagem("Esta matrícula já foi adicionada na lista de empresas.");
      return;
    }

    const cargoObj = cargosDb.find(c => c.id.toString() === cargoSelecionado);
    const deptoObj = departamentosDb.find(d => d.id.toString() === departamentoSelecionado);

    const vinculoAtualizado = {
      empresa: novaEmpresa,
      matricula: novaMatricula,
      cargoId: Number(cargoSelecionado),
      departamentoId: Number(departamentoSelecionado),
      cargoDescricao: cargoObj?.descricao,
      departamentoDescricao: deptoObj?.descricao
    };

    if (vinculoEditandoIndex !== null) {
      const novaLista = [...vinculos];
      novaLista[vinculoEditandoIndex] = vinculoAtualizado;
      setVinculos(novaLista);
    } else {
      setVinculos([...vinculos, vinculoAtualizado]);
    }

    setModalAberto(false);
    setErroMensagem('');
  }

  function removerVinculo(index) {
    const novaLista = vinculos.filter((_, i) => i !== index);
    setVinculos(novaLista);
  }

  async function handleSalvar() {
    setErroMensagem(''); 
    if (!nome || !cpf) { setErroMensagem("Preencha o Nome e o CPF do funcionário."); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (cpf.length < 14) { setErroMensagem("O CPF deve estar completo (11 dígitos)."); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (vinculos.length === 0) { setErroMensagem("O funcionário precisa ter pelo menos um vínculo de empresa associado."); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }

    setSalvando(true);
    try {
      const payload = {
        nome: nome,
        cpf: cpf,
        vinculos: vinculos.map(v => ({
          empresa: v.empresa, matricula: v.matricula, cargoId: v.cargoId, departamentoId: v.departamentoId
        }))
      };
      await api.post('/funcionarios', payload);
      navigate('/'); 
    } catch (error) {
      const msgJava = error.response?.data?.message || "Ocorreu um erro ao salvar os dados no servidor.";
      setErroMensagem(msgJava);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto pb-10 flex flex-col relative">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-azul-base mb-1">Cadastro de Funcionário</h1>
        <p className="text-corpo text-sm">Adicione as informações do novo funcionário</p>
      </div>

      {erroMensagem && (
        <div className="mb-6 flex items-center gap-3 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm transition-all">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
          <p className="text-sm font-medium">{erroMensagem}</p>
        </div>
      )}

      <div className="bg-fundo rounded-xl border border-outline p-6 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-azul-base mb-6">Informações Gerais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput label="Nome do Funcionário" placeholder="Insira o nome" value={nome} onChange={(e) => { setNome(e.target.value); setErroMensagem(''); }} maxLength={150} />
          <FormInput label="CPF" placeholder="000.000.000-00" value={cpf} onChange={handleCpfChange} maxLength={14} />
        </div>
      </div>

      <div className="bg-fundo rounded-xl border border-outline p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-azul-base">Empresas</h2>
          <button onClick={abrirModalNovo} className="flex items-center gap-2 px-4 py-1.5 border border-azul-base text-azul-base rounded-full hover:bg-azul-leve font-semibold transition-colors text-sm">
            <Plus size={16} /> Novo Vínculo
          </button>
        </div>

        <div className="border border-outline rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-azul-leve">
              <tr>
                <th className="py-3 px-4 w-24 text-center text-azul-base font-bold text-sm">Ação</th>
                <th className="py-3 px-4 text-azul-base font-bold text-sm">Empresa</th>
                <th className="py-3 px-4 text-azul-base font-bold text-sm">Matrícula</th>
                <th className="py-3 px-4 text-azul-base font-bold text-sm">Cargo</th>
                <th className="py-3 px-4 text-azul-base font-bold text-sm">Departamento</th>
              </tr>
            </thead>
            <tbody>
              {vinculos.length === 0 ? (
                <tr><td colSpan="5" className="py-6 text-center text-corpo">Nenhum vínculo adicionado. Clique em "+ Novo Vínculo".</td></tr>
              ) : (
                vinculos.map((v, index) => (
                  <tr key={index} className="border-t border-outline">
                    <td className="py-3 px-4 text-center flex justify-center gap-1.5">
                      
                      <button 
                        onClick={() => abrirModalEdicao(index)} 
                        className="p-1.5 rounded-md text-azul-base bg-azul-leve hover:bg-azul-base hover:text-white transition-all" 
                        title="Editar"
                      >
                        <Edit size={16} strokeWidth={2.5} />
                      </button>
                      
                      <button 
                        onClick={() => removerVinculo(index)} 
                        className="p-1.5 rounded-md text-trancado hover:text-red-600 hover:bg-red-50 transition-all" 
                        title="Remover"
                      >
                        <Trash2 size={16} strokeWidth={2.5} />
                      </button>

                    </td>
                    <td className="py-3 px-4 text-sm font-bold">{v.empresa}</td>
                    <td className="py-3 px-4 text-sm font-bold">{v.matricula}</td>
                    <td className="py-3 px-4 text-sm font-bold">{v.cargoDescricao}</td>
                    <td className="py-3 px-4 text-sm font-bold">{v.departamentoDescricao}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-12">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 px-10 py-2 border border-azul-base text-azul-base rounded bg-fundo hover:bg-azul-leve font-semibold transition-colors text-sm">
          <X size={18} /> Cancelar
        </button>
        <button onClick={handleSalvar} disabled={salvando} className="flex items-center gap-2 px-10 py-2 bg-azul-base text-white rounded hover:bg-azul-hover font-semibold transition-colors text-sm shadow-sm disabled:opacity-70">
          <Check size={18} /> {salvando ? 'Salvando...' : 'Confirmar'}
        </button>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-fundo p-8 rounded-xl shadow-xl w-full max-w-[600px]">
            <h3 className="text-2xl font-bold text-azul-base mb-8">
              {vinculoEditandoIndex !== null ? 'Editar Vínculo' : 'Novo Vínculo'}
            </h3>
            
            <div className="flex flex-col gap-6">
              <div className="flex gap-4">
                <div className="flex-[2]"><FormInput label="Nome da Empresa" placeholder="Insira o nome da empresa" value={novaEmpresa} onChange={e => setNovaEmpresa(e.target.value)} maxLength={100} /></div>
                <div className="flex-[1]"><FormInput label="Matrícula" placeholder="0000000000" value={novaMatricula} onChange={e => setNovaMatricula(e.target.value)} maxLength={20} /></div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <SearchableSelect
                    label="Cargo"
                    placeholder="Digite ou selecione o cargo"
                    options={cargosDb.map((c) => ({ value: c.id, label: c.descricao }))}
                    value={cargoSelecionado}
                    onChange={setCargoSelecionado}
                  />
                </div>
                <div className="flex-1">
                  <SearchableSelect
                    label="Departamento"
                    placeholder="Digite ou selecione o departamento"
                    options={departamentosDb.map((d) => ({ value: d.id, label: d.descricao }))}
                    value={departamentoSelecionado}
                    onChange={setDepartamentoSelecionado}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button onClick={() => setModalAberto(false)} className="flex-1 flex items-center justify-center gap-2 py-2 border border-azul-base text-azul-base rounded hover:bg-azul-leve font-semibold transition-colors text-sm"><X size={18} /> Cancelar</button>
              <button onClick={salvarVinculoNoModal} className="flex-1 flex items-center justify-center gap-2 py-2 bg-azul-base text-white rounded hover:bg-azul-hover font-semibold transition-colors text-sm shadow-sm"><Check size={18} /> Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}