package des.models;

import java.util.Map;

public class RelAtom {
	private String atom;
	private Map<String,Object>[] args;
	public String getAtom() {
		return atom;
	}
	public void setAtom(String atom) {
		this.atom = atom;
	}
	public Map<String,Object>[] getArgs() {
		return args;
	}
	public void setArgs(Map<String,Object>[] args) {
		this.args = args;
	}
}
