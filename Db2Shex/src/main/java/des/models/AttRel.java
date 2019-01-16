package des.models;

import lombok.Data;

@Data
public class AttRel {

	private String id;
	private String text;
	private boolean iskey;

	public AttRel(String string, String name, boolean contains) {
		// TODO Auto-generated constructor stub
		this.id = string;
		this.text = name;
		this.iskey=contains;
	}
}
