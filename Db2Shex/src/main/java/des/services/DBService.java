package des.services;

import org.springframework.stereotype.Service;

import des.controllers.FullyTypedModel;
@Service
public class DBService {
	public FullyTypedModel getResult() {
		FullyTypedModel ftm=new FullyTypedModel();
		return  ftm;
	}
}
