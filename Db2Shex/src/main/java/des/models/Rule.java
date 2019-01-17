package des.models;

import java.util.Map;

public class Rule {
	private Map<String, String> bind;
	private Map<String, Object>[] constraints;
	private RelAtom[] yield;

	public Map<String, String> getBind() {
		return bind;
	}

	public void setBind(Map<String, String> bind) {
		this.bind = bind;
	}


	public RelAtom[] getYield() {
		return yield;
	}

	public void setYield(RelAtom[] yield) {
		this.yield = yield;
	}

	public Map<String, Object>[] getConstraints() {
		return constraints;
	}

	public void setConstraints(Map<String, Object>[] constraints) {
		this.constraints = constraints;
	}
}
