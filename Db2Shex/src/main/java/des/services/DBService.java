package des.services;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.ResourceFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.stereotype.Service;

import com.restlet.sqlimport.model.sql.Column;
import com.restlet.sqlimport.model.sql.Database;
import com.restlet.sqlimport.model.sql.Table;

import des.models.AttRel;
import des.models.RdfInstance;
import des.models.ReFK;
import des.models.SchemaTableJSON;

@Service
public class DBService {	
	public byte[] getResultFile(String format) {
		//create the triple store
		RdfInstance rdfInstance=new RdfInstance();
		//Read the Shex schema file
		
		//proceed to the chase with sql inserting the values in the triple store
		Resource rSubject = ResourceFactory.createResource("http://inria.fr");
		rdfInstance.putTypes(rSubject, "T1");
		rdfInstance.getTripleSet().add(rSubject, ResourceFactory.createProperty("hello"), ResourceFactory.createResource("http://person/f1"));
		
		
		//Write to file of the format specified
		org.apache.jena.riot.RIOT.init();
		java.io.ByteArrayOutputStream os = null;
		// Serialize over an outputStream
		os = new java.io.ByteArrayOutputStream();
		rdfInstance.getTripleSet().write(os,format);		
		return os.toByteArray();
	}

	public List<SchemaTableJSON> createH2DB(Database db) throws SQLException {
		List<SchemaTableJSON> schemaTables=new ArrayList<SchemaTableJSON>();
		
		DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("org.h2.Driver");
        dataSource.setUrl("jdbc:h2:mem:~/dbshex");
        dataSource.setUsername("admin");
        dataSource.setPassword("123");

		JdbcTemplate jdbcTemplate=new JdbcTemplate(dataSource);		
		
		for (Table ta: db.getTables()) {
			
			List<String> pks=ta.getPrimaryKey().getColumnNames();			
			StringBuilder rString = new StringBuilder();
			String sep = ",";
			AttRel [] atts=new AttRel[ta.getColumnByNames().size()];
			int i=0;			
			for (Column  col:ta.getColumnByNames().values()) {
				if (ta.getForeignKeyForColumnNameOrigin(col)==null) {
					atts[i]=new AttRel(ta.getName().substring(0, 2)+i,col.getName(),pks.contains(col.getName()));	
				}else {
					Table refTa=db.getTableForName(ta.getForeignKeyForColumnNameOrigin(col).getTableNameTarget());
					System.out.println(refTa.getName());
					int j=0;
					String refColName=ta.getForeignKeyForColumnNameOrigin(col).getColumnNameTargets().get(0);
					for (Column refCol: refTa.getColumnByNames().values()) {
						System.out.print(refCol.getName() + " "+ refColName);
						if (refCol.getName().equals(refColName)) {
							break;
						}
						j++;
					}					
					//Set id of the column					
					atts[i]=new AttRel(ta.getName().substring(0, 2)+i,col.getName(),pks.contains(col.getName()),new ReFK(refTa.getName(),refTa.getName().substring(0, 2)+j));					
				}								
				rString.append(col.getName()).append(" ").append(col.getType()).append(sep);
				i++;
			}	
			rString.setLength(rString.length()-1);			
			schemaTables.add(new SchemaTableJSON(ta.getName(),atts));		
			jdbcTemplate.execute("CREATE TABLE "+ta.getName()+"("+rString.toString()+")");			
		}
		return schemaTables;
	}
}
