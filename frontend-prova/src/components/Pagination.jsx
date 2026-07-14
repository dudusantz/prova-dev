/**
 * Paginação com Anterior / números / Próxima.
 * @param {number} pagina - índice 0-based da página actual
 * @param {number} totalPaginas
 * @param {(pageIndex: number) => void} onChange
 */
export function Pagination({ pagina, totalPaginas, onChange }) {
  if (totalPaginas <= 1) return null;

  const paginasVisiveis = obterPaginasVisiveis(pagina, totalPaginas);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-outline">
      <span className="text-sm text-corpo font-medium">
        A visualizar página {pagina + 1} de {totalPaginas}
      </span>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange(pagina - 1)}
          disabled={pagina === 0}
          className="px-3 py-2 text-sm border border-outline text-tooltip rounded hover:bg-fundo-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          Anterior
        </button>

        {paginasVisiveis.map((item, index) =>
          item === '…' ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-sm text-trancado font-semibold select-none"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              aria-current={item === pagina ? 'page' : undefined}
              className={
                item === pagina
                  ? 'min-w-[2.25rem] px-3 py-2 text-sm rounded font-semibold bg-azul-base text-white border border-azul-base'
                  : 'min-w-[2.25rem] px-3 py-2 text-sm rounded font-semibold border border-outline text-tooltip hover:bg-fundo-2 transition-colors'
              }
            >
              {item + 1}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onChange(pagina + 1)}
          disabled={pagina >= totalPaginas - 1}
          className="px-3 py-2 text-sm border border-outline text-tooltip rounded hover:bg-fundo-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}

/** Devolve índices 0-based e eventuais '…' para não listar dezenas de botões. */
function obterPaginasVisiveis(paginaActual, totalPaginas) {
  if (totalPaginas <= 7) {
    return Array.from({ length: totalPaginas }, (_, i) => i);
  }

  const paginas = new Set([0, totalPaginas - 1, paginaActual]);

  for (let i = paginaActual - 1; i <= paginaActual + 1; i += 1) {
    if (i > 0 && i < totalPaginas - 1) {
      paginas.add(i);
    }
  }

  const ordenadas = [...paginas].sort((a, b) => a - b);
  const resultado = [];

  for (let i = 0; i < ordenadas.length; i += 1) {
    const actual = ordenadas[i];
    const anterior = ordenadas[i - 1];

    if (i > 0 && actual - anterior > 1) {
      resultado.push('…');
    }
    resultado.push(actual);
  }

  return resultado;
}
