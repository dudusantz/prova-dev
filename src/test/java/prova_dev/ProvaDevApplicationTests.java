package prova_dev;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Requer PostgreSQL em execução; regras de negócio cobertas pelos testes unitários dos services")
class ProvaDevApplicationTests {

	@Test
	void contextLoads() {
	}

}
