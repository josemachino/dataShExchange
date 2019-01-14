package models;

import java.util.Map;

public class Rule {	
	private Map<String,String> bind;
	private Map<String,Object> constraints;
	private RelAtom[] yield;
}
