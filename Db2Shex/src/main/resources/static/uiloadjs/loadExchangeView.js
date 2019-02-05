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
	$("#ls_todo").html()
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
						if(!intargetLinks.some(function(itLink){
							return itLink.attributes.target.port==pt.id;
						})){
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
	let indexTM=1;
	let file2RML="@prefix rr: <http://www.w3.org/ns/r2rml#>.\n";
	try{
	tgds.rules.forEach(function(rule){
		let tmQ="";
		tmQ=tmQ.concat("<#TriplesMap").concat(indexTM).concat(">\n");
		rule.yield.forEach(function(atom){
			var q="";				
			if (atom.args.length==1){					
				q=q.concat("CREATE OR REPLACE VIEW").concat(" [").concat(TyName).concat(indexTM).concat("] AS ");			
				//consider that the length of args in case of type atom will allays be one 			
				q=q.concat("SELECT").concat(" ").concat("CONCAT('").concat(tgds.functions[atom.args[0].function]).concat("/',").concat(atom.args[0].args[0].attr).concat(")").concat(",").concat("'").concat(atom.atom).concat("'").concat(" ").concat("FROM").concat(" ").concat(atom.args[0].args[0].rel);
				q=q.concat(";\n")			
			}else if (atom.args.length==3){//it is the triple atom
				q=q.concat("CREATE OR REPLACE VIEW").concat(" [").concat(TriName).concat(indexTM).concat("] AS ");
				q=q.concat("SELECT").concat(" ");
				let lastRel="";
				let simpleQRML="";
				atom.args.forEach(function(term){
					if (Array.isArray(term)){							
						if (typeof(term[0].function)==='undefined'){								
							q=q.concat(term[0].attr);
							lastRel=term[0].rel;
						}else{								
							q=q.concat("CONCAT('").concat(tgds.functions[term[0].function]).concat("/',").concat(term[0].args[0].attr).concat(")");
							lastRel=term[0].args[0].rel;
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
		tySql=tySql.concat("SELECT * FROM ").concat(TyName).concat(i).concat("\n").concat(" UNION \n");
		triSql=triSql.concat("SELECT * FROM ").concat(TriName).concat(i).concat("\n").concat(" UNION \n");
	}
	tySql=tySql.slice(0,-9).concat(";\n");
	triSql=triSql.slice(0,-9).concat(";\n");
	
	if (missing){
		let msgDanger='<div class="alert alert-danger alert-dismissible fade show" role="alert"> The chase SQL script generates additional rows to satisfy approximatelly ShEx schema<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>';
		$("#ls_todo").append(msgDanger);
		//completing the missing types
		var mQ="";
		//create the shex table with ShEx schema
		var schQ="/*FOR MISSING PROPERTIES \n 1.CREATING THE SCHEMA*/\n".concat(c3);
		schShex.forEach(function(tcs, type, miMapa){
			tcs.forEach(function(tc){
				schQ=schQ.concat("INSERT INTO ").concat(ShName).concat(" (typeS,label,typeO,mult) VALUES ('").concat(type).concat("','").concat(tc.label).concat("','").concat(tc.type).concat("','").concat(tc.mult).concat("');\n");
			})
		})
		
		/*miShex.forEach(function(tcs, type, miMapa) {
				tcs.forEach(function(tc){
					mQ=mQ.concat("INSERT INTO ").concat(TriName).concat(" (s,p,o)").concat(" SELECT term,'").concat(tc.label).concat("','").concat(tc.type).concat("' FROM TypesFact WHERE type='").concat(type).concat("';\n");
					mQ=mQ.concat("INSERT INTO ").concat(TyName).concat(" (term,type) VALUES ('").concat(tc.type).concat("','").concat(tc.type).concat("');\n")
				})
		})*/
		
		
		let allTri="CREATE OR REPLACE VIEW Triples (s,p,o) AS ";
		allTri=allTri.concat(triSql)
		let allTy="CREATE OR REPLACE VIEW Types (term,type) AS "
		allTy=allTy.concat(tySql)
		mQ=mQ.concat("/*2. CREATING A TOTAL VIEW OF TRIPLES AND TYPES */\n");
		mQ=mQ.concat(allTri);
		mQ=mQ.concat(allTy);
		mQ=mQ.concat("/*3. ADDING MISSING VALUES */\n");
		
		let mTypeValue="CREATE OR REPLACE VIEW MissTypeValue (o,type) AS SELECT Tri.o,typeO FROM Triples AS Tri,Types AS Ty,SHEX AS Sh WHERE Tri.o=Ty.term AND Ty.type=Sh.typeO AND Sh.mult IN ('1','+');\n";
		mQ=mQ.concat(mTypeValue);
		mQ=mQ.concat("CREATE OR REPLACE VIEW [TriplesMiss] AS ").concat(" SELECT Tri.o,Sh.label,Sh.typeO FROM MissTypeValue").concat(" AS MV,").concat(ShName).concat(" AS Sh WHERE MV.type=Sh.typeS AND Sh.mult IN ('1','+'); \n");
		mQ=mQ.concat("/*UNIFYING THE SET WITH THE MISSING TRIPLES*/\n");
		mQ=mQ.concat("CREATE OR REPLACE VIEW Solution AS SELECT * FROM Triples UNION SELECT * FROM TriplesMiss;\n");
		chase=chase.concat(schQ);
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
	
	/*const fileStream = streamSaver.createWriteStream('filename.txt')
	const writer = fileStream.getWriter()
	const encoder = new TextEncoder
	let data = 'a'.repeat(1024)
	let uint8array = encoder.encode(data + "\n\n")

	writer.write(uint8array)
	writer.close()*/
	
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
        data:  chase,
        processData: false,
        contentType: "text/plain"
      })
      .done(function(data) {
        console.log(data)
        
        $('#result_exchange').html(data)
      })
      .fail(function(jqXHR, textStatus, errorThrown) {        
        console.log(textStatus);
      })
      .always(function() {
        
      });
	
	}
});

var side_exchange_view = new sideExchangeView({ el: $("#result_container") });
