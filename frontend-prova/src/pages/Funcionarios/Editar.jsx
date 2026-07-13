import { X, Save, Plus, Edit, Trash2, AlertCircle, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
      className="w-full outline-none text-sm placeholder-gray-300 bg-transparent text-black font-semibold"
    />
  </fieldset>
);

export default function EditarFuncionario() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [vinculos, setVinculos] = useState([]);

  const [cargosDb, setCargosDb] = useState([]);
  const [departamentosDb, setDepartamentosDb] = useState([]);

  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const [modalAberto, setModalAberto] = useState(false);
  const [erroMensagem, setErroMensagem] = useState('');
  
  // Estado exclusivo para erros dentro do modal
  const [erroModal, setErroModal] = useState('');
  
  const [vinculoEditandoIndex, setVinculoEditandoIndex] = useState(null);

  const [novaEmpresa, setNovaEmpresa] = useState('');
  const [novaMatricula, setNovaMatricula] = useState('');
  const [cargoSelecionado, setCargoSelecionado] = useState('');
  const [departamentoSelecionado, setDepartamentoSelecionado] = useState('');

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resCargos, resDeptos, resFunc] = await Promise.all([
          api.get('/cargos', { params: { page: 0, size: 1000 } }),
          api.get('/departamentos', { params: { page: 0, size: 1000 } }),
          api.get(`/funcionarios/${id}`)
        ]);

        setCargosDb(resCargos.data.content || resCargos.data);
        setDepartamentosDb(resDeptos.data.content || resDeptos.data);

        const func = resFunc.data;
        setNome(func.nome);
        setCpf(func.cpf);

        if (func.vinculos) {
          const vinculosFormatados = func.vinculos.map(v => {
            const cargoReal = (resCargos.data.content || resCargos.data).find(c => c.codigoCargo === v.codigoCargo);
            const deptoReal = (resDeptos.data.content || resDeptos.data).find(d => d.codigoDepartamento === v.codigoDepartamento);

            return {
              empresa: v.empresa,
              matricula: v.matricula,
              cargoId: cargoReal?.id || '',
              departamentoId: deptoReal?.id || '',
              cargoDescricao: v.descricaoCargo || cargoReal?.descricao,
              departamentoDescricao: v.descricaoDepartamento || deptoReal?.descricao
            };
          });
          setVinculos(vinculosFormatados);
        }
      } catch (error) {
        console.error("Erro ao carregar:", error);
        alert("Erro ao carregar dados do funcionário.");
        navigate('/');
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, [id, navigate]);

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
    setErroModal('');
    setModalAberto(true);
  }

  function abrirModalEdicao(index) {
    const v = vinculos[index];
    setVinculoEditandoIndex(index);
    setNovaEmpresa(v.empresa);
    setNovaMatricula(v.matricula);
    setCargoSelecionado(v.cargoId.toString());
    setDepartamentoSelecionado(v.departamentoId.toString());
    setErroModal('');
    setModalAberto(true);
  }

  function salvarVinculoNoModal() {
    setErroModal(''); // Limpa o erro do modal antes de validar

    if (!novaEmpresa || !novaMatricula || !cargoSelecionado || !departamentoSelecionado) {
      setErroModal("Preencha todos os campos do vínculo."); 
      return;
    }

    // Validação correta: checa Matrícula E Empresa simultaneamente
    const matriculaJaExiste = vinculos.some((v, index) =>
      v.matricula === novaMatricula && 
      v.empresa === novaEmpresa && 
      index !== vinculoEditandoIndex
    );

    if (matriculaJaExiste) {
      setErroModal("Esta matrícula já foi adicionada para esta empresa na lista.");
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
  }

  function removerVinculo(index) {
    setVinculos(vinculos.filter((_, i) => i !== index));
  }

  async function handleSalvar() {
    setErroMensagem('');
    if (!nome || !cpf) { setErroMensagem("Preencha o Nome e o CPF."); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (cpf.length < 14) { setErroMensagem("O CPF deve estar completo (11 dígitos)."); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (vinculos.length === 0) { setErroMensagem("O funcionário precisa ter pelo menos um vínculo."); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }

    setSalvando(true);
    try {
      const payload = {
        nome: nome, cpf: cpf,
        vinculos: vinculos.map(v => ({
          empresa: v.empresa, matricula: v.matricula, cargoId: v.cargoId, departamentoId: v.departamentoId
        }))
      };
      await api.put(`/funcionarios/${id}`, payload);
      navigate('/');
    } catch (error) {
      setErroMensagem(error.response?.data?.message || "Erro ao salvar os dados.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <div className="p-8 text-center text-gray-500">A carregar dados do funcionário...</div>;

  return (
    <div className="w-full max-w-5xl mx-auto pb-10 flex flex-col relative">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-[#3078b4] mb-1">Editar Funcionário</h1>
        <p className="text-gray-500 text-sm">Altere as informações deste funcionário</p>
      </div>

      {erroMensagem && (
        <div className="mb-6 flex items-center gap-3 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
          <p className="text-sm font-medium">{erroMensagem}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-[#3078b4] mb-6">Informações Gerais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput label="Nome do Funcionário" placeholder="Insira o nome" value={nome} onChange={(e) => { setNome(e.target.value); setErroMensagem(''); }} maxLength={150} />
          <FormInput label="CPF" placeholder="000.000.000-00" value={cpf} onChange={handleCpfChange} maxLength={14} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-[#3078b4]">Empresas</h2>
          <button onClick={abrirModalNovo} className="flex items-center gap-2 px-4 py-1.5 border border-[#3078b4] text-[#3078b4] rounded-full hover:bg-blue-50 font-semibold transition-colors text-sm">
            <Plus size={16} /> Novo Vínculo
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#eef2f6]">
              <tr>
                <th className="py-3 px-4 w-24 text-center text-[#3078b4] font-bold text-sm">Editar</th>
                <th className="py-3 px-4 text-[#3078b4] font-bold text-sm">Empresa</th>
                <th className="py-3 px-4 text-[#3078b4] font-bold text-sm">Matrícula</th>
                <th className="py-3 px-4 text-[#3078b4] font-bold text-sm">Cargo</th>
                <th className="py-3 px-4 text-[#3078b4] font-bold text-sm">Departamento</th>
              </tr>
            </thead>
            <tbody>
              {vinculos.length === 0 ? (
                <tr><td colSpan="5" className="py-6 text-center text-gray-500">Nenhum vínculo.</td></tr>
              ) : (
                vinculos.map((v, index) => (
                  <tr key={index} className="border-t border-gray-200">
                    <td className="py-3 px-4 text-center flex justify-center gap-1.5">
                      <button onClick={() => abrirModalEdicao(index)} className="p-1.5 rounded-md text-[#3078b4] bg-blue-50 hover:bg-[#3078b4] hover:text-white transition-all" title="Editar">
                        <Edit size={16} strokeWidth={2.5} />
                      </button>
                      <button onClick={() => removerVinculo(index)} className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Remover">
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
        <button onClick={() => navigate('/')} className="flex items-center gap-2 px-10 py-2 border border-[#3078b4] text-[#3078b4] rounded bg-white hover:bg-blue-50 font-semibold transition-colors text-sm">
          <X size={18} /> Cancelar
        </button>
        <button onClick={handleSalvar} disabled={salvando} className="flex items-center gap-2 px-10 py-2 bg-[#3078b4] text-white rounded hover:bg-[#276496] font-semibold transition-colors text-sm shadow-sm disabled:opacity-70">
          <Save size={18} /> {salvando ? 'A Salvar...' : 'Salvar'}
        </button>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-[600px]">
            <h3 className="text-2xl font-bold text-[#3078b4] mb-6">
              {vinculoEditandoIndex !== null ? 'Editar Vínculo' : 'Novo Vínculo'}
            </h3>

            {/* Tarja de erro exclusiva do modal */}
            {erroModal && (
              <div className="mb-6 flex items-center gap-3 bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded shadow-sm">
                <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                <p className="text-sm font-medium">{erroModal}</p>
              </div>
            )}

            <div className="flex flex-col gap-6">
              <div className="flex gap-4">
                <div className="flex-[2]"><FormInput label="Nome da Empresa" placeholder="Insira o nome da empresa" value={novaEmpresa} onChange={e => {setNovaEmpresa(e.target.value); setErroModal('');}} maxLength={100} /></div>
                <div className="flex-[1]"><FormInput label="Matrícula" placeholder="0000000000" value={novaMatricula} onChange={e => {setNovaMatricula(e.target.value); setErroModal('');}} maxLength={20} /></div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <fieldset className="border border-gray-300 rounded px-2 pb-1.5 pt-0 focus-within:border-[#3078b4]"><legend className="text-[12px] text-gray-600 px-1 font-medium">Cargo</legend><select value={cargoSelecionado} onChange={e => {setCargoSelecionado(e.target.value); setErroModal('');}} className="w-full outline-none text-sm text-black bg-transparent cursor-pointer font-semibold"><option value="">Selecione Uma Opção</option>{cargosDb.map(c => <option key={c.id} value={c.id}>{c.descricao}</option>)}</select></fieldset>
                </div>
                <div className="flex-1">
                  <fieldset className="border border-gray-300 rounded px-2 pb-1.5 pt-0 focus-within:border-[#3078b4]"><legend className="text-[12px] text-gray-600 px-1 font-medium">Departamento</legend><select value={departamentoSelecionado} onChange={e => {setDepartamentoSelecionado(e.target.value); setErroModal('');}} className="w-full outline-none text-sm text-black bg-transparent cursor-pointer font-semibold"><option value="">Selecione Uma Opção</option>{departamentosDb.map(d => <option key={d.id} value={d.id}>{d.descricao}</option>)}</select></fieldset>
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-10">
              <button onClick={() => { setModalAberto(false); setErroModal(''); }} className="flex-1 flex items-center justify-center gap-2 py-2 border border-[#3078b4] text-[#3078b4] rounded hover:bg-blue-50 font-semibold text-sm"><X size={18} /> Cancelar</button>
              <button onClick={salvarVinculoNoModal} className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#3078b4] text-white rounded hover:bg-[#276496] font-semibold text-sm shadow-sm"><Check size={18} /> Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}