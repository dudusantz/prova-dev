import { X, Save, Plus, Edit, AlertCircle, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { SearchableSelect } from '../../components/SearchableSelect';

const FormInput = ({ label, placeholder, value, onChange, maxLength }) => (
  <fieldset className="border border-outline rounded px-2 pb-1.5 pt-0 bg-fundo focus-within:border-azul-base transition-colors">
    <legend className="text-[12px] text-titulo-campo px-1 font-medium">{label}</legend>
    <input
      type="text"
      placeholder={placeholder}
      value={value || ''}
      onChange={onChange}
      maxLength={maxLength}
      className="w-full outline-none text-sm placeholder:text-placeholder bg-transparent text-destaque font-semibold"
    />
  </fieldset>
);

const FormSelect = ({ label, value, onChange, options }) => (
  <fieldset className="border border-outline rounded px-2 pb-1.5 pt-0 bg-fundo focus-within:border-azul-base transition-colors">
    <legend className="text-[12px] text-titulo-campo px-1 font-medium">{label}</legend>
    <select
      value={value}
      onChange={onChange}
      className="w-full outline-none text-sm bg-transparent text-destaque font-semibold"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </fieldset>
);

export default function EditarFuncionario() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [vinculos, setVinculos] = useState([]);

  const [cargosDb, setCargosDb] = useState([]);
  const [departamentosDb, setDepartamentosDb] = useState([]);

  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const [modalAberto, setModalAberto] = useState(false);
  const [erroMensagem, setErroMensagem] = useState('');
  const [erroModal, setErroModal] = useState('');

  const [vinculoEditandoIndex, setVinculoEditandoIndex] = useState(null);

  const [novaEmpresa, setNovaEmpresa] = useState('');
  const [novaMatricula, setNovaMatricula] = useState('');
  const [cargoSelecionado, setCargoSelecionado] = useState('');
  const [departamentoSelecionado, setDepartamentoSelecionado] = useState('');
  const [vinculoAtivo, setVinculoAtivo] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resCargos, resDeptos, resFunc] = await Promise.all([
          api.get('/cargos', { params: { page: 0, size: 1000, ativo: true } }),
          api.get('/departamentos', { params: { page: 0, size: 1000, ativo: true } }),
          api.get(`/funcionarios/${id}`)
        ]);

        const cargos = resCargos.data.content || resCargos.data;
        const deptos = resDeptos.data.content || resDeptos.data;
        setCargosDb(cargos);
        setDepartamentosDb(deptos);

        const func = resFunc.data;
        setNome(func.nome);
        setCpf(func.cpf);
        setAtivo(func.ativo !== false);

        if (func.vinculos) {
          setVinculos(func.vinculos.map((v) => ({
            id: v.id,
            empresa: v.empresa,
            matricula: v.matricula,
            cargoId: v.cargoId || '',
            departamentoId: v.departamentoId || '',
            cargoDescricao: v.descricaoCargo,
            departamentoDescricao: v.descricaoDepartamento,
            ativo: v.ativo !== false,
          })));
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
    setNovaEmpresa('');
    setNovaMatricula('');
    setCargoSelecionado('');
    setDepartamentoSelecionado('');
    setVinculoAtivo(true);
    setErroModal('');
    setModalAberto(true);
  }

  function abrirModalEdicao(index) {
    const v = vinculos[index];
    setVinculoEditandoIndex(index);
    setNovaEmpresa(v.empresa);
    setNovaMatricula(v.matricula);
    setCargoSelecionado(v.cargoId?.toString() || '');
    setDepartamentoSelecionado(v.departamentoId?.toString() || '');
    setVinculoAtivo(v.ativo !== false);
    setErroModal('');
    setModalAberto(true);
  }

  function salvarVinculoNoModal() {
    setErroModal('');

    if (!novaEmpresa || !novaMatricula || !cargoSelecionado || !departamentoSelecionado) {
      setErroModal("Preencha todos os campos do vínculo.");
      return;
    }

    if (vinculoAtivo) {
      const matriculaJaExiste = vinculos.some((v, index) =>
        v.ativo !== false &&
        v.matricula === novaMatricula &&
        v.empresa === novaEmpresa &&
        index !== vinculoEditandoIndex
      );

      if (matriculaJaExiste) {
        setErroModal("Esta matrícula já foi adicionada para esta empresa na lista de vínculos ativos.");
        return;
      }
    }

    const cargoObj = cargosDb.find((c) => c.id.toString() === cargoSelecionado);
    const deptoObj = departamentosDb.find((d) => d.id.toString() === departamentoSelecionado);

    const base = vinculoEditandoIndex !== null ? vinculos[vinculoEditandoIndex] : {};
    const vinculoAtualizado = {
      id: base.id,
      empresa: novaEmpresa,
      matricula: novaMatricula,
      cargoId: Number(cargoSelecionado),
      departamentoId: Number(departamentoSelecionado),
      cargoDescricao: cargoObj?.descricao || base.cargoDescricao,
      departamentoDescricao: deptoObj?.descricao || base.departamentoDescricao,
      ativo: vinculoAtivo,
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

  async function handleSalvar() {
    setErroMensagem('');
    if (!nome || !cpf) {
      setErroMensagem("Preencha o Nome e o CPF.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (cpf.length < 14) {
      setErroMensagem("O CPF deve estar completo (11 dígitos).");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (vinculos.length === 0) {
      setErroMensagem("O funcionário precisa ter pelo menos um vínculo.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const temVinculoAtivo = vinculos.some((v) => v.ativo !== false);
    if (!ativo && temVinculoAtivo) {
      setErroMensagem("Inative todos os vínculos antes de inativar o funcionário.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSalvando(true);
    try {
      const payload = {
        nome,
        cpf,
        ativo,
        vinculos: vinculos.map((v) => ({
          id: v.id || null,
          empresa: v.empresa,
          matricula: v.matricula,
          cargoId: v.cargoId,
          departamentoId: v.departamentoId,
          ativo: v.ativo !== false,
        })),
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

  if (carregando) return <div className="p-8 text-center text-corpo">A carregar dados do funcionário...</div>;

  return (
    <div className="w-full max-w-5xl mx-auto pb-10 flex flex-col relative">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-azul-base mb-1">Editar Funcionário</h1>
        <p className="text-corpo text-sm">Altere as informações deste funcionário</p>
      </div>

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
            label="Nome do Funcionário"
            placeholder="Insira o nome"
            value={nome}
            onChange={(e) => { setNome(e.target.value); setErroMensagem(''); }}
            maxLength={150}
          />
          <FormInput label="CPF" placeholder="000.000.000-00" value={cpf} onChange={handleCpfChange} maxLength={14} />
          <FormSelect
            label="Situação"
            value={ativo ? 'ativo' : 'inativo'}
            onChange={(e) => { setAtivo(e.target.value === 'ativo'); setErroMensagem(''); }}
            options={[
              { value: 'ativo', label: 'Ativo' },
              { value: 'inativo', label: 'Inativo' },
            ]}
          />
        </div>
      </div>

      <div className="bg-fundo rounded-xl border border-outline p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-azul-base">Empresas</h2>
          <button
            onClick={abrirModalNovo}
            className="flex items-center gap-2 px-4 py-1.5 border border-azul-base text-azul-base rounded-full hover:bg-azul-leve font-semibold transition-colors text-sm"
          >
            <Plus size={16} /> Novo Vínculo
          </button>
        </div>

        <div className="border border-outline rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-azul-leve">
              <tr>
                <th className="py-3 px-4 w-20 text-center text-azul-base font-bold text-sm">Editar</th>
                <th className="py-3 px-4 text-azul-base font-bold text-sm">Empresa</th>
                <th className="py-3 px-4 text-azul-base font-bold text-sm">Matrícula</th>
                <th className="py-3 px-4 text-azul-base font-bold text-sm">Cargo</th>
                <th className="py-3 px-4 text-azul-base font-bold text-sm">Departamento</th>
                <th className="py-3 px-4 text-azul-base font-bold text-sm">Situação</th>
              </tr>
            </thead>
            <tbody>
              {vinculos.length === 0 ? (
                <tr><td colSpan="6" className="py-6 text-center text-corpo">Nenhum vínculo.</td></tr>
              ) : (
                vinculos.map((v, index) => (
                  <tr
                    key={v.id || `novo-${index}`}
                    className={`border-t border-outline ${v.ativo === false ? 'opacity-60' : ''}`}
                  >
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => abrirModalEdicao(index)}
                        className="p-1.5 rounded-md text-azul-base bg-azul-leve hover:bg-azul-base hover:text-white transition-all"
                        title="Editar"
                      >
                        <Edit size={16} strokeWidth={2.5} />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-sm font-bold">{v.empresa}</td>
                    <td className="py-3 px-4 text-sm font-bold">{v.matricula}</td>
                    <td className="py-3 px-4 text-sm font-bold">{v.cargoDescricao}</td>
                    <td className="py-3 px-4 text-sm font-bold">{v.departamentoDescricao}</td>
                    <td className="py-3 px-4 text-sm font-bold">
                      {v.ativo === false ? 'Inativo' : 'Ativo'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-12">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-10 py-2 border border-azul-base text-azul-base rounded bg-fundo hover:bg-azul-leve font-semibold transition-colors text-sm"
        >
          <X size={18} /> Cancelar
        </button>
        <button
          onClick={handleSalvar}
          disabled={salvando}
          className="flex items-center gap-2 px-10 py-2 bg-azul-base text-white rounded hover:bg-azul-hover font-semibold transition-colors text-sm shadow-sm disabled:opacity-70"
        >
          <Save size={18} /> {salvando ? 'A Salvar...' : 'Salvar'}
        </button>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-fundo p-8 rounded-xl shadow-xl w-full max-w-[600px]">
            <h3 className="text-2xl font-bold text-azul-base mb-6">
              {vinculoEditandoIndex !== null ? 'Editar Vínculo' : 'Novo Vínculo'}
            </h3>

            {erroModal && (
              <div className="mb-6 flex items-center gap-3 bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded shadow-sm">
                <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                <p className="text-sm font-medium">{erroModal}</p>
              </div>
            )}

            <div className="flex flex-col gap-6">
              <div className="flex gap-4">
                <div className="flex-[2]">
                  <FormInput
                    label="Nome da Empresa"
                    placeholder="Insira o nome da empresa"
                    value={novaEmpresa}
                    onChange={(e) => { setNovaEmpresa(e.target.value); setErroModal(''); }}
                    maxLength={100}
                  />
                </div>
                <div className="flex-[1]">
                  <FormInput
                    label="Matrícula"
                    placeholder="0000000000"
                    value={novaMatricula}
                    onChange={(e) => { setNovaMatricula(e.target.value); setErroModal(''); }}
                    maxLength={20}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <SearchableSelect
                    label="Cargo"
                    placeholder="Digite ou selecione o cargo"
                    options={cargosDb.map((c) => ({ value: c.id, label: c.descricao }))}
                    value={cargoSelecionado}
                    onChange={(valor) => { setCargoSelecionado(valor); setErroModal(''); }}
                  />
                </div>
                <div className="flex-1">
                  <SearchableSelect
                    label="Departamento"
                    placeholder="Digite ou selecione o departamento"
                    options={departamentosDb.map((d) => ({ value: d.id, label: d.descricao }))}
                    value={departamentoSelecionado}
                    onChange={(valor) => { setDepartamentoSelecionado(valor); setErroModal(''); }}
                  />
                </div>
              </div>
              <FormSelect
                label="Situação"
                value={vinculoAtivo ? 'ativo' : 'inativo'}
                onChange={(e) => setVinculoAtivo(e.target.value === 'ativo')}
                options={[
                  { value: 'ativo', label: 'Ativo' },
                  { value: 'inativo', label: 'Inativo' },
                ]}
              />
            </div>
            <div className="flex gap-4 mt-10">
              <button
                onClick={() => { setModalAberto(false); setErroModal(''); }}
                className="flex-1 flex items-center justify-center gap-2 py-2 border border-azul-base text-azul-base rounded hover:bg-azul-leve font-semibold text-sm"
              >
                <X size={18} /> Cancelar
              </button>
              <button
                onClick={salvarVinculoNoModal}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-azul-base text-white rounded hover:bg-azul-hover font-semibold text-sm shadow-sm"
              >
                <Check size={18} /> Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
