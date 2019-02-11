describe("Mappings", function() {
  var graphST;
  var song;

  beforeEach(function() {
	graphST=new joint.dia.Graph;
  });

  it("Mapping two relational attributes to the same Triple constraint", function() {
	/*var reader = new FileReader();
    reader.onload = function onReaderLoad(event){        
    	var obj = JSON.parse(event.target.result);
    	mapSymbols=new Map();
    	mapTableIdCanvas=new Map();
    	//TODO create the table of mappings and load the global variables
    	graphST.fromJSON(obj);   	    	 	
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
    	
    };
	reader.readAsText(e.currentTarget.files[0]);*/
	  $.ajax({	  
	        url: "tgd/twoAttSameTC",
	        type: "GET",
	        async: false
	      })
	      .done(function(data) {
	        console.log(data)
	      })
	      .fail(function(jqXHR, textStatus, errorThrown) {        
	        console.log(textStatus);
	      })
	      .always(function() {
	        
	      });
	  
	  $.ajax({	  
	        url: "test",
	        type: "POST",
	        data:{nameTest:"twoAttSameTC",queries:},
	        async: false
	      })
	      .done(function(data) {
	        console.log(data)
	      })
	      .fail(function(jqXHR, textStatus, errorThrown) {        
	        console.log(textStatus);
	      })
	      .always(function() {
	        
	      });
	var triples=[]
	expect([]).toEqual(triples);
  });
})