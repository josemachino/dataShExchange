package des.models;

import lombok.Data;

@Data
public class SchemaTableJSON {	
	private String key;
	private AttRel[] items;
	public SchemaTableJSON(String name, AttRel[] items) {
		// TODO Auto-generated constructor stub
		this.key=name;
		this.items=items;
	}
}
