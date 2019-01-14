package Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import models.TGDS;
import services.DBService;
//https://stackoverflow.com/questions/43503977/spring-mvc-jackson-mapping-query-parameters-to-modelattribute-lowercase-wi
//https://github.com/spring-guides?page=2
//https://www.callicoder.com/spring-boot-file-upload-download-jpa-hibernate-mysql-database-example/
//https://github.com/husseinterek/spring-boot-jpa-hibernate/blob/master/src/main/resources/application.properties
//https://github.com/lchaboud-restlet/antlr-sqlparser
@RestController
public class DbController {
	@Autowired
	private DBService dbService;
	@PostMapping("/chase/")
    @ResponseBody
    public FullyTypedModel chaseRule(TGDS tgds) {
		
        return dbService.getResult();         
    }
}
