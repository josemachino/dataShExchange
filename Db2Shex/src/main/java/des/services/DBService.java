package des.services;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import org.springframework.stereotype.Service;

import com.restlet.sqlimport.model.sql.Database;

import des.controllers.FullyTypedModel;
import des.models.SchemaTableJSON;

@Service
public class DBService {
	public FullyTypedModel getResult() {
		FullyTypedModel ftm = new FullyTypedModel();
		return ftm;
	}

	public void createH2DB(Database db) throws SQLException {
		SchemaTableJSON schema=new SchemaTableJSON();
		Connection conn = DriverManager.getConnection("jdbc:h2:mem:", "admin", "");
		Statement st = conn.createStatement();
		st.execute("create table esposa(id integer)");
		st.execute("insert into esposa values(5)");
		ResultSet rs=st.executeQuery("select * from esposa");
		if (rs.next())
			System.out.println(rs.getInt("id"));

	}
}
