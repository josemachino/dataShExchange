describe("Mappings", function() {
  var graphST;  
  var exchange;
  var paperTGDs;
  beforeEach(function() {
	graphST=new joint.dia.Graph;
	exchange=new Exchange();
	paperTGDs = new joint.dia.Paper({
		el: document.getElementById('mydb'),
		model:graphST,		
	    width: 10,
	    height: 10,    
	    gridSize: 10,
	    drawGrid: true,
	    snapLinks: { radius: 75 },
	    background: {
	        color: 'rgba(0, 255, 0, 0.3)'
	    },
	    snapLinks: {radius:75},
	    interactive: { labelMove: true },
	    linkPinning: false,
	    embeddingMode: true,	    
	    defaultConnectionPoint: { name: 'boundary' },
	    defaultLink:new joint.shapes.standard.Link()
	});
  });

  it("Mapping two relational attributes to the same Triple constraint", function() {
	  var triples=[];
	  $.ajax({	  
	        url: "tgd/student_twoAttSameTC",
	        type: "GET",
	        async: false
	      })
	      .done(function(data) {	    	  
	    	 graphST.fromJSON(data);	
	    	 let mapSymbols=new Map();
	     	 let mapTableIdCanvas=new Map();
	     	 let num=1;
	     	 let namespace="http://example.com/"
	     	 graphST.getElements().forEach(function(element){
	    		if (element.attributes.type=="db.Table"){
	    			mapTableIdCanvas.set(element.attributes.question,element.id)
	    		}
	    		if (element.attributes.type=="shex.Type"){
	    			mapSymbols.set("f"+num,namespace+element.attributes.question);
	    			num++;
	    		}
	     	 });	     	 
	    	 exchange.generateQuery(mapSymbols,graphST,paperTGDs,mapTableIdCanvas);	    	 	    	 
	      })
	      .fail(function(jqXHR, textStatus, errorThrown) {        
	        console.log(textStatus);
	      })
	      .always(function() {
	        
	      });		  
	  $.ajax({	  
	        url: "test",
	        type: "POST",
	        data:{nameTest:"student_twoAttSameTC",queries:exchange.chaseQueryDB},
	        async: false
	      })
	      .done(function(data) {
	        console.log(data);
	        for(var uri in data){
	        	  for(var property in data[uri]){
	        	     for(var i=0; i<data[uri][property].length; i++ ){
	        	          var s = uri;
	        	          var p = property;
	        	          var o = data[uri][property][i]['value'];
	        	          /*var o_type = data[uri][property][i]['type'];
	        	          var o_lang = data[uri][property][i]['lang'];
	        	          var o_datatype = data[uri][property][i]['datatype'];*/	        	          
	        	          triples.push({subject:s,predicate:p,object:o})
	        	     }
	        	  }  
	        }
	      })
	      .fail(function(jqXHR, textStatus, errorThrown) {        	        
	        console.log(errorThrown)
	      })
	      .always(function() {
	        
	      });
	console.log(triples)
	var triplesExpected=[
		{ subject: 'http://example.com/StudentShape/200', predicate: 'helps', object: 'CourseShape' },
		{ subject: 'http://example.com/StudentShape/200', predicate: 'course', object: 'CourseShape' },
		{ subject: 'http://example.com/StudentShape/200', predicate: 'name', object: 'Rosa' },
		{ subject: 'http://example.com/StudentShape/200', predicate: 'phone', object: 'Literal' },
		{ subject: 'http://example.com/StudentShape/101', predicate: 'helps', object: 'CourseShape' },
		{ subject: 'http://example.com/StudentShape/101', predicate: 'course', object: 'CourseShape' },
		{ subject: 'http://example.com/StudentShape/101', predicate: 'name', object: 'Juan' },
		{ subject: 'http://example.com/StudentShape/101', predicate: 'phone', object: 'Literal' },
		{ subject: 'http://example.com/StudentShape/201', predicate: 'helps', object: 'CourseShape' },
		{ subject: 'http://example.com/StudentShape/201', predicate: 'course', object: 'CourseShape' },
		{ subject: 'http://example.com/StudentShape/201', predicate: 'phone', object: 'Literal' },
		{ subject: 'http://example.com/StudentShape/201', predicate: 'name', object: 'Pedro' },
		{ subject: 'CourseShape', predicate: 'prof', object: 'ProfShape' },
		{ subject: 'CourseShape', predicate: 'name', object: 'Literal' },
		{ subject: 'http://example.com/StudentShape/100', predicate: 'helps', object: 'CourseShape' },
		{ subject: 'http://example.com/StudentShape/100', predicate: 'course', object: 'CourseShape' },
		{ subject: 'http://example.com/StudentShape/100', predicate: 'name', object: 'Ana' },
		{ subject: 'http://example.com/StudentShape/100', predicate: 'phone', object: 'Literal' }
		];
	expect(triplesExpected).toEqual(triples);
  });
  
  
  it("Mapping single green and blue links", function() {
	  var triples=[];
	  $.ajax({	  
	        url: "tgd/supplier_singleGB",
	        type: "GET",
	        async: false
	      })
	      .done(function(data) {	    	  
	    	 graphST.fromJSON(data);	
	    	 let mapSymbols=new Map();
	     	 let mapTableIdCanvas=new Map();
	     	 let num=1;
	     	 let namespace="http://example.com/"
	     	 graphST.getElements().forEach(function(element){
	    		if (element.attributes.type=="db.Table"){
	    			mapTableIdCanvas.set(element.attributes.question,element.id)
	    		}
	    		if (element.attributes.type=="shex.Type"){
	    			mapSymbols.set("f"+num,namespace+element.attributes.question);
	    			num++;
	    		}
	     	 });	     	 
	    	 exchange.generateQuery(mapSymbols,graphST,paperTGDs,mapTableIdCanvas);	    	 	    	 
	      })
	      .fail(function(jqXHR, textStatus, errorThrown) {        
	        console.log(textStatus);
	      })
	      .always(function() {
	        
	      });		  
	  $.ajax({	  
	        url: "test",
	        type: "POST",
	        data:{nameTest:"supplier_singleGB",queries:exchange.chaseQueryDB},
	        async: false
	      })
	      .done(function(data) {
	        console.log(data);
	        for(var uri in data){
	        	  for(var property in data[uri]){
	        	     for(var i=0; i<data[uri][property].length; i++ ){
	        	          var s = uri;
	        	          var p = property;
	        	          var o = data[uri][property][i]['value'];	        	          	        	         
	        	          triples.push({subject:s,predicate:p,object:o})
	        	     }
	        	  }  
	        }
	      })
	      .fail(function(jqXHR, textStatus, errorThrown) {        	        
	        console.log(errorThrown)
	      })
	      .always(function() {
	        
	      });
	console.log(triples)
	var triplesExpected=[
		{ subject: 'http://example.com/SupplierShape/P1', predicate: 'supplier', object: 'SupplierShape' },
		{ subject: 'http://example.com/SupplierShape/P1', predicate: 'name', object: 'Carrot' },
		{ subject: 'http://example.com/SupplierShape/P2', predicate: 'supplier', object: 'SupplierShape' },
		{ subject: 'http://example.com/SupplierShape/P2', predicate: 'name', object: 'Potatoe' },
		{ subject: 'http://example.com/ProductShape/S1', predicate: 'name', object: 'Supp_North' },
		{ subject: 'http://example.com/SupplierShape/P3', predicate: 'supplier', object: 'SupplierShape' },
		{ subject: 'http://example.com/SupplierShape/P3', predicate: 'name', object: 'Onion' },
		{ subject: 'http://example.com/ProductShape/S2', predicate: 'name', object: 'Supp_South' },
		{ subject: 'SupplierShape', predicate: 'name', object: 'Literal' }
		];
	expect(triplesExpected).toEqual(triples);
  });
  
  it("Mapping single green, blue and red links", function() {
	  var triples=[];
	  $.ajax({	  
	        url: "tgd/supplier_singleGBR",
	        type: "GET",
	        async: false
	      })
	      .done(function(data) {	    	  
	    	 graphST.fromJSON(data);	
	    	 let mapSymbols=new Map();
	     	 let mapTableIdCanvas=new Map();
	     	 let num=1;
	     	 let namespace="http://example.com/"
	     	 graphST.getElements().forEach(function(element){
	    		if (element.attributes.type=="db.Table"){
	    			mapTableIdCanvas.set(element.attributes.question,element.id)
	    		}
	    		if (element.attributes.type=="shex.Type"){
	    			mapSymbols.set("f"+num,namespace+element.attributes.question);
	    			num++;
	    		}
	     	 });	     	 
	    	 exchange.generateQuery(mapSymbols,graphST,paperTGDs,mapTableIdCanvas);	    	 	    	 
	      })
	      .fail(function(jqXHR, textStatus, errorThrown) {        
	        console.log(textStatus);
	      })
	      .always(function() {
	        
	      });		  
	  $.ajax({	  
	        url: "test",
	        type: "POST",
	        data:{nameTest:"supplier_singleGBR",queries:exchange.chaseQueryDB},
	        async: false
	      })
	      .done(function(data) {
	        console.log(data);
	        for(var uri in data){
	        	  for(var property in data[uri]){
	        	     for(var i=0; i<data[uri][property].length; i++ ){
	        	          var s = uri;
	        	          var p = property;
	        	          var o = data[uri][property][i]['value'];	        	          	        	         
	        	          triples.push({subject:s,predicate:p,object:o})
	        	     }
	        	  }  
	        }
	      })
	      .fail(function(jqXHR, textStatus, errorThrown) {        	        
	        console.log(errorThrown)
	      })
	      .always(function() {
	        
	      });
	console.log(triples)
	var triplesExpected=[
		];
	expect(triplesExpected).toEqual(triples);
  });
})