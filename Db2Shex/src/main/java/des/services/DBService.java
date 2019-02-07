package des.services;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.apache.jena.rdf.model.Literal;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.ResourceFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.ResultSetExtractor;
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
	
	@Autowired
    private JdbcTemplate jdbcTemplate;
	
	public byte[] getResultFile(String format,String[] queries) {
		/*DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("org.h2.Driver");
        dataSource.setUrl("jdbc:h2:mem:~/dbshex");
        dataSource.setUsername("admin");
        dataSource.setPassword("123");
		
        JdbcTemplate jdbcTemplate=new JdbcTemplate(dataSource);*/
		
      //proceed to the chase with sql inserting the values in the triple store
        executeQueries(jdbcTemplate,Arrays.asList(queries));
        
		//Read the Shex schema file        
		//create the triple store
		RdfInstance rdfInstance=jdbcTemplate.query("SELECT * FROM Solution",new ResultSetExtractor<RdfInstance>() {
			@Override
			public RdfInstance extractData(ResultSet rs) throws SQLException, DataAccessException {
				RdfInstance triples=new RdfInstance();
				while(rs.next()) {
					Resource rSubject = ResourceFactory.createResource(rs.getString(1));
					Property predicate=ResourceFactory.createProperty(rs.getString(2));
					Literal rObject = ResourceFactory.createStringLiteral(rs.getString(3));
					//rdfInstance.putTypes(rSubject, "T1");
					//ResourceFactory.createResource("http://person/f1");
					triples.getTripleSet().add(rSubject,predicate ,rObject );
				}
				return triples;
			}			
		} );		
		
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
					int j=0;
					String refColName=ta.getForeignKeyForColumnNameOrigin(col).getColumnNameTargets().get(0);
					for (Column refCol: refTa.getColumnByNames().values()) {						
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
			String taQ="CREATE TABLE "+ta.getName()+" ( "+rString.toString()+" )";			
			jdbcTemplate.execute(taQ);			
		}		
		executeQueries(jdbcTemplate,db.getInserts());
		
		return schemaTables;
	}
	private void executeQueries(JdbcTemplate jdbcTemplate,List<String> queries) {		               
        for (String q:queries) {        	
        	q=q.replaceAll(";", "");
        	System.out.println(q);
        	jdbcTemplate.execute(q);
        }
	}
		
}
