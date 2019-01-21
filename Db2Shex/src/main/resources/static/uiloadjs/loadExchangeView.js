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
			if (element.type=="shex.Type"){
				element.options.forEach(function(tc) {	
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
	tgds.yield.forEach(function(atom){
		var q=""		
		if (atom.args.length==1){
			q.concat.("insert into").concat(" ").concat(TyName).concat(" ").concat("(").concat("term,type").concat(")");
			//consider that the length of args in case of type atom will allays be one 			
			q.concat("SELECT").concat(" ").concat("CONCAT(").concat(tgds.functions[atom.args[0].function]).concat(",").concat(atom.args[0].args[0].attr).concat(")").concat(",").concat(atom.atom).concat("FROM").concat(" ").concat(atom.args[0].args[0].rel);
			q.concat(";")
			
		}else if (atom.args.length==3){//it is the triple atom
			q.concat.("insert into").concat(" ").concat(TriName).concat(" ").concat("(").concat("term,type").concat(")");
			atom.args.forEach(function(term){
				q.concat("SELECT").concat(" ").concat("CONCAT(").concat(tgds.functions[atom.args[0].function]).concat(",").concat(atom.args[0].args[0].attr).concat(")")
			})
		}
	})
	[[{"function":"f1","args":[{"rel":"Contact","attr":"id"}]}],"name",[{"rel":"Contact","attr":"firstname"}]]}]
	//var tdata='{"functions":{},"rules":[{"bind":{"Company":"Company","Contact":"Contact","table3":"table3","table2":"table2","table1":"table1"},"constraints":[],"yield":[{"atom":"ProductShape","args":[{"function":"f1","args":[{"rel":"Contact","attr":"id"}]}]},{"atom":"Triple","args":[[{"function":"f1","args":[{"rel":"Contact","attr":"id"}]}],"name",[{"rel":"Contact","attr":"firstname"}]]}]}]}'
	/*$.ajax({
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
