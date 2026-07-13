package prova_dev.exception;

// Estendemos RuntimeException para não poluir os métodos com "throws"
public class RegraNegocioException extends RuntimeException {
    public RegraNegocioException(String mensagem) {
        super(mensagem);
    }
}