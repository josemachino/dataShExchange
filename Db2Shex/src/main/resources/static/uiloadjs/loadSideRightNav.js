function simpleGraph(gObj){
    let simpleGraph=[];
    for (let cell of gObj){
        if (cell.type=="db.Table" || cell.type=="shex.Type"){
            let table={type:cell.type,id:cell.id,name:cell.question,attrs:cell.options, position:cell.position, ports:cell.ports.items}
            simpleGraph.push(table)
        }
        if (cell.type=="standard.Link"){
			var transformed=""
			var joinPat=""
			/*for (label of cell.labels()){
				console.log(label)
				if (label.attrs.text.text.includes(")")){
					transformed=label.attrs.text.text
				}							
			}*/
			
            let link={type:cell.type,kind:(((cell||{}).attrs|| {}).line||{}).stroke,source:cell.source,target:cell.target,"join-path":"","display-params":"",transformed:transformed}
            simpleGraph.push(link)
        }
    }
	return simpleGraph;
}

var sideView = Backbone.View.extend({
initialize: function(){
    this.render();
},
render: function(){
    var template = _.template( $("#sideright_template").html(), {} );
    this.$el.html( template );
},
events: {
     "click #exportst":"export",     
     "change #importst input[type=file]":"import",
     "click .edit_tgd":"modifyTGD",
     "click .edit_green_tgd":"modifyLinkGreen",
     "click .edit_red_tgd":"modifyLinkRed",
     "click .rem_param_blue_tgd":"removeParam",
},
import:function(e){
	var reader = new FileReader();
    reader.onload = function onReaderLoad(event){        
    	var obj = JSON.parse(event.target.result);
    	console.log(obj)
    	graphTGDs.fromJSON(obj);    	
    };
    reader.readAsText(e.currentTarget.files[0]);
	
	
},
export:function(e){
    var graphJson=graphTGDs.toJSON()
    //simpleGraph(graphJson.cells)
    $('#syntax_tgds').rainbowJSON({
            maxElements: 1000,
            maxDepth: 10,
            json: simpleGraph(graphJson.cells)
			//json: graphJson.cells
        });
	const jsonStr = JSON.stringify(graphJson);
    var link = document.createElement("a");
    link.download = 'gstgds.json';
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(jsonStr);
    //link.href=window.URL.createObjectURL('data:text/plain;charset=utf-8,' + encodeURIComponent(jsonStr))
    link.click();
},
modifyTGD: function(e){    
    
    let auxLink;
    for (var link of graphTGDs.getLinks()){        
        if (link.id==e.currentTarget.id){
            auxLink=link;
            break;
        }
    }
    let linkView=auxLink.findView(paperTGDs)    
    var tablesConnected=[{id:linkView.sourceView.model.id,text:linkView.sourceView.model.attributes.question}];                        
    var intargetLinks=graphTGDs.getConnectedLinks(linkView.targetView.model, {inbound:true});
    var portType=linkView.targetView.model.attributes.ports.items[0];
    var tLinks=getLinkTarget(intargetLinks,portType);                                        
    
    for (var tlink of tLinks){							
        var tView=tlink.findView(paperTGDs);  							
        var visited=[];
        getJoinsTableFromTo(linkView.sourceView.model,tablesConnected,tView.sourceView.model.id,visited,tablesConnected[0]);	
    }
    console.log(tablesConnected)
    if (tablesConnected.length>1){
        loadModalPathAttributeDetail(auxLink,tablesConnected);
    }else{            
        loadModalFunctions(auxLink);
    }
    
},
modifyLinkGreen:function(e){
    var auxKeySymbols=[];
    for (const key of mapSymbols.keys()) {
        var obj={text:key};                        
        auxKeySymbols.push(obj);
    }
    let auxLink;
    for (var link of graphTGDs.getLinks()){        
        if (link.id==e.currentTarget.id){
            auxLink=link;
            break;
        }
    }
    let linkView=auxLink.findView(paperTGDs)
    var pks=getKeys(linkView.sourceView.model.attributes.options);
    if (pks.length>1 || mapSymbols.size>1){        
        loadModalGreenFromTable(auxLink,auxKeySymbols,linkView.sourceView.model.attributes.options,mapSymbols);
    }
},
modifyLinkRed:function(e){
	var auxKeySymbols=[];
    for (const key of mapSymbols.keys()) {
        var obj={text:key};                        
        auxKeySymbols.push(obj);
    }
    let auxLink;
    for (var link of graphTGDs.getLinks()){        
        if (link.id==e.currentTarget.id){
            auxLink=link;
            break;
        }
    }
    let linkView=auxLink.findView(paperTGDs);
	var tablesConnected=[{id:linkView.sourceView.model.id,text:linkView.sourceView.model.attributes.question}];   	
    var intargetLinks=graphTGDs.getConnectedLinks(linkView.targetView.model, {inbound:true});
    var portType=linkView.targetView.model.attributes.ports.items[0];
    var tLinks=getLinkTarget(intargetLinks,portType);                                        
    let sourceAtt=getSourceOptionNameLinkView(linkView)
    for (var tlink of tLinks){							
        var tView=tlink.findView(paperTGDs);  							
        var visited=[];
        getJoinsTableFromTo(linkView.sourceView.model,tablesConnected,tView.sourceView.model.id,visited,tablesConnected[0]);	
    }
    console.log(tablesConnected)
    if (tablesConnected.length>1 || auxKeySymbols.length>2){
    	loadModalRedFromTable(auxLink,auxKeySymbols,tablesConnected,mapSymbols,sourceAtt,intargetLinks);
	}
    //if there is more than two functions symbols load to select which one
    //if there are many paths to show
},
removeParam:function(e){
    let auxLink;
    for (var link of graphTGDs.getLinks()){        
        if (link.id==e.currentTarget.id){
            auxLink=link;
            break;
        }
    }
    if (auxLink.labels().length>1){
        auxLink.removeLabel(-1)
        $('#param_'+auxLink.id).html("")
    }
}
});

var side_view = new sideView({ el: $("#sidebar-right") });
