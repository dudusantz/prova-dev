import Select, { components } from 'react-select';
import { colors } from '../theme/colors';

const selectStyles = {
  control: (base) => ({
    ...base,
    border: 'none',
    boxShadow: 'none',
    backgroundColor: 'transparent',
    minHeight: 'auto',
    cursor: 'text',
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
    fontSize: '14px',
  }),
  singleValue: (base) => ({
    ...base,
    color: colors.destaque,
    fontWeight: '600',
    fontSize: '14px',
  }),
  placeholder: (base) => ({
    ...base,
    color: colors.placeholder,
    fontSize: '14px',
    fontWeight: '400',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: '0px 4px',
    color: colors.corpoTexto,
    cursor: 'pointer',
    '&:hover': { color: colors.azulBase },
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: '0px 4px',
    color: '#ef4444',
    cursor: 'pointer',
    '&:hover': { color: '#b91c1c' },
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    fontSize: '14px',
    backgroundColor: state.isSelected
      ? colors.azulBase
      : state.isFocused
        ? colors.azulLeve
        : colors.background,
    color: state.isSelected ? colors.background : colors.destaque,
    cursor: 'pointer',
    '&:active': { backgroundColor: colors.azulHover },
  }),
};

const CustomInput = (props) => <components.Input {...props} maxLength={80} />;

/**
 * Select pesquisável (digitar para filtrar opções).
 * value/onChange usam o id como string ('' quando vazio).
 */
export function SearchableSelect({ label, placeholder, options, value, onChange }) {
  const selectedOption = options.find((opt) => String(opt.value) === String(value)) || null;

  return (
    <fieldset className="border border-outline rounded px-2 pb-1.5 pt-0 bg-fundo focus-within:border-azul-base transition-colors min-w-0">
      <legend className="text-[12px] text-titulo-campo px-1 font-medium">{label}</legend>
      <Select
        options={options}
        value={selectedOption}
        onChange={(selected) => onChange(selected ? String(selected.value) : '')}
        placeholder={placeholder}
        styles={selectStyles}
        isClearable
        isSearchable
        noOptionsMessage={() => 'Nenhum registro encontrado'}
        components={{ Input: CustomInput }}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        menuPosition="fixed"
      />
    </fieldset>
  );
}
