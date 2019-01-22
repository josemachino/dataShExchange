var containerJSONEditor = document.getElementById("tgds_list");
var options = {};
var editorJSON = new JSONEditor(containerJSONEditor, options);
var sideExchangeView = Backbone.View.extend({
initialize: function(){
    this.render();
},
render: function(){
    var template = _.template( $("#exchange_template").html(), {} );
    this.$el.html( template );
},
events: {
     "submit":"exchange"
},
exchange:function(e){
	e.preventDefault();
    // verify that every triple constraint that has multiplicity 1 is linked
	graphTGDs.getElements().forEach(function(element){		
		if (element.attributes.type=="shex.Type"){			
			element.attributes.options.forEach(function(tc) {	
				console.log(tc)
				  if (tc.mult=="1"){
					  var elementView=element.findView(paperTGDs);
					  var intargetLinks=graphTGDs.getConnectedLinks(elementView.model, {inbound:true});
					  if (intargetLinks.length==0)
						  alert("Need "+tc.label)
					  console.log(intargetLinks)
					  //add to a list to show what needs to be achieved in order to obtain a correct chase
					  
				  }
			});
		}        	
    });	
	//construct sql query
	let tgds=editorJSON.get();
	let TyName="TypesFact";
	let TriName="Triples";
	let c1="create table Triples(s varchar,p varchar, o varchar)"
	let c2="create table TypesFact(term varchar,type varchar)"	
	tgds.rules.forEach(function(rule){
		
		rule.yield.forEach(function(atom){
			var q="";				
			if (atom.args.length==1){					
				q=q.concat("insert into").concat(" ").concat(TyName).concat(" ").concat("(").concat("term,type").concat(") ");			
				//consider that the length of args in case of type atom will allays be one 			
				q=q.concat("SELECT").concat(" ").concat("CONCAT('").concat(tgds.functions[atom.args[0].function]).concat("',").concat(atom.args[0].args[0].attr).concat(")").concat(",").concat("'").concat(atom.atom).concat("'").concat(" ").concat("FROM").concat(" ").concat(atom.args[0].args[0].rel);
				q=q.concat(";")			
			}else if (atom.args.length==3){//it is the triple atom
				q=q.concat("insert into").concat(" ").concat(TriName).concat(" ").concat("(").concat("s,p,o").concat(") ");
				q=q.concat("SELECT").concat(" ");
				let lastRel="";
				atom.args.forEach(function(term){
					if (Array.isArray(term)){							
						if (typeof(term[0].function)==='undefined'){								
							q=q.concat(term[0].attr);
							lastRel=term[0].rel;
						}else{								
							q=q.concat("CONCAT('").concat(tgds.functions[term[0].function]).concat("',").concat(term[0].args[0].attr).concat(")");
							lastRel=term[0].args[0].rel;
						}														
					}else{
						q=q.concat(",'").concat(term).concat("',");							
					}						
				});
				if (rule.constraints.length==0){					
					q=q.concat(" FROM ").concat(lastRel).concat(";");						
				}else{
					let lsTables=[]
					let whereQ=""
					whereQ=whereQ.concat(" WHERE ");
					rule.constraints.forEach(function(joinQ){
						if (joinQ.type=='le'){
							
						}
						
						if (joinQ.type=='leq'){
							
						}
						
						if (joinQ.type=='gt'){
							
						}
						
						if (joinQ.type=='geq'){
							
						}
						if (joinQ.type=='eq' && typeof(joinQ.right.rel)!=='undefined'){							
							if (!lsTables.includes(joinQ.left.rel))
								lsTables.push(joinQ.left.rel)
							if (!lsTables.includes(joinQ.right.rel))
								lsTables.push(joinQ.right.rel)
							let indexAtt=0;
							joinQ.left.attrs.forEach(function(attribute){
								whereQ=whereQ.concat(joinQ.left.rel).concat(".").concat(attribute.name).concat("=").concat(joinQ.right.rel).concat(".").concat(joinQ.right.attrs[indexAtt].name).concat(" AND ");
								indexAtt++;
							})
						}	
					});
					whereQ=whereQ.slice(0,-5)
					q=q.concat(" FROM ");
					lsTables.forEach(function(tableN,idx,array){
						if (idx==array.length-1){
							q=q.concat(rule.bind[tableN]).concat(" AS ").concat(tableN)
						}else{
							q=q.concat(rule.bind[tableN]).concat(" AS ").concat(tableN).concat(",")
						}
					})					
					q=q.concat(whereQ)
				}
			}
			console.log(q)
		})
	})
	//[[{"function":"f1","args":[{"rel":"Contact","attr":"id"}]}],"name",[{"rel":"Contact","attr":"firstname"}]]}]
	//var tdata='{"functions":{},"rules":[{"bind":{"Company":"Company","Contact":"Contact","table3":"table3","table2":"table2","table1":"table1"},"constraints":[],"yield":[{"atom":"ProductShape","args":[{"function":"f1","args":[{"rel":"Contact","attr":"id"}]}]},{"atom":"Triple","args":[[{"function":"f1","args":[{"rel":"Contact","attr":"id"}]}],"name",[{"rel":"Contact","attr":"firstname"}]]}]}]}'
	/*$.ajax({
	 * 
        url: "chase",
        type: "POST",
        data:  JSON.stringify(editorJSON.get()),
        processData: false,
        contentType: "application/json"
      })
      .done(function(data) {
        console.log(data)
        
        $('#result_exchange').html(data)
      })
      .fail(function(jqXHR, textStatus, errorThrown) {        
        console.log(textStatus);
      })
      .always(function() {
        
      });*/
	
	}
});

var side_exchange_view = new sideExchangeView({ el: $("#result_container") });
