package des.controllers;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.restlet.sqlimport.model.sql.Database;
import com.restlet.sqlimport.parser.SqlImport;
import com.restlet.sqlimport.report.Report;
import com.restlet.sqlimport.util.Util;

import des.storage.StorageFileNotFoundException;
import des.storage.StorageService;

@RestController
public class FileUploadController {
	private final StorageService storageService;
	private Util util = new Util();
	private Report report = new Report();
	private SqlImport sqlImport = new SqlImport(report);

	@Autowired
	public FileUploadController(StorageService storageService) {
		this.storageService = storageService;
	}
	@GetMapping(path="/listFiles")
    public String listUploadedFiles(Model model) throws IOException {

        model.addAttribute("files", storageService.loadAll().map(
                path -> MvcUriComponentsBuilder.fromMethodName(FileUploadController.class,
                        "serveFile", path.getFileName().toString()).build().toString())
                .collect(Collectors.toList()));
        System.out.println(model.asMap().values());
        return "greeting";
    }
	
	@PostMapping("/hello")
	public String postHello(@RequestBody final String hola) {
	  return "Hello " + hola;
	}

	
	@GetMapping("/files/{filename:.+}")
    @ResponseBody
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {

        Resource file = storageService.loadAsResource(filename);
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + file.getFilename() + "\"").body(file);
    }
	
	@PostMapping("/uploadFile")
    public String handleFileUpload(@RequestParam("file") MultipartFile file,
            RedirectAttributes redirectAttributes) throws FileNotFoundException, IOException {
		System.out.println("te amooooooooooo");
        storageService.store(file);
        System.out.println("archivo "+file.getOriginalFilename());
        System.out.println("archivo "+file.getName());
        Resource sqlFile = storageService.loadAsResource(file.getOriginalFilename());
        System.out.println("archivo "+sqlFile.getFilename());
        final InputStream in = new FileInputStream(sqlFile.getFile());
		final String sqlContent = util.read(in);
		final Database database = sqlImport.getDatabase(sqlContent);
		System.out.println(database.getTables().size());
        //create the database in a parallel process
        //Return the structure that will draw the graphic
        redirectAttributes.addFlashAttribute("message",
                "You successfully uploaded " + file.getOriginalFilename() + "!");

        return "redirect:/listFiles";
    }
	
	@ExceptionHandler(StorageFileNotFoundException.class)
    public ResponseEntity<?> handleStorageFileNotFound(StorageFileNotFoundException exc) {
        return ResponseEntity.notFound().build();
    }
}
