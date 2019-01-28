package des.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import des.models.TGDS;
import des.services.DBService;
//https://stackoverflow.com/questions/43503977/spring-mvc-jackson-mapping-query-parameters-to-modelattribute-lowercase-wi
//https://github.com/spring-guides?page=2
//https://www.callicoder.com/spring-boot-file-upload-download-jpa-hibernate-mysql-database-example/
//https://github.com/husseinterek/spring-boot-jpa-hibernate/blob/master/src/main/resources/application.properties
//https://github.com/lchaboud-restlet/antlr-sqlparser
//https://stackoverflow.com/questions/44550020/json-object-and-spring-requestparam
@RestController
public class DbController {
	private final DBService dbService;
	@Autowired
	public DbController(DBService dbService) {
		this.dbService = dbService;
	}	
	@PostMapping(path="/chase",consumes = "application/json")    
    public @ResponseBody byte[] chaseRule(@RequestBody String queries) {
		String[] ls_Query=queries.split("\n");				
        return dbService.getResultFile("RDF/JSON",ls_Query);         
    }
}
