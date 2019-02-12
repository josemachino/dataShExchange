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
	miShex=new Map();
	schShex=new Map();
	$("#ls_todo").html("");
    // verify that every triple constraint that has multiplicity 1 is linked	
	let missing=false;
	graphTGDs.getElements().forEach(function(element){		
		if (element.attributes.type=="shex.Type"){			
			miShex.set(element.attributes.question,[])
			var elementView=element.findView(paperTGDs);
			var intargetLinks=graphTGDs.getConnectedLinks(elementView.model, {inbound:true});
			if (intargetLinks.length==0){
				element.attributes.options.forEach(function(tc) {					  				
				  if (tc.mult=="1" || tc.mult=="+"){
					  let msg='<div class="alert alert-warning alert-dismissible fade show" role="alert"> <strong>'+element.attributes.question+'</strong> Triple constraint ('+tc.label+":"+tc.type +') needs to be linked.<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>'
					  $("#ls_todo").append(msg);					  					 					  					 
					  var tcs=miShex.get(element.attributes.question);
					  tcs.push(tc)
					  missing=true;
				  }
				});
			}else{				
				element.attributes.ports.items.forEach(function(pt) {
					if (pt.group!="inType"){
						let isCon=intargetLinks.some(function(itLink){
							return itLink.attributes.target.port==pt.id;
						});
						console.log(isCon)
						console.log(itLink)
						if(!isCon){
							var tc=pt.id.split(",");
							if (tc[2]=="1" || tc[2]=="+"){
								let msg='<div class="alert alert-warning alert-dismissible fade show" role="alert"> <strong>'+element.attributes.question+'</strong> Triple constraint ('+tc[0]+":"+tc[1]+') needs to be linked.<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>'
								$("#ls_todo").append(msg);
								var tcs=miShex.get(element.attributes.question);
								tcs.push({label:tc[0],type:tc[1],mult:tc[2]})
								missing=true;
							}
						}
					}					  
				});
			}
			var constraints=[];
			element.attributes.options.forEach(function(tc) {
				constraints.push(tc)
			})
			schShex.set(element.attributes.question,constraints)
			
		}        	
    });	
		
	//construct sql query
	let tgds=editorJSON.get();
	let TyName="TypesFact";
	let TriName="Triples";
	let ShName="SHEX";
	let c1="CREATE TABLE "+ TriName +" (s varchar,p varchar, o varchar);\n";
	let c2="CREATE TABLE "+TyName +" (term varchar,type varchar);\n";
	let c3="CREATE TABLE "+ShName+ "(typeS varchar,label varchar,typeO varchar, mult varchar);\n";	
	let chase="";
	let chaseQ="";
	let indexTM=1;
	let file2RML="@prefix rr: <http://www.w3.org/ns/r2rml#>.\n";
	try{
	tgds.rules.forEach(function(rule){
		let tmQ="";
		tmQ=tmQ.concat("<#TriplesMap").concat(indexTM).concat(">\n");
		rule.yield.forEach(function(atom){
			var q="";				
			if (atom.args.length==1){					
				q=q.concat("CREATE OR REPLACE VIEW").concat(" ").concat(TyName).concat(indexTM).concat(" (term,type) AS ");			
				//consider that the length of args in case of type atom will allays be one 			
				q=q.concat("SELECT").concat(" ").concat("CONCAT('").concat(tgds.functions[atom.args[0].function]).concat("/',").concat(atom.args[0].args[0].attr).concat(")").concat(",").concat("'").concat(atom.atom).concat("'").concat(" ").concat("FROM").concat(" ").concat(atom.args[0].args[0].rel);
				q=q.concat(";\n")			
			}else if (atom.args.length==3){//it is the triple atom
				q=q.concat("CREATE OR REPLACE VIEW").concat(" ").concat(TriName).concat(indexTM).concat(" AS ");
				q=q.concat("SELECT").concat(" ");
				let lastRel="";
				let simpleQRML="";
				atom.args.forEach(function(term){
					if (Array.isArray(term)){							
						if (typeof(term[0].function)==='undefined'){								
							q=q.concat(term[0].attr);
							lastRel=term[0].rel;
						}else{
							lastRel=term[0].args[0].rel;
							q=q.concat("CONCAT('").concat(tgds.functions[term[0].function]).concat("/',").concat(lastRel).concat(".").concat(term[0].args[0].attr).concat(")");							
						}														
					}else{
						q=q.concat(",'").concat(term).concat("',");							
					}						
				});
				let sT=atom.args[0];					
				let oT=atom.args[2];
				if (rule.constraints.length==0){					
					q=q.concat(" FROM ").concat(lastRel).concat(";\n");									
										
					simpleQRML="SELECT "+ sT[0].args[0].attr+","+oT[0].attr +" FROM "+lastRel;
				}else{
					let lsTables=[]
					let whereQ=""
					whereQ=whereQ.concat(" WHERE ");
					simpleQRML="SELECT "+ sT[0].args[0].attr+","+oT[0].attr;
					rule.constraints.forEach(function(joinQ){
						if (joinQ.type=="apply"){
							//TODO REPLACE THE FUNCTION
							q=q.replace(joinQ.left.attrs[0].attr,joinQ.right.function+"("+joinQ.left.attrs[0].attr+")");
							simpleQRML=simpleQRML.replace(joinQ.left.attrs[0].attr,joinQ.right.function+"("+joinQ.left.attrs[0].attr+")");
						}
						if (joinQ.type=="like"){
							whereQ=whereQ.concat(joinQ.left.rel).concat(".").concat(joinQ.left.attrs[0].attr).concat(" LIKE '").concat(joinQ.right.value).concat("' AND ");
						}
						if (joinQ.type=='le'){
							whereQ=whereQ.concat(joinQ.left.rel).concat(".").concat(joinQ.left.attrs[0].attr).concat(" < ").concat(joinQ.right.value).concat(" AND ");
						}
						
						if (joinQ.type=='leq'){
							whereQ=whereQ.concat(joinQ.left.rel).concat(".").concat(joinQ.left.attrs[0].attr).concat(" <= ").concat(joinQ.right.value).concat(" AND ");
						}
						
						if (joinQ.type=='gt'){
							whereQ=whereQ.concat(joinQ.left.rel).concat(".").concat(joinQ.left.attrs[0].attr).concat(" > ").concat(joinQ.right.value).concat(" AND ");
						}
						
						if (joinQ.type=='geq'){
							whereQ=whereQ.concat(joinQ.left.rel).concat(".").concat(joinQ.left.attrs[0].attr).concat(" >= ").concat(joinQ.right.value).concat(" AND ");
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
					simpleQRML=simpleQRML.concat(" FROM ");
					if (lsTables.length==0){
						q=q.concat(lastRel).concat(" ");
						simpleQRML=simpleQRML.concat(lastRel).concat(" ");
					}else{					
						lsTables.forEach(function(tableN,idx,array){
							if (idx==array.length-1){
								q=q.concat(rule.bind[tableN]).concat(" AS ").concat(tableN)
								simpleQRML=simpleQRML.concat(rule.bind[tableN]).concat(" AS ").concat(tableN)
							}else{
								q=q.concat(rule.bind[tableN]).concat(" AS ").concat(tableN).concat(",")
								simpleQRML=simpleQRML.concat(rule.bind[tableN]).concat(" AS ").concat(tableN).concat(",")
							}
						})
					}
					q=q.concat(whereQ).concat(";\n")
					simpleQRML=simpleQRML.concat(whereQ);
				}
				//add to RML query
				tmQ=tmQ.concat('rr:logicalTable [ rr:sqlQuery """ ').concat(simpleQRML).concat('""" ];');								
				tmQ=tmQ.concat("rr:subjectMap [");
				let termS=atom.args[0];
				let subTerm=termS[0];				
				let fpTerm=subTerm.args[0]
				tmQ=tmQ.concat('rr:template "').concat(tgds.functions[subTerm.function]).concat('/{').concat(fpTerm.attr).concat('}"];');
				tmQ=tmQ.concat("rr:predicateObjectMap [");
				let termP=atom.args[1];
				tmQ=tmQ.concat("rr:predicate ").concat(termP).concat(";");
				tmQ=tmQ.concat("rr:objectMap [");
				let termO=atom.args[2];
				let objTerm=termO[0];
				if (typeof(objTerm.function)!=='undefined'){
					tmQ=tmQ.concat('rr:template "').concat(tgds.functions[objTerm.function]).concat('{').concat(objTerm.attr).concat('}"];');
				}else{
					tmQ=tmQ.concat('rr:column  "').concat(objTerm.attr).concat('"];');
				}
				tmQ=tmQ.concat("].\n")
				file2RML=file2RML.concat(tmQ)
			}						
			chase=chase.concat(q);
			chaseQ=chaseQ.concat(q);
		})
		indexTM++;
		
	});
	}
	catch(err){
		alert("Error in mappings "+err.message)
	}
	let headerTri="INSERT INTO "+TriName+" ";
	let headerTy="INSERT INTO "+TyName+" ";
	let triSql=""
	let tySql=""
	for (let i=1;i< indexTM;i++){		
		tySql=tySql.concat("SELECT * FROM ").concat(TyName).concat(i).concat(" UNION ");
		triSql=triSql.concat("SELECT * FROM ").concat(TriName).concat(i).concat(" UNION ");
	}
	tySql=tySql.slice(0,-7).concat(";\n");
	triSql=triSql.slice(0,-7).concat(";\n");
	
	if (missing){
		let msgDanger='<div class="alert alert-danger alert-dismissible fade show" role="alert"> The chase SQL script generates additional rows to satisfy approximatelly ShEx schema<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>';
		$("#ls_todo").append(msgDanger);
		//completing the missing types
		var mQ="";
		//create the shex table with ShEx schema
		var schQTitle="/*FOR MISSING PROPERTIES \n 1.CREATING THE SCHEMA*/\n".concat(c3);
		let schQ="";
		schShex.forEach(function(tcs, type, miMapa){
			tcs.forEach(function(tc){
				schQ=schQ.concat("INSERT INTO ").concat(ShName).concat(" (typeS,label,typeO,mult) VALUES ('").concat(type).concat("','").concat(tc.label).concat("','").concat(tc.type).concat("','").concat(tc.mult).concat("');\n");
			})
		})			
		chaseQ=chaseQ.concat(c3).concat(schQ)
		let allTri="CREATE OR REPLACE VIEW Triples (s,p,o) AS ";
		allTri=allTri.concat(triSql)
		
		/*TODO
		 * SELECT where Sh.mult=1 and Sh.label not in select p from triples  
		*/
		let F="SELECT Ts.term,Sh.label,Sh.typeO FROM Shex AS Sh,Types AS Ts WHERE Ts.type=Sh.typeS AND Sh.mult IN ('1','+') AND CONCAT(Sh.typeS,Sh.label) NOT IN (SELECT CONCAT(Ty.type,T.p) FROM Triples as T, Types AS Ty WHERE T.s=Ty.term);\n"; 
		//CREATE OR REPLACE VIEW Types (term,type) AS SELECT DISTINCT term,type from (SELECT * FROM TypesFact1 UNION SELECT * FROM TypesFact2) ;
		let allTy="CREATE OR REPLACE VIEW Types (term,type) AS "
		allTy=allTy.concat(tySql)
		mQ=mQ.concat("/*2. CREATING A TOTAL VIEW OF TRIPLES AND TYPES */\n");
		mQ=mQ.concat(allTri);
		chaseQ=chaseQ.concat(allTri)
		mQ=mQ.concat(allTy);
		chaseQ=chaseQ.concat(allTy)
		mQ=mQ.concat("/*3. ADDING MISSING VALUES */\n");
		
		
		
		let tripleSimulation="CREATE OR REPLACE VIEW TripleSim (s,p,o) AS SELECT * FROM Triples UNION ".concat(F);
		mQ=mQ.concat(tripleSimulation);
		chaseQ=chaseQ.concat(tripleSimulation);
		let objectTypes="SELECT DISTINCT Tri.o AS term,typeO AS type FROM TripleSim AS Tri,Types AS Ty,SHEX AS Sh WHERE Tri.s=Ty.term AND Ty.type=Sh.typeS AND Sh.mult IN ('1','+') AND Sh.label=Tri.p ;\n";
		let typesM="CREATE OR REPLACE VIEW AllTyped (term,type) AS SELECT * FROM Types UNION ".concat(objectTypes);
		mQ=mQ.concat(typesM);
		chaseQ=chaseQ.concat(typesM);
		let mTypeValue="CREATE OR REPLACE VIEW MissTypeValue (o,type) AS SELECT DISTINCT Tri.o,typeO FROM TripleSim AS Tri,AllTyped AS Ty,SHEX AS Sh WHERE Tri.o=Ty.term AND Ty.type=Sh.typeO AND Sh.mult IN ('1','+');\n";
		mTypeValue=mTypeValue.concat("CREATE OR REPLACE VIEW TripleSim2 AS ").concat(" SELECT MV.o,Sh.label,Sh.typeO FROM MissTypeValue").concat(" AS MV,").concat(ShName).concat(" AS Sh WHERE MV.type=Sh.typeS AND Sh.mult IN ('1','+'); \n");
		mQ=mQ.concat(mTypeValue);
		chaseQ=chaseQ.concat(mTypeValue);
		mQ=mQ.concat("/*UNIFYING THE SET WITH THE MISSING TRIPLES*/\n");
		let solution="CREATE OR REPLACE VIEW Solution AS SELECT * FROM Triples UNION SELECT * FROM TripleSim UNION SELECT * FROM TripleSim2;\n";
		chaseQ=chaseQ.concat(solution);
		mQ=mQ.concat(solution);
		chase=chase.concat(schQTitle).concat(schQ);
		chase=chase.concat(mQ);
	}	
			
	//return a set of triples
	let comment="/*";
	comment=comment.concat("To materialize the set of triples, execute the following sentence\n")
	comment=comment.concat(c1);
	comment=comment.concat(c2);
	comment=comment.concat(headerTri).concat(triSql)
	comment=comment.concat(headerTy).concat(tySql)		
	comment=comment.concat("*/");
	chase=chase.concat(comment);	
	
	var linkC = document.createElement("a");
	var valR=$('input[name=optradio]:checked').val();	 
	if(valR=="sql"){
		linkC.download = 'chase.sql';
	    linkC.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(chase);
	}else if(valR=="rml"){
		linkC.download = 'R2RML.ttl';
		linkC.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(file2RML);
	}
    linkC.click();
    
    $("#ls_todo").fadeTo(30000, 500).slideUp(500, function(){
        $("#ls_todo").slideUp(500);
    });  
    
	$.ajax({	  
        url: "chase",
        type: "POST",
        data:  {queries:chaseQ}
      })
      .done(function(data) {
        console.log(data)        
		var triples=[];
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
        
        
        const fileStream = streamSaver.createWriteStream('triples.rj')
		const writer = fileStream.getWriter()
		const encoder = new TextEncoder		
		let uint8array = encoder.encode(data)	
		writer.write(uint8array)
		writer.close();
        
                
        
        var svgTriples = d3.select("#result_exchange").append("svg").attr("width", 800).attr("height", 600);		
		var force = d3.layout.force().size([800, 600]);		
		var graph = triplesToGraph(svgTriples,triples);		
		update(svgTriples,force,graph);
      })
      .fail(function(jqXHR, textStatus, errorThrown) {        
        console.log(textStatus);
      })
      .always(function() {
        
      });
	
	}
});

var side_exchange_view = new sideExchangeView({ el: $("#result_container") });
