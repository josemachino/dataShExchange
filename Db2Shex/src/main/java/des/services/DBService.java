package des.services;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.restlet.sqlimport.model.sql.Column;
import com.restlet.sqlimport.model.sql.Database;
import com.restlet.sqlimport.model.sql.Table;

import des.controllers.FullyTypedModel;
import des.models.AttRel;
import des.models.SchemaTableJSON;

import org.apache.commons.lang3.StringUtils;
@Service
public class DBService {
	public FullyTypedModel getResult() {
		FullyTypedModel ftm = new FullyTypedModel();
		return ftm;
	}

	public List<SchemaTableJSON> createH2DB(Database db) throws SQLException {
		List<SchemaTableJSON> schemaTables=new ArrayList<SchemaTableJSON>();
		
		Connection conn = DriverManager.getConnection("jdbc:h2:mem:", "admin", "");
		Statement st = conn.createStatement();
		
		for (Table ta: db.getTables()) {
			
			List<String> pks=ta.getPrimaryKey().getColumnNames();
			StringBuilder rString = new StringBuilder();
			String sep = ",";
			AttRel [] atts=new AttRel[ta.getColumnByNames().size()];
			int i=0;
			for (Column  col:ta.getColumnByNames().values()) {
				atts[i]=new AttRel(col.getName().substring(0, 2)+i,col.getName(),pks.contains(col.getName()));
				rString.append(col.getName()).append(" ").append(col.getType()).append(sep);
			}	
			rString.setLength(rString.length()-1);
			System.out.println(rString.toString());
			schemaTables.add(new SchemaTableJSON(ta.getName(),atts));
			st.execute("create table "+ta.getName()+"("+rString.toString()+")");			
		}
		
		ResultSet rs=conn.getMetaData().getTables(null,null, null, null);
		while(rs.next()) {
			String tableName = rs.getString("TABLE_NAME");
			System.out.println(tableName);
			}
		return schemaTables;
	}
}
