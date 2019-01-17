package des.models;

import java.util.Map;

public class TGDS {
	private Map<String,String> functions;
	private Rule[] rules;
	public Map<String, String> getFunctions() {
		return functions;
	}
	public void setFunctions(Map<String, String> functions) {
		this.functions = functions;
	}
	public Rule[] getRules() {
		return rules;
	}
	public void setRules(Rule[] rules) {
		this.rules = rules;
	}
}
