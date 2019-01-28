function getPositionFromDB(graphObj){
    var maxValue=0    
    var widthLocal=0
    graphObj.getElements().forEach(function(element){    
        if (element.attributes.type=="db.Table"){            
            if (maxValue<element.attributes.position.x){
                maxValue=element.attributes.position.x;
                widthLocal=element.attributes.size.width;                
            }        
        }
        
    });
    maxValue=maxValue+widthLocal+300
    return {x:maxValue,y:0}
}

function drawRefTypes(g,expressions,map){    
    for (var i=0;i< expressions.length ;i++){        
        /*for (var j=0;j< tables[i].items.length ;j++){           	
            if (tables[i].items[j].ref){                   
            	linkDataBase(g,map.get(), portSource, target,portTarget)                               
            }
        }*/
    }    
}

var mapSymbols=new Map();
var expressions=new Map();
var SearchView = Backbone.View.extend({
initialize: function(){
    this.render();
},
render: function(){
    var template = _.template( $("#search_template").html(), {} );
    this.$el.html( template );
},
events: {
    "change input[type=file]": "doSearch"
},
doSearch: function( event ){
    // Button clicked, you can access the element that was clicked with event.currentTarget      
	
    var reader = new FileReader();
    reader.onload = function onReaderLoad(event){        
	    var obj = JSON.parse(event.target.result);        
		mapSymbols=new Map();
	    positionShexType=getPositionFromDB(graphTGDs)
    
	    obj.shapes.forEach(function(shape){
	        if (shape.type=='Shape'){                
	            tcs=[];
	            if (shape.expression.type=='EachOf'){
	                tc={};
	                shape.expression.expressions.forEach(function(expression){                      
	                    if (expression.type=='TripleConstraint'){
	                        typeLabel='';
	                        if (typeof(expression.valueExpr)==='string'){
	                            typeLabel=expression.valueExpr.split('/').pop();
	                        }else{
	                            typeLabel='Literal';
	                        }
	                        multiplicity='';
	                        if (typeof(expression.max)==='undefined'){
	                            multiplicity='1';
	                        }else{
	                            if (expression.max==1 && expression.min==0){
	                            	multiplicity='?';
	                            }
	                            if (expression.max==-1 && expression.min==0){
	                            	multiplicity='*';
	                            }else{
	                            	multiplicity='+';
	                            }
	                        }
	                        
	                                        
	                    tc={label:expression.predicate.split('/').pop(),type:typeLabel, mult:multiplicity};                        
	                    tcs.push(tc);
	                    }
	                });      
	                var num=mapSymbols.size+1;
	                mapSymbols.set("f"+num,shape.id);
	                var sExpression=createShexType(shape.id.split('/').pop(),tcs,positionShexType);
	                console.log(sExpression)
	                graphTGDs.addCell(sExpression);                
	            }
	            
	        }
	    });
    
	    //draw 	references from
	    //drawRefTypes()
	    
		paperTGDs.fitToContent({padding: 50,allowNewOrigin: 'any' });
    };
    reader.readAsText(event.currentTarget.files[0]);    
    
    var form = new FormData();
	form.append("file", event.currentTarget.files[0]);	
	$.ajax({
        url: "uploadShexFile",
        type: "POST",
        data: form,
        processData: false,
        contentType: false,
        enctype: 'multipart/form-data'
      })
      .done(function(data) {        
    	  
		console.log("File Uploaded")
      })
      .fail(function(jqXHR, textStatus, errorThrown) {        
        console.log(textStatus);
      })
      .always(function() {
        
      });
    
}
});

var search_view = new SearchView({ el: $("#search_container") });
