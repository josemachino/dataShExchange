package des;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;

import des.storage.StorageProperties;
import des.storage.StorageService;

@SpringBootApplication
@EnableConfigurationProperties(StorageProperties.class)
public class Application {
	
	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}
	@Bean
    CommandLineRunner init(StorageService storageService) {
        return (args) -> {
        	System.out.println("Storage service running...");
            storageService.deleteAll();
            storageService.init();
        };
    }
}
