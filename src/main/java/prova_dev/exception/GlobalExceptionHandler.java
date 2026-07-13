package prova_dev.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. Mantém o tratamento das nossas regras de negócio (ex: "CPF já cadastrado")
    @ExceptionHandler(RegraNegocioException.class)
    public ResponseEntity<Map<String, Object>> handleRegraNegocio(RegraNegocioException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Erro de Regra de Negócio");
        body.put("message", ex.getMessage()); 

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    // 2. NOVO: Captura falhas das anotações @Valid (@CPF, @NotBlank, @NotNull)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Erro de Validação de Campos");

        // Extrai a primeira mensagem de erro da anotação (ex: "CPF inválido")
        String mensagemExata = ex.getBindingResult().getFieldErrors().get(0).getDefaultMessage();
        
        // Coloca na chave 'message' que o React está esperando
        body.put("message", mensagemExata); 

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }
}