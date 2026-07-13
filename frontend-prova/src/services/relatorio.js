import { api } from './api';

/**
 * Baixa um PDF gerado pelo backend e dispara o download no browser.
 * Em caso de erro JSON (blob), extrai a mensagem para alert.
 */
export async function baixarRelatorioPdf(path, params, filename) {
  try {
    const response = await api.get(path, {
      params,
      responseType: 'blob',
    });

    const contentType = response.headers['content-type'] || '';
    if (contentType.includes('application/json')) {
      const texto = await response.data.text();
      const erro = JSON.parse(texto);
      throw new Error(erro.message || 'Não foi possível gerar o relatório.');
    }

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    if (error.response?.data instanceof Blob) {
      try {
        const texto = await error.response.data.text();
        const erro = JSON.parse(texto);
        throw new Error(erro.message || 'Não foi possível gerar o relatório.');
      } catch (parseError) {
        if (parseError instanceof Error && parseError.message && !parseError.message.includes('JSON')) {
          throw parseError;
        }
        throw new Error('Não foi possível gerar o relatório.');
      }
    }
    throw error instanceof Error ? error : new Error('Não foi possível gerar o relatório.');
  }
}
