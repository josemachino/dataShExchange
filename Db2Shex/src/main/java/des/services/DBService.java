package des.services;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.stereotype.Service;

import com.restlet.sqlimport.model.sql.Column;
import com.restlet.sqlimport.model.sql.Database;
import com.restlet.sqlimport.model.sql.Table;

import des.controllers.FullyTypedModel;
import des.models.AttRel;
import des.models.ReFK;
import des.models.SchemaTableJSON;

@Service
public class DBService {	
	public FullyTypedModel getResult() {
		FullyTypedModel ftm = new FullyTypedModel();
		return ftm;
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
					//refTa.getColumnByNames().get(key)
					int j=0;
					String refColName=ta.getForeignKeyForColumnNameOrigin(col).getColumnNameTargets().get(0);
					for (Column refCol: refTa.getColumnByNames().values()) {
						if (refCol.getName()==refColName) {
							break;
						}
						j++;
					}					
					//Set id of the column
					String refTaName=ta.getForeignKeyForColumnNameOrigin(col).getTableNameTarget();
					atts[i]=new AttRel(ta.getName().substring(0, 2)+i,col.getName(),pks.contains(col.getName()),new ReFK(refTaName,refTaName.substring(0, 2)+j));					
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
