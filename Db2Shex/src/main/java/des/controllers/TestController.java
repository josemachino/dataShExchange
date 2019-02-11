package des.controllers;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;

import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import com.restlet.sqlimport.model.sql.Database;
import com.restlet.sqlimport.parser.SqlImport;
import com.restlet.sqlimport.report.Report;
import com.restlet.sqlimport.util.Util;

import des.services.DBService;

@Controller
public class TestController {
	String folderDBName="tests/db";
	String folderTGDName="tests/tgds";
	String [] sqlFiles=new String[] {"student","product"};
	
	private final DBService dbService;
	private Util util = new Util();
	private Report report = new Report();
	private SqlImport sqlImport = new SqlImport(report);		
	
	@Autowired
	public TestController(DBService dbService) {
		this.dbService = dbService;
	}	
	
	@GetMapping("/tgd/{filename}")
    public StreamingResponseBody getStreamingFile(HttpServletResponse response,@PathVariable String filename) throws IOException {

		Resource tgdResource = new ClassPathResource(folderTGDName+"/"+filename+".json");
		
        response.setContentType("application/json");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" +filename+".json"+"\"");
        InputStream inputStream = tgdResource.getInputStream();

        return outputStream -> {
            int nRead;
            byte[] data = new byte[1024];
            while ((nRead = inputStream.read(data, 0, data.length)) != -1) {
                outputStream.write(data, 0, nRead);
            }
            inputStream.close();
        };
    }
	
	@RequestMapping("/test")
    String test(@RequestParam("nameTest") String nameTest,@RequestParam("queries")String queries) throws IOException, SQLException {
		//Read file
		Resource dbResource=null;		
		if (nameTest.equals("twoAttSameTC")) {
			dbResource = new ClassPathResource(folderDBName+"/"+sqlFiles[0]+".sql");
		}
		if (nameTest.equals("")){
			
		}
		
		final InputStream in = dbResource.getInputStream();
		final String sqlContent = util.read(in);
		//create the database in a parallel process
		final Database database = sqlImport.getDatabase(sqlContent);			
        //Return the structure that will draw the graphic        
        dbService.createH2DB(database);        
        String[] ls_Query=queries.split("\n");
        return dbService.getResultFile("RDF/JSON",ls_Query).toString();        
    }
}
