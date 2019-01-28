//TODO
/*
 * Set the functions iris in the variable in stTGD2 and in jsoneditor
 * Edit TGDs mapping view
 * Deleting link green many times , it arrives when it does not remove the blue links
 * Deleting red links cause problems
 * Recommend what to do when user is going to exchange
 */
//https://www.cs.ox.ac.uk/boris.motik/pubs/bkmmpst17becnhmarking-chase.pdf
//http://www.dia.uniroma3.it/~papotti/Projects/DataExchange/pdf/vldb10.pdf
//https://perso.liris.cnrs.fr/angela.bonifati/teaching/dbdm/DBDM-dataIntegration3.pdf
//https://github.com/josdejong/jsoneditor
//https://github.com/Rathachai/d3rdf
//link red verify editing
//https://github.com/ejgallego/jscoq
//https://i11www.iti.kit.edu/_media/teaching/winter2016/graphvis/graphvis-ws16-v6.pdf
//https://github.com/clientIO/joint/issues/455
//https://arxiv.org/ftp/arxiv/papers/1807/1807.09368.pdf
//https://github.com/wenzhixin/bootstrap-table/issues/453
//https://github.com/wenzhixin/bootstrap-table-examples/blob/master/methods/removeByUniqueId.html
//http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.144.8213&rep=rep1&type=pdf
//https://rtsys.informatik.uni-kiel.de/~biblio/downloads/theses/pkl-mt.pdf
//http://jsfiddle.net/e3nk137y/791/
//https://github.com/wenzhixin/bootstrap-table-examples/blob/master/options/custom-toolbar.html
//https://stackoverflow.com/questions/3642035/jquerys-append-not-working-with-svg-element
//https://groups.google.com/forum/#!msg/jointjs/bR5kBCERzdU/OW-esjswCAAJ
//https://github.com/clientIO/joint/blob/master/tutorials/link-tools.html
//https://resources.jointjs.com/docs/jointjs/v2.2/joint.html#dia.Paper.events
//https://stackoverflow.com/questions/20769850/changesource-event-in-jointjs
//https://github.com/ccoenraets/directory-backbone-bootstrap/tree/master/js/models
//https://stackoverflow.com/questions/34296234/is-there-a-safe-way-to-delete-a-jointjs-paper-graph
//https://github.com/haycco/spring-boot-backbone-example
//http://resources.jointjs.com/docs/jointjs/v2.2/joint.html#joint.dia.Paper
//http://www.irisa.fr/LIS/ferre/sparklis/osparklis.html 
//https://github.com/leafygreen/backbone-bootstrap-modals
//https://stackoverflow.com/questions/8217419/how-to-determine-if-javascript-array-contains-an-object-with-an-attribute-that-e
//https://stackoverflow.com/questions/44155471/how-to-create-bootstrap-modal-with-transparent-background
//https://www.baeldung.com/spring-boot-sql-import-files
//http://buildingonmud.blogspot.com/2009/06/convert-string-to-unicode-in-javascript.html
let comparisonOp=["le","leq","gt","geq"]
let widthSVGForLine='300px';
let widthSVGLine='282';
var graphTGDs = new joint.dia.Graph;
var paperTGDs = new joint.dia.Paper({
    el: document.getElementById('mydb'),
    width: 2000,
    height: 2000,    
    model: graphTGDs,
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
paperTGDs.on('link:mouseenter', function(linkView) {
    linkView.showTools();
});

paperTGDs.on('link:mouseleave', function(linkView) {
    linkView.hideTools();
});

paperTGDs.on('link:pointerdblclick', function(linkView){  
    var currentLink=linkView.model;
    if (linkView.sourceMagnet.nodeName=='rect'){
        var auxKeySymbols=[];
        for (const key of mapSymbols.keys()) {
            var obj={text:key};                        
            auxKeySymbols.push(obj);
        }        
        loadModal(currentLink,auxKeySymbols,linkView.sourceView.model.attributes.options,mapSymbols);                    
    }else if (linkView.sourceMagnet.nodeName=='circle'){        
        var tablesConnected=[{id:linkView.sourceView.model.id,text:linkView.sourceView.model.attributes.question}];                        
        var intargetLinks=graphTGDs.getConnectedLinks(linkView.targetView.model, {inbound:true});
        var portType=linkView.targetView.model.attributes.ports.items[0];
        var tLinks=getLinkTarget(intargetLinks,portType);                                        
        
        for (var tlink of tLinks){							
            var tView=tlink.findView(paperTGDs);  							
            var visited=[];
            getJoinsTableFromTo(linkView.sourceView.model,tablesConnected,tView.sourceView.model.id,visited,tablesConnected[0]);	
        }               
        if (tablesConnected.length>1){
        	
            loadModalPathAttribute(currentLink,tablesConnected);
        }else{            
            loadModalFunctions(currentLink);
        }    
    }
});

graphTGDs.on('remove', function(cell, collection, opt) {
   if (cell.isLink()) {	         
        if (cell.attr('line/stroke')=="green"){     
        	//TODO NOTIFY THAT WE ARE REMOVING ALL LINKS THAT ARE CONNECTED TO THE TABLE WITH ITS TYPE
        	
        	
			var links=graphTGDs.getLinks();			
			for (var link of links){
				
				var linkView=link.findView(paperTGDs);
				if (linkView.sourceView.model.id== cell.attributes.source.id && linkView.targetView.model.id==cell.attributes.target.id){									
					link.remove()
				}
			}			
			links=graphTGDs.getLinks();
			for (var link of links){
				var edgeView=link.findView(paperTGDs);
				if (edgeView.sourceView.model.attributes.type=="db.Table" && edgeView.targetView.model.attributes.type=="shex.Type" && link.attr('line/stroke')=='blue'){
					let path=(((link.labels()[0]|| {}).attrs||{}).text||{}).text;					
					let names=getTokens(path)					
					if (mapTableIdCanvas.get(names[names.length-1])==cell.attributes.source.id){						
						link.remove()
					}
				}		
			}
			
        }        
        $table.bootstrapTable('removeByUniqueId',cell.id);
   }
})

var positionTable= {};
var positionShexType={};
var createTable=function(title,attributes,position){
    var table = new joint.shapes.db.Table({
        question:title,
        options:attributes,
        position:position
    });        
    var lastHeight= positionTable.y+table.attributes.size.height+50;
    positionTable={x:positionTable.x,y:lastHeight};    
    return table;
}
var createShexType=function(name,triConstraints,position){
    var typeShex=new joint.shapes.shex.Type({
        question:name,
        options:triConstraints,
        position:position
    });
    var lastHeightShex= positionShexType.y+typeShex.attributes.size.height+30;
    positionShexType={x:positionShexType.x,y:lastHeightShex};
    return typeShex;
}

var invertPaths=function(tablesConnected){
	var reverseTablesConnected=[]
	tablesConnected.forEach(function(path){
		var idxPath=path.id.split(",")
		var textPath=path.text.split(",")
		var reverseIdxP=idxPath.reverse()
		var reverseTextP=textPath.reverse()
		reverseTablesConnected.push({id:reverseIdxP.join(),text:reverseTextP.join()})
	});
	return reverseTablesConnected
}

paperTGDs.on('link:connect',function(linkView){  
    if (typeof(linkView.targetView)==='null'){
        console.log("no element selected");
        //graphTGDs.clear();
    }else{
        var currentLink=linkView.model;  
        //verify that are of the same type
        if (linkView.sourceMagnet.nodeName==linkView.targetMagnet.nodeName){
            
            var auxKeySymbols=[];
            for (const key of mapSymbols.keys()) {
                var obj={text:key};                        
                auxKeySymbols.push(obj);
            }
            
            if ((V(linkView.sourceMagnet.parentNode).attr('port-group')==='outfk' || V(linkView.sourceMagnet.parentNode).attr('port-group')==='outpk') &&       V(linkView.targetMagnet.parentNode).attr('port-group')==='outype'){
                currentLink.attr('line/stroke', 'red');
                //Obtain the text of attribute selected
                var attributeSelected="";
                for (var option of linkView.sourceView.model.attributes.options){                    
                    if (option.id==V(linkView.sourceMagnet.parentNode).attr('port')){
                        attributeSelected=option.text;
                        break;
                    }
                };
                //obtain the join paths
                var tablesConnected=[{id:linkView.sourceView.model.id,text:linkView.sourceView.model.attributes.question}];                
                var intargetLinks=graphTGDs.getConnectedLinks(linkView.targetView.model, {inbound:true});                
                var tLink;
                var visited=[];
                
                if (intargetLinks.length==1){
                    console.log("un link")
                    loadModalTypeReferenced(currentLink,auxKeySymbols,tablesConnected,mapSymbols,attributeSelected,intargetLinks);
                }else{					                    
                    for (var aux of intargetLinks){                                                
                        if (linkView.targetView.model.getPort(aux.attributes.target.port).group=='inType'){
                            tLink=aux;                            
                            break;
                        }
                    }                                       
                    var tView=tLink.findView(paperTGDs);                                                
                    getJoinsTableFromTo(linkView.sourceView.model,tablesConnected,tView.sourceView.model.id,visited,tablesConnected[0])                                                        
                    
                    if (tablesConnected.length==1 && auxKeySymbols.length==2 && mapSymbols.size==2){
                        let subIRI=(((tLink.labels()[0]|| {}).attrs||{}).text||{}).text;
                        //set the value by default                        
                        let sAtt=getSourceOptionNameLinkView(linkView);                        
						let iriUsed=subIRI.split("(")[0];
						let fIRI;
						let keysMap=Array.from(mapSymbols.keys())
						if (keysMap[0]==iriUsed){
							fIRI=keysMap[1]+"("+sAtt+")";
						}else{
							fIRI=keysMap[0]+"("+sAtt+")";
						}
                        currentLink.appendLabel({attrs: {text: {text: tablesConnected[0].text}},position: {offset: -10}});
                        currentLink.appendLabel({attrs: {text: {text: fIRI}},position: {offset: 10}});                        
                        drawNewRedLinkInTable(currentLink,linkView.sourceView.model.attributes.question,sAtt,tablesConnected[0].text,fIRI,linkView.targetView.model.attributes.question)                         
                    }else{
						console.log(intargetLinks)
						console.log("review all the process")
						tablesConnected=invertPaths(tablesConnected)
						
                        loadModalTypeReferenced(currentLink,auxKeySymbols,tablesConnected,mapSymbols,attributeSelected,intargetLinks);
                    }                    
                }                                                              
            } else if (V(linkView.sourceMagnet.parentNode).attr('port-group')==='out' &&    V(linkView.targetMagnet.parentNode).attr('port-group')==='outype'){
                alert("Need to be referenced to a primary key or foreign key");
                currentLink.remove();
            }else{
                if (linkView.sourceMagnet.nodeName=='rect'){
                    currentLink.attr('line/stroke', 'green');
                    //if the primary key is only one set by default if not load modal
					var pks=getKeys(linkView.sourceView.model.attributes.options);
					if (pks.length==1){
						var fSymbol=getFunctionSymbol(mapSymbols,linkView.targetView.model.attributes.question);
						var valueIRI=fSymbol+"("+pks[0]+")"
						currentLink.appendLabel({
							attrs: {
								text: {
									text: valueIRI
								}
							}
						});
                        createLinkTool(currentLink);
                        let graphicTGD=$('<div>').append($('<span>').attr('class','li_tgd').append(linkView.sourceView.model.attributes.question)).append($('<div>').attr('class','link_tgd').append((((currentLink.labels()[0]|| {}).attrs||{}).text||{}).text).append($('<a>').attr({'data-tooltip':'true',title:'Edit',id:currentLink.id,class:'edit_green_tgd'}).append($('<i>').attr('class','fas fa-edit'))).append($('<svg>').attr({height:'17px',width:widthSVGForLine}).append($('<line>').attr({class:'arrowGreen',x1:0,x2:widthSVGLine,y1:10,y2:10})))).append($('<span>').attr('class', 'li_tgd').append(linkView.targetView.model.attributes.question)).remove().html();
                        $table.bootstrapTable('append',[{id:currentLink.id,ex:graphicTGD}])
					}else{
                        loadModal(currentLink,auxKeySymbols,linkView.sourceView.model.attributes.options,mapSymbols);
					}
					
                }
                if (linkView.sourceMagnet.nodeName=='circle'){                                        
                    var linked=false;                    
                    
                    var portType;  
                    linkView.targetMagnet.parentNode.parentNode.parentNode.childNodes.forEach(function(childElement){
                        
						if (V(childElement).attr('class')=='joint-port'){                            
                            if (V(childElement.firstChild).attr('port-group')=='inType'){
                                portType=V(childElement.firstChild).attr('port');
                                var portLinks=_.filter(graphTGDs.getLinks(), function(o) {                                    
                                    return o.get('target').port == V(childElement.firstChild).attr('port');
                                });                                
                                if (portLinks.length<1){
                                    if (V(linkView.sourceMagnet.parentNode).attr('port-group')==='out'){                                                                                                                                                                 
                                        var idsourceModel;
                                        var idportSource;
                                        
                                        idsourceModel=linkView.sourceView.model.id;
                                        idportSource=linkView.sourceView.model.attributes.ports.items[0].id;
                                                                                                                        
                                        var tablesConnected=[{id:linkView.sourceView.model.id,text:linkView.sourceView.model.attributes.question}];
                                        var visitedLinks=[];
                                        getJoinsTableAllPaths(linkView.sourceView.model,tablesConnected,tablesConnected[0],visitedLinks);   
                                        
                                        loadPathIRIModal(currentLink,auxKeySymbols, linkView.sourceView.model.attributes.options,mapSymbols,tablesConnected);
                                        linked=true;
                                    }                                        
                                }
                            }
                        }                        
					});
                    if (!linked){                        
                        var tablesConnected=[{id:linkView.sourceView.model.id,text:linkView.sourceView.model.attributes.question}];                        
                        var intargetLinks=graphTGDs.getConnectedLinks(linkView.targetView.model, {inbound:true});
                        var tLinks=getLinkTarget(intargetLinks,portType);                                        
						
						for (var tlink of tLinks){
							
                            var tView=tlink.findView(paperTGDs);
                            var visited=[];
                            getJoinsTableFromTo(linkView.sourceView.model,tablesConnected,tView.sourceView.model.id,visited,tablesConnected[0]);	
						}     						
						if (tablesConnected.length==1){
                            currentLink.appendLabel({
                                attrs: {
                                    text: {
                                        text: tablesConnected[0].text
                                    }
                                },
                                position: {
                                    offset: -10
                                }
                            });
							currentLink.attr('line/stroke', 'blue');
							createLinkTool(currentLink);
							let graphicTGD=$('<div>').append($('<div>').attr('class','li_tgd').append($('<div>').attr('class','li_head_tgd').append(linkView.sourceView.model.attributes.question)).append($('<div>').attr('class','li_body_tgd').append(getSourceOptionNameLinkView(currentLink.findView(paperTGDs))))).append($('<div>').attr('class','link_tgd').append($('<div>').attr({class:"path_tgd"}).append((((currentLink.labels()[0]|| {}).attrs||{}).text||{}).text)).append($('<a>').attr({'data-tooltip':'true',title:'Edit',id:currentLink.id,class:'edit_tgd'}).append($('<i>').attr('class','fas fa-edit'))).append($('<svg>').attr({height:'17px',width:widthSVGForLine}).append($('<line>').attr({class:'arrowBlue',x1:0,x2:widthSVGLine,y1:10,y2:10}))).append($('<div>').attr({id:"param_"+currentLink.id,class:"param_tgd"})).append($('<a>').attr({'data-tooltip':'true',title:'Remove Parameters',id:currentLink.id,class:'rem_param_blue_tgd'}).append($('<i>').attr('class','fas fa-trash-alt')))).append($('<div>').attr('class', 'li_tgd').append($('<div>').attr('class','li_head_tgd').append(linkView.targetView.model.attributes.question)).append($('<div>').attr('class','li_body_tgd').append(currentLink.attributes.target.port.split(",")[0]))).remove().html();
							$table.bootstrapTable('append',[{id:currentLink.id,ex:graphicTGD}])
                        }else{                    							
                            loadModalPathAttribute(currentLink,tablesConnected);
                        }                        
                        /*$('<div>').append($('<tr>').append($('<td>').append($('<h5>').append("Rule"))).append($('<td>').append($('<span>').attr('class', '').append(linkView.sourceView.model.attributes.question.concat('.').concat(getSourceOptionNameLinkView(currentLink.findView(paperTGDs))))).append($('<button>').attr({'class':'','type':'button',id:currentLink.id}).append(currentLink.labels()[0].attrs.text.text)).append($('<span>').attr('class', '').append(linkView.targetView.model.attributes.question.concat('.').concat(currentLink.attributes.target.port.split(",")[0]))))).remove().html();
                        
                        d3.select(`#${CSS.escape(currentLink.id)}`).append('svg').attr('height',17).attr('width','80').append('line').attr('class','arrow').attr('x1',0).attr('x2',60).attr('y1',10).attr('y2',10);                        
                        if (currentLink.labels().length>1){
                            for (let i=1;i<currentLink.labels.length;i++){
                                $(`#${CSS.escape(currentLink.id)}`).append(currentLink.labels()[i].attrs.text.text);
                            }
                        } */                     
                        //var rowId = $("#table >tbody >tr").length;
                        //var part1=$('<span>').attr('class', '').append(linkView.sourceView.model.attributes.question.concat('.').concat(getSourceOptionNameLinkView(currentLink.findView(paperTGDs)))).html()						
                        /*console.log($('<div>').append($('<span>').attr('class','').append(linkView.sourceView.model.attributes.question.concat('.').concat(getSourceOptionNameLinkView(currentLink.findView(paperTGDs))))).append($('<div>').attr('class','').append(currentLink.labels()[0].attrs.text.text).append($('<svg>').attr({height:'17px',width:'80px'}).append($('<line>').attr({class:'arrow',x1:0,x2:60,y1:10,y2:10})))).append($('<span>').attr('class', '').append(linkView.targetView.model.attributes.question.concat('.').concat(currentLink.attributes.target.port.split(",")[0]))))).remove().html())*/						
                        //part1=part1.concat($('<div>').append($('<svg>').attr({height:'17px',width:'90px'}).append($('<line>').attr({class:'arrow',x1:0,x2:80,y1:10,y2:10}))).remove().html());
                        //part1=part1.concat($('<span>').attr('class', '').append(linkView.targetView.model.attributes.question.concat('.').concat(currentLink.attributes.target.port.split(",")[0])).html());                           
                    }                                        
                }                            
        }               
    }else{//remove the link from the canvas            
        currentLink.remove();
    }
}});

function createULList(list){
    var items = document.createElement('ul');
    list.forEach(function(value){
        var item = document.createElement('li');
        var ahref =document.createElement('a');
        ahref.setAttribute('data-value',value.text);
        ahref.setAttribute('href','#');
        ahref.appendChild(document.createTextNode(value.text));
        item.appendChild(ahref);  
        items.appendChild(item);
    });
    return items;
}
/*Creates a list using only */
function createList(list){
    var items = document.createElement('div');
    items.className="dropdown-menu";
    list.forEach(function(value){        
        var ahref =document.createElement('a');
        ahref.className="dropdown-item";
        ahref.setAttribute('data-value',value.id);
        ahref.setAttribute('href','#');
        ahref.appendChild(document.createTextNode(value.text));        
        items.appendChild(ahref);
    });
    return items;
}
function createButton(text){
    var buttonDrop=document.createElement('button');
    buttonDrop.className='btn btn-primary dropdown-toggle';
    buttonDrop.setAttribute('type','button');
    buttonDrop.setAttribute('data-toggle','dropdown');
    buttonDrop.appendChild(document.createTextNode(text));
    return buttonDrop;
}

function createText(id){
    var inText=document.createElement('input');
    inText.id=id;
    inText.className="form-control no-padding";
    inText.type="url";
    return inText;
}

function loadModalFunctions(currentLink){  
    console.log("loadModalFunctions")
    var CustomView = Backbone.View.extend({        
        render: function() {
            var divContainer=document.createElement('div');
            divContainer.className="container";            
                        
			//adding function of uppercarse lowercase            
            var divForm1 = document.createElement("div");
            divForm1.setAttribute("class","form-group");
            var divForm2 = document.createElement("div");
            divForm1.setAttribute("class","form-group");
            var inputText = document.createElement("input");
            inputText.type="text"
            inputText.id="att-filter"   
            inputText.setAttribute("class","form-control")
			var inputTextFun = document.createElement("input");
            inputTextFun.type="number"
            inputTextFun.min=0
            inputTextFun.id="fun-filter"   
            inputTextFun.setAttribute("class","form-control")
			inputTextFun.style.visibility = 'hidden'
            var labelText = document.createElement("label");
            labelText.htmlFor="att-filter"
            labelText.innerText="Filter"            
            addPrimitiveFunctions(divForm1)    
            divForm1.appendChild(inputTextFun)
            divForm2.appendChild(labelText);
            divForm2.appendChild(inputText);
            divContainer.appendChild(divForm1);
            divContainer.appendChild(divForm2);
            this.$el.html(divContainer);        
            return this;
        },
        events :{    
			"change #att-func":"showTypeFun"
        },
		showTypeFun:function(){
            var x=document.getElementById('fun-filter')
            if (comparisonOp.includes($('#att-func').val())){                                
                x.style.visibility = 'visible'
            }else{
                x.style.visibility = 'hidden'
            }
			
		}
    });
    var modal = new BackboneBootstrapModals.ConfirmationModal({        
        headerViewOptions:{showClose:false, label: 'Customize'},
        bodyView: CustomView,
        onConfirm: function() {                 
            let i=0
            let index=-1
            for (let label of currentLink.labels()){
                if (label.attrs.text.text.includes("function")){
                    index=i;
                }
                i++;
            }
            var constraintAtt
            if (document.getElementById('fun-filter').style.visibility=='hidden'){
                constraintAtt="[function:"+ $('#att-func').val()
            }else{
                constraintAtt="[function:"+ $('#att-func').val()+" "+$('#fun-filter').val()
            }
            if ($('#att-filter').val().length>0){
                constraintAtt=constraintAtt.concat(",filter:"+$('#att-filter').val())
            }
            constraintAtt=constraintAtt.concat("]")
            
            var offsetNew=currentLink.labels().length+1*10
            if (index==-1){
                var wraptext = joint.util.breakText(constraintAtt, {
                    width:50,
                    height: 20
                });
                currentLink.appendLabel({
                        markup: [{
                            tagName: 'rect',
                            selector: 'labelBody'
                        }, {
                            tagName: 'text',
                            selector: 'text'
                        }],
                        attrs: {
                            text: {
                                text: wraptext,
                                fill: '#7c68fc',
                                fontFamily: 'sans-serif',
                                textAnchor: 'middle',
                                textVerticalAnchor: 'middle'
                            },
                            labelBody: {
                                ref: 'text',
                                refX: -5,
                                refY: -5,
                                refWidth: '100%',
                                refHeight: '100%',
                                refWidth2: 10,
                                refHeight2: 10,
                                stroke: '#7c68fc',
                                fill: 'white',
                                strokeWidth: 2,
                                rx: 5,
                                ry: 5
                            }
                        },
                        position: {
                            offset: -40
                        }
                    });
            }else{
            currentLink.label(index,{
                        attrs: {
                            text: {
                                text: constraintAtt
                            }
                        }
                    }); 
            
            }
            
            let objGraphic=$table.bootstrapTable('getRowByUniqueId',currentLink.id);
            console.log($(objGraphic.ex))
            var sourceHead=$(objGraphic.ex)[0].firstChild.textContent;
            var sourceAtt=$(objGraphic.ex)[0].lastChild.textContent;
            var path=$(objGraphic.ex)[1].firstChild.textContent;
            var tHead=$(objGraphic.ex)[2].firstChild.textContent;
            var tAtt=$(objGraphic.ex)[2].lastChild.textContent;
            
            let graphicTGD=$('<div>').append($('<div>').attr('class','li_tgd').append($('<div>').attr('class','li_head_tgd').append(sourceHead)).append($('<div>').attr('class','li_body_tgd').append(sourceAtt))).append($('<div>').attr('class','link_tgd').append($('<div>').attr({class:"path_tgd"}).append(path)).append($('<a>').attr({'data-tooltip':'true',title:'Edit',id:currentLink.id,class:'edit_tgd'}).append($('<i>').attr('class','fas fa-edit'))).append($('<svg>').attr({height:'17px',width:widthSVGForLine}).append($('<line>').attr({class:'arrowBlue',x1:0,x2:widthSVGLine,y1:10,y2:10}))).append($('<div>').attr({id:"param_"+currentLink.id,class:"param_tgd"}).append(constraintAtt)).append($('<a>').attr({'data-tooltip':'true',title:'Remove Parameters',id:currentLink.id,class:'rem_param_blue_tgd'}).append($('<i>').attr('class','fas fa-trash-alt')))).append($('<div>').attr('class', 'li_tgd').append($('<div>').attr('class','li_head_tgd').append(tHead)).append($('<div>').attr('class','li_body_tgd').append(tAtt))).remove().html();
            
            $table.bootstrapTable('updateByUniqueId',{id:currentLink.id,row:{ex:graphicTGD}})
            //$('#param_'+currentLink.id).html(constraintAtt)
        },
        onCancel: function(){
            
        }        
    });
    modal.render();
}

function addPrimitiveFunctions(divForm1){
    var labelSelect = document.createElement("label");
    labelSelect.htmlFor="att-func"
    labelSelect.innerText="Apply"
    var select = document.createElement("SELECT");
    select.id="att-func";
    select.setAttribute("class","form-control");
    var option1 = document.createElement("option");
    option1.text = "Uppercase";
    option1.value="toUppercase";
    var option2 = document.createElement("option");
    option2.text = "Lowercase";
    option2.value="toLowercase";
    var option3 = document.createElement("option");
    option3.text = "Trim";
    option3.value="Trim";
	var option4 = document.createElement("option");
    option4.text = "<";
    option4.value="le";
	var option5 = document.createElement("option");
    option5.text = "<=";
    option5.value="leq";
	var option6 = document.createElement("option");
    option6.text = ">";
    option6.value="gt";
	var option7 = document.createElement("option");
    option7.text = ">=";
    option7.value="geq";
    select.add(option1);
    select.add(option2);
    select.add(option3);
	select.add(option4);
	select.add(option5);
	select.add(option6);
	select.add(option7);
    divForm1.appendChild(labelSelect)
    divForm1.appendChild(select)
}

function loadModalPathAttribute(currentLink,parameters){
    console.log("loadModalPathAttribute")
    var CustomView = Backbone.View.extend({
        initialize: function(opts) {
            this.parameters=opts.displayParameters;
        },
        render: function() {                             
            var divContainer=document.createElement('div');
            divContainer.className="container"; 
            var divForm1 = document.createElement("div");
            divForm1.setAttribute("class","form-group");
            
            var divDropdownParameters=document.createElement('div');
            divDropdownParameters.id='ddParameter';
            divDropdownParameters.className='dropdown';
            
            var buttonDropParameter=createButton(this.parameters[0].text);
            divDropdownParameters.appendChild(buttonDropParameter);
            var itemsParameters=createList(this.parameters);        
            divDropdownParameters.appendChild(itemsParameters);                              
            divForm1.appendChild(divDropdownParameters);			
            divContainer.appendChild(divForm1);            
            
            this.$el.html(divContainer);        
            return this;
        },
        events :{            
			"click .dropdown-menu a":"changeName",
            "mouseover #ddParameter a":"selectPath",
            "mouseout #ddParameter a":"unselectPath"
        },
		changeName: function(e) {                                           
            $(e.target).parents(".dropdown").find('.btn').html($(e.target).text().replace(/,/g,'&#10781;') + ' <span class="caret"></span>');            
            $(e.target).parents(".dropdown").find('.btn').val($(e.target).data('value'));
        },
        selectPath:function(e){            
            var tablesCombo=$(e.target).data('value').split(',');
            for (var id of tablesCombo){
                graphTGDs.getElements().forEach(function(element){
                    if (id==element.id){
                        var elementView=element.findView(paperTGDs);
                        elementView.highlight();
                    }
                });
            }
        },
        unselectPath:function(e){                        
            var tablesCombo=$(e.target).data('value').split(',');
            for (var id of tablesCombo){
                graphTGDs.getElements().forEach(function(element){
                    if (id==element.id){
                        var elementView=element.findView(paperTGDs);
                        elementView.unhighlight();
                    }
                });
            }
        }
    });
    var modal = new BackboneBootstrapModals.ConfirmationModal({        
        headerViewOptions:{showClose:false, label: 'Select Path'},
        bodyView: CustomView,
        bodyViewOptions: { displayParameters:parameters },
        onConfirm: function() {                           
            var joinPath=$("#ddParameter .btn").text().trim();
            currentLink.appendLabel({
                        attrs: {
                            text: {
                                text: joinPath
                            }
                        },
                        position: {
                            offset: -10
                        }
                    });
			var linkView=currentLink.findView(paperTGDs)
            
                        
			let graphicTGD=$('<div>').append($('<div>').attr('class','li_tgd').append($('<div>').attr('class','li_head_tgd').append(linkView.sourceView.model.attributes.question)).append($('<div>').attr('class','li_body_tgd').append(getSourceOptionNameLinkView(currentLink.findView(paperTGDs))))).append($('<div>').attr('class','link_tgd').append($('<div>').attr({class:"path_tgd"}).append((((currentLink.labels()[0]|| {}).attrs||{}).text||{}).text)).append($('<a>').attr({'data-tooltip':'true',title:'Edit',id:currentLink.id,class:'edit_tgd'}).append($('<i>').attr('class','fas fa-edit'))).append($('<svg>').attr({height:'17px',width:widthSVGForLine}).append($('<line>').attr({class:'arrowBlue',x1:0,x2:widthSVGLine,y1:10,y2:10}))).append($('<div>').attr({id:"param_"+currentLink.id,class:"param_tgd"})).append($('<a>').attr({'data-tooltip':'true',title:'Remove Parameters',id:currentLink.id,class:'rem_param_blue_tgd'}).append($('<i>').attr('class','fas fa-trash-alt')))).append($('<div>').attr('class', 'li_tgd').append($('<div>').attr('class','li_head_tgd').append(linkView.targetView.model.attributes.question)).append($('<div>').attr('class','li_body_tgd').append(currentLink.attributes.target.port.split(",")[0]))).remove().html();
			$table.bootstrapTable('append',[{id:currentLink.id,ex:graphicTGD}])
			currentLink.attr('line/stroke', 'blue');
			createLinkTool(currentLink);
            
            var paramValue=$('#ddParameter .btn').val();            
            if (paramValue===""){
                paramValue=parameters[0].id;
            }
            var lastTable=paramValue.split(",");
            let lastTableName;
            for (const [key,value] of mapTableIdCanvas){
                if (value==lastTable[lastTable.length-1]){
                    lastTableName=key;
                    break;
                }
            }
            console.log(lastTableName)
            //get the list of intypes then check each one if correspond to one of the names
            var intargetLinks=graphTGDs.getConnectedLinks(linkView.targetView.model, {inbound:true});
            var portType=linkView.targetView.model.attributes.ports.items[0];
            var tLinks=getLinkTarget(intargetLinks,portType);                                        
            //loop all links that are table id to type id
            let isPathEqSourceLink=false;
            
            for (var tlink of tLinks){							
                var tView=tlink.findView(paperTGDs);
                if (tView.sourceView.model.id==lastTable[lastTable.length-1]){
                    isPathEqSourceLink=true;
                    break;
                }
            }
            
            if (!isPathEqSourceLink){
                //VERIFY IF ALREADY EXISTS green link IF NOT CREATE
            	
            	
                //get the element of the path
                var element;
                for (let table of graphTGDs.getElements()){
                    if (table.id==lastTable[lastTable.length-1]){
                        element=table;
                    }
                }
                let isConnectedGL=false
            	for (var greenL of graphTGDs.getLinks()){            		
            		if(greenL.attributes.source.port==element.attributes.ports.items[0].id && greenL.attributes.target.port==linkView.targetView.model.attributes.ports.items[0].id){
            			isConnectedGL=true;
            			break;
            		}
            	}
                if (!isConnectedGL){
	                var linkParent=link(graphTGDs,element.id,element.attributes.ports.items[0].id,linkView.targetView.model.id,linkView.targetView.model.attributes.ports.items[0].id,'green');
	                var pks=getKeys(element.attributes.options);
	                let valueIRI=mapSymbols.keys().next().value+"("+pks[0]+")";
	                linkParent.appendLabel({attrs: {text: {text: valueIRI}}});
	                drawNewGreenLinkInTable(linkParent,lastTableName,valueIRI,linkView.targetView.model.attributes.question)
                }
            }
        },
        onCancel: function(){
            currentLink.remove();
        }        
    });
    modal.render();
}

function loadModalPathAttributeDetail(currentLink,parameters){
    console.log(loadModalPathAttributeDetail)
    var CustomView = Backbone.View.extend({
        initialize: function(opts) {
            this.parameters=opts.displayParameters;
        },
        render: function() {                             
            var divContainer=document.createElement('div');
            divContainer.className="container"; 
            var divForm1 = document.createElement("div");
            divForm1.setAttribute("class","form-group");
            
            var divDropdownParameters=document.createElement('div');
            divDropdownParameters.id='ddParameter';
            divDropdownParameters.className='dropdown';
            
            var buttonDropParameter=createButton(this.parameters[0].text);
            divDropdownParameters.appendChild(buttonDropParameter);
            var itemsParameters=createList(this.parameters);        
            divDropdownParameters.appendChild(itemsParameters);                              
            divForm1.appendChild(divDropdownParameters);
			//adding function of uppercarse lowercase
			addPrimitiveFunctions(divForm1)
            
            var divForm2 = document.createElement("div");
            divForm1.setAttribute("class","form-group");
            var inputText = document.createElement("input");
            inputText.type="text"
            inputText.id="att-filter"   
            inputText.setAttribute("class","form-control")
			var inputTextFun = document.createElement("input");
            inputTextFun.type="number"
            inputTextFun.min=0
            inputTextFun.id="fun-filter"   
            inputTextFun.setAttribute("class","form-control")
			inputTextFun.style.visibility = 'hidden'
            var labelText = document.createElement("label");
            labelText.htmlFor="att-filter"
            labelText.innerText="Filter"            
            addPrimitiveFunctions(divForm1)    
            divForm1.appendChild(inputTextFun)
            divForm2.appendChild(labelText);
            divForm2.appendChild(inputText);
            divContainer.appendChild(divForm1);
            divContainer.appendChild(divForm2);
            
            this.$el.html(divContainer);        
            return this;
        },
        events :{            
			"click .dropdown-menu a":"changeName",
            "mouseover #ddParameter a":"selectPath",
            "mouseout #ddParameter a":"unselectPath",
			"change #att-func":"showTypeFun"
        },
		showTypeFun:function(){
            var x=document.getElementById('fun-filter')
            if (comparisonOp.includes($('#att-func').val())){                                
                x.style.visibility = 'visible'
            }else{
                x.style.visibility = 'hidden'
            }
			
		},
        changeName: function(e) {                                           
            $(e.target).parents(".dropdown").find('.btn').html($(e.target).text().replace(/,/g,'&#10781;') + ' <span class="caret"></span>');            
            $(e.target).parents(".dropdown").find('.btn').val($(e.target).data('value'));
        },
        selectPath:function(e){            
            var tablesCombo=$(e.target).data('value').split(',');
            for (var id of tablesCombo){
                graphTGDs.getElements().forEach(function(element){
                    if (id==element.id){
                        var elementView=element.findView(paperTGDs);
                        elementView.highlight();
                    }
                });
            }

        },
        unselectPath:function(e){                        
            var tablesCombo=$(e.target).data('value').split(',');
            for (var id of tablesCombo){
                graphTGDs.getElements().forEach(function(element){
                    if (id==element.id){
                        var elementView=element.findView(paperTGDs);
                        elementView.unhighlight();
                    }
                });
            }
        }
    });
    var modal = new BackboneBootstrapModals.ConfirmationModal({        
        headerViewOptions:{showClose:false, label: 'Select Path'},
        bodyView: CustomView,
        bodyViewOptions: { displayParameters:parameters },
        onConfirm: function() {                           
            var joinPath=$("#ddParameter .btn").text().trim();            
			currentLink.label(0,{
                        attrs: {
                            text: {
                                text: joinPath
                            }
                        }
                    });
			let i=0
            let index=-1
            for (let label of currentLink.labels()){
                if (label.attrs.text.text.includes("function")){
                    index=i;
                }
                i++;
            }
            var constraintAtt
            if (document.getElementById('fun-filter').style.visibility=='hidden'){
                constraintAtt="[function:"+ $('#att-func').val()
            }else{
                constraintAtt="[function:"+ $('#att-func').val()+" "+$('#fun-filter').val()
            }
            if ($('#att-filter').val().length>0){
                constraintAtt=constraintAtt.concat(",filter:"+$('#att-filter').val())
            }
            constraintAtt=constraintAtt.concat("]")
            
            var offsetNew=currentLink.labels().length+1*10
            if (index==-1){
                var wraptext = joint.util.breakText(constraintAtt, {
                    width:50,
                    height: 20
                });
                currentLink.appendLabel({
                        markup: [{
                            tagName: 'rect',
                            selector: 'labelBody'
                        }, {
                            tagName: 'text',
                            selector: 'text'
                        }],
                        attrs: {
                            text: {
                                text: wraptext,
                                fill: '#7c68fc',
                                fontFamily: 'sans-serif',
                                textAnchor: 'middle',
                                textVerticalAnchor: 'middle'
                            },
                            labelBody: {
                                ref: 'text',
                                refX: -5,
                                refY: -5,
                                refWidth: '100%',
                                refHeight: '100%',
                                refWidth2: 10,
                                refHeight2: 10,
                                stroke: '#7c68fc',
                                fill: 'white',
                                strokeWidth: 2,
                                rx: 5,
                                ry: 5
                            }
                        },
                        position: {
                            offset: -40
                        }
                    });
            }else{
				currentLink.label(index,{
                        attrs: {
                            text: {
                                text: constraintAtt
                            }
                        }
                    }); 
            
            }
            
            let objGraphic=$table.bootstrapTable('getRowByUniqueId',currentLink.id);
            console.log($(objGraphic.ex))
            var sourceHead=$(objGraphic.ex)[0].firstChild.textContent;
            var sourceAtt=$(objGraphic.ex)[0].lastChild.textContent;
            var path=joinPath;
            var tHead=$(objGraphic.ex)[2].firstChild.textContent;
            var tAtt=$(objGraphic.ex)[2].lastChild.textContent;
            
            let graphicTGD=$('<div>').append($('<div>').attr('class','li_tgd').append($('<div>').attr('class','li_head_tgd').append(sourceHead)).append($('<div>').attr('class','li_body_tgd').append(sourceAtt))).append($('<div>').attr('class','link_tgd').append($('<div>').attr({class:"path_tgd"}).append(path)).append($('<a>').attr({'data-tooltip':'true',title:'Edit',id:currentLink.id,class:'edit_tgd'}).append($('<i>').attr('class','fas fa-edit'))).append($('<svg>').attr({height:'17px',width:widthSVGForLine}).append($('<line>').attr({class:'arrowBlue',x1:0,x2:widthSVGLine,y1:10,y2:10}))).append($('<div>').attr({id:"param_"+currentLink.id,class:"param_tgd"}).append(constraintAtt)).append($('<a>').attr({'data-tooltip':'true',title:'Remove Parameters',id:currentLink.id,class:'rem_param_blue_tgd'}).append($('<i>').attr('class','fas fa-trash-alt')))).append($('<div>').attr('class', 'li_tgd').append($('<div>').attr('class','li_head_tgd').append(tHead)).append($('<div>').attr('class','li_body_tgd').append(tAtt))).remove().html();
            
            $table.bootstrapTable('updateByUniqueId',{id:currentLink.id,row:{ex:graphicTGD}})
        },
        onCancel: function(){            
        }        
    });
    modal.render();
}

function loadModalRedFromTable(currentLink,iris, parameters,functionsMap,valueReference,inTargetLinks){
	var CustomView = Backbone.View.extend({
        initialize: function(opts) {
            this.iris = opts.displayIris;
            this.parameters=opts.displayParameters;
        },
        render: function() {
            var divContainer=document.createElement('div');
            divContainer.className="container";
            var divDropdown=document.createElement('div');
            divDropdown.id='ddIriConstructor';
            divDropdown.className='dropdown';
            
            var iriUrl=createText("iriUrl");
            
            var items = createList(this.iris);            
            var buttonDropIri=createButton(this.iris[0].text);
            divDropdown.appendChild(buttonDropIri);
            divDropdown.appendChild(iriUrl);
            divDropdown.appendChild(items);
            
            
            var divDropdownParameters=document.createElement('div');
            divDropdownParameters.id='ddParameter';
            divDropdownParameters.className='dropdown';
            var buttonDropParameter=createButton(this.parameters[0].text);
            divDropdownParameters.appendChild(buttonDropParameter);
            var itemsParameters=createList(this.parameters);        
            divDropdownParameters.appendChild(itemsParameters);
                        
            divContainer.appendChild(divDropdown);        
            divContainer.appendChild(divDropdownParameters);
            this.$el.html(divContainer);        
            $("#iriUrl").val(functionsMap.get(this.iris[0].text.trim()));
            return this;
        },
        events :{
            "click .dropdown-menu a":"changeName",
            "click #ddIriConstructor a":"changeInputText",
            "mouseover #ddParameter a":"selectPath",
            "mouseout #ddParameter a":"unselectPath",
        },
        changeName: function(e) {                                           
            $(e.target).parents(".dropdown").find('.btn').html($(e.target).text().replace(/,/g,'&#10781;') + ' <span class="caret"></span>');            
            $(e.target).parents(".dropdown").find('.btn').val($(e.target).data('value'));
        },
        changeInputText:function (e) {
            $("#iriUrl").val(functionsMap.get($(e.target).text().trim()));            
        },
        selectPath:function(e){
            var tablesCombo=$(e.target).data('value').split(',');
            for (var id of tablesCombo){
                graphTGDs.getElements().forEach(function(element){
                    if (id==element.id){
                        var elementView=element.findView(paperTGDs);
                        elementView.highlight();
                    }
                });
            }

        },
        unselectPath:function(e){                        
            var tablesCombo=$(e.target).data('value').split(',');
            for (var id of tablesCombo){
                graphTGDs.getElements().forEach(function(element){
                    if (id==element.id){
                        var elementView=element.findView(paperTGDs);
                        elementView.unhighlight();
                    }
                });
            }
        }
    });
    var modal = new BackboneBootstrapModals.ConfirmationModal({        
        headerViewOptions:{showClose:false, label: 'Define IRI Constructor'},
        bodyView: CustomView,
        bodyViewOptions: { displayIris: iris, displayParameters:parameters },
        onConfirm: function() {               
            var valueIRI=$("#ddIriConstructor .btn").text().trim();
            valueIRI=valueIRI.concat("(");            
            valueIRI=valueIRI.concat(valueReference);
            valueIRI=valueIRI.concat(")");
            var joinPath=$("#ddParameter .btn").text().trim();
            if (currentLink.labels().length==0){            
            	currentLink.appendLabel({attrs: {text: {text: valueIRI}},position: {offset: 10}});            
            	currentLink.appendLabel({attrs: {text: {text: joinPath}},position: {offset: -10}}); 
            }else{                
                currentLink.label(0,{attrs: {text: {text: valueIRI}}}); 
                currentLink.label(1,{attrs: {text: {text: joinPath}},position: {offset: -10}}) ;               
            }            
            let linkView=currentLink.findView(paperTGDs);      
            let sAtt=getSourceOptionNameLinkView(linkView);
            drawUpdateRedLinkInTable(currentLink,linkView.sourceView.model.attributes.question,sAtt,joinPath,valueIRI,linkView.targetView.model.attributes.question)
            //get the id and set by default the table						
            var paramValue=$('#ddParameter .btn').val();            
            if (paramValue===""){
                paramValue=parameters[0].id;
            }
            var lastTable=paramValue.split(",");
            let lastTableName;
            for (const [key,value] of mapTableIdCanvas){
                if (value==lastTable[lastTable.length-1]){
                    lastTableName=key;
                    break;
                }
            }            			            
            var portType=linkView.targetView.model.attributes.ports.items[0];
            var tLinks=getLinkTargetType(inTargetLinks,portType);             
            //loop all links that are table id to type id
            let isPathEqSourceLink=false;
            
            for (var tlink of tLinks){							
                var tView=tlink.findView(paperTGDs);                
                if (tView.sourceView.model.id==lastTable[lastTable.length-1]){
                    isPathEqSourceLink=true;                    
                    break;
                }
            }
			
			if (!isPathEqSourceLink){

                console.log("creating link green")
                for (var element of graphTGDs.getElements()){                
                    if (element.id==lastTable[lastTable.length-1]){					
                        var pks=getKeys(element.attributes.options);					
                        var fSymbol=getFunctionSymbol(mapSymbols,linkView.targetView.model.attributes.question);
                        var valueIRI=fSymbol+"("+pks[0]+")";											
                        var linkParent=link(graphTGDs,element.id,element.attributes.ports.items[0].id,linkView.targetView.model.id,linkView.targetView.model.attributes.ports.items[0].id,'green');
                        createLinkTool(linkParent);
                        
                        linkParent.appendLabel({
                            attrs: {
                                text: {
                                    text: valueIRI
                                }
                            }
                        });
                        
                        let graphicTGDparent=$('<div>').append($('<span>').attr('class','li_tgd').append(element.attributes.question)).append($('<div>').attr({'class':'link_tgd'}).append($('<p>').attr({id:"text_"+linkParent.id}).append((((linkParent.labels()[0]|| {}).attrs||{}).text||{}).text)).append($('<a>').attr({'data-tooltip':'true',title:'Edit',id:linkParent.id,class:'edit_green_tgd'}).append($('<i>').attr('class','fas fa-edit'))).append($('<svg>').attr({height:'17px',width:widthSVGForLine}).append($('<line>').attr({class:'arrowGreen',x1:0,x2:widthSVGLine,y1:10,y2:10})))).append($('<span>').attr('class', 'li_tgd').append(linkView.targetView.model.attributes.question)).remove().html();
                        $table.bootstrapTable('append',[{id:linkParent.id,ex:graphicTGDparent}])
                    }
                }
			}
        },
        onCancel: function(){
            currentLink.remove();
        }        
    });
    modal.render();
}

//linkView.sourceView.model.attributes.question.concat('.').concat(getSourceOptionNameLinkView(currentLink.findView(paperTGDs)))
function loadModalTypeReferenced(currentLink,iris, parameters,functionsMap,valueReference,inTargetLinks){
	console.log("Red Link")
    var CustomView = Backbone.View.extend({
        initialize: function(opts) {
            this.iris = opts.displayIris;
            this.parameters=opts.displayParameters;
        },
        render: function() {
            var divContainer=document.createElement('div');
            divContainer.className="container";
            var divDropdown=document.createElement('div');
            divDropdown.id='ddIriConstructor';
            divDropdown.className='dropdown';
            
            var iriUrl=createText("iriUrl");
            
            var items = createList(this.iris);            
            var buttonDropIri=createButton(this.iris[0].text);
            divDropdown.appendChild(buttonDropIri);
            divDropdown.appendChild(iriUrl);
            divDropdown.appendChild(items);
            
            
            var divDropdownParameters=document.createElement('div');
            divDropdownParameters.id='ddParameter';
            divDropdownParameters.className='dropdown';
            var buttonDropParameter=createButton(this.parameters[0].text);
            divDropdownParameters.appendChild(buttonDropParameter);
            var itemsParameters=createList(this.parameters);        
            divDropdownParameters.appendChild(itemsParameters);
                        
            divContainer.appendChild(divDropdown);        
            divContainer.appendChild(divDropdownParameters);
            this.$el.html(divContainer);        
            $("#iriUrl").val(functionsMap.get(this.iris[0].text.trim()));
            return this;
        },
        events :{
            "click .dropdown-menu a":"changeName",
            "click #ddIriConstructor a":"changeInputText",
            "mouseover #ddParameter a":"selectPath",
            "mouseout #ddParameter a":"unselectPath",
        },
        changeName: function(e) {                                           
            $(e.target).parents(".dropdown").find('.btn').html($(e.target).text().replace(/,/g,'&#10781;') + ' <span class="caret"></span>');            
            $(e.target).parents(".dropdown").find('.btn').val($(e.target).data('value'));
        },
        changeInputText:function (e) {
            $("#iriUrl").val(functionsMap.get($(e.target).text().trim()));            
        },
        selectPath:function(e){
            var tablesCombo=$(e.target).data('value').split(',');
            for (var id of tablesCombo){
                graphTGDs.getElements().forEach(function(element){
                    if (id==element.id){
                        var elementView=element.findView(paperTGDs);
                        elementView.highlight();
                    }
                });
            }

        },
        unselectPath:function(e){                        
            var tablesCombo=$(e.target).data('value').split(',');
            for (var id of tablesCombo){
                graphTGDs.getElements().forEach(function(element){
                    if (id==element.id){
                        var elementView=element.findView(paperTGDs);
                        elementView.unhighlight();
                    }
                });
            }
        }
    });
    var modal = new BackboneBootstrapModals.ConfirmationModal({        
        headerViewOptions:{showClose:false, label: 'Define IRI Constructor'},
        bodyView: CustomView,
        bodyViewOptions: { displayIris: iris, displayParameters:parameters },
        onConfirm: function() {               
            var valueIRI=$("#ddIriConstructor .btn").text().trim();
            valueIRI=valueIRI.concat("(");            
            valueIRI=valueIRI.concat(valueReference);
            valueIRI=valueIRI.concat(")");
            var joinPath=$("#ddParameter .btn").text().trim();
            if (currentLink.labels().length==0){            
            	currentLink.appendLabel({attrs: {text: {text: valueIRI}},position: {offset: 10}});            
            	currentLink.appendLabel({attrs: {text: {text: joinPath}},position: {offset: -10}}); 
            }else{                
                currentLink.label(0,{attrs: {text: {text: valueIRI}}}); 
                currentLink.label(1,{attrs: {text: {text: joinPath}},position: {offset: -10}}) ;               
            }
            createLinkTool(currentLink);
            let linkView=currentLink.findView(paperTGDs);      
            let sAtt=getSourceOptionNameLinkView(linkView);
            drawNewRedLinkInTable(currentLink,linkView.sourceView.model.attributes.question,sAtt,joinPath,valueIRI,linkView.targetView.model.attributes.question)
            
            
            //get the id and set by default the table						
            var paramValue=$('#ddParameter .btn').val();            
            if (paramValue===""){
                paramValue=parameters[0].id;
            }
            var lastTable=paramValue.split(",");
            let lastTableName;
            for (const [key,value] of mapTableIdCanvas){
                if (value==lastTable[lastTable.length-1]){
                    lastTableName=key;
                    break;
                }
            }            			            
            var portType=linkView.targetView.model.attributes.ports.items[0];
            var tLinks=getLinkTargetType(inTargetLinks,portType);             
            //loop all links that are table id to type id
            let isPathEqSourceLink=false;
            
            for (var tlink of tLinks){							
                var tView=tlink.findView(paperTGDs);                
                if (tView.sourceView.model.id==lastTable[lastTable.length-1]){
                    isPathEqSourceLink=true;                    
                    break;
                }
            }
			
			if (!isPathEqSourceLink){

                console.log("creating link green")
                for (var element of graphTGDs.getElements()){                
                    if (element.id==lastTable[lastTable.length-1]){					
                        var pks=getKeys(element.attributes.options);					
                        var fSymbol=getFunctionSymbol(mapSymbols,linkView.targetView.model.attributes.question);
                        var valueIRI=fSymbol+"("+pks[0]+")";											
                        var linkParent=link(graphTGDs,element.id,element.attributes.ports.items[0].id,linkView.targetView.model.id,linkView.targetView.model.attributes.ports.items[0].id,'green');
                        createLinkTool(linkParent);
                        
                        linkParent.appendLabel({
                            attrs: {
                                text: {
                                    text: valueIRI
                                }
                            }
                        });
                        
                        let graphicTGDparent=$('<div>').append($('<span>').attr('class','li_tgd').append(element.attributes.question)).append($('<div>').attr({'class':'link_tgd'}).append($('<p>').attr({id:"text_"+linkParent.id}).append((((linkParent.labels()[0]|| {}).attrs||{}).text||{}).text)).append($('<a>').attr({'data-tooltip':'true',title:'Edit',id:linkParent.id,class:'edit_green_tgd'}).append($('<i>').attr('class','fas fa-edit'))).append($('<svg>').attr({height:'17px',width:widthSVGForLine}).append($('<line>').attr({class:'arrowGreen',x1:0,x2:widthSVGLine,y1:10,y2:10})))).append($('<span>').attr('class', 'li_tgd').append(linkView.targetView.model.attributes.question)).remove().html();
                        $table.bootstrapTable('append',[{id:linkParent.id,ex:graphicTGDparent}])
                    }
                }
			}
        },
        onCancel: function(){
            currentLink.remove();
        }        
    });
    modal.render();
}

function drawUpdateRedLinkInTable(currentLink,sHead,sAtt,path,fObject,tHead){
    let tAtt=currentLink.attributes.target.port.split(",")[0]
    var graphicTGD=$('<div>').append($('<div>').attr('class','li_tgd').append($('<div>').attr('class','li_head_tgd').append(sHead)).append($('<div>').attr('class','li_body_tgd').append(sAtt))).append($('<div>').attr('class','link_tgd').append($('<div>').attr({class:"path_tgd"}).append(path)).append($('<a>').attr({'data-tooltip':'true',title:'Edit',id:currentLink.id,class:'edit_red_tgd'}).append($('<i>').attr('class','fas fa-edit'))).append($('<svg>').attr({height:'17px',width:widthSVGForLine}).append($('<line>').attr({class:'arrowRed',x1:0,x2:widthSVGLine,y1:10,y2:10}))).append($('<div>').attr({class:"iri_tgd"}).append(fObject))).append($('<div>').attr('class', 'li_tgd').append($('<div>').attr('class','li_head_tgd').append(tHead)).append($('<div>').attr('class','li_body_tgd').append(tAtt))).remove().html();;
    //update list of tgds            
    $table.bootstrapTable('updateByUniqueId',{id:currentLink.id,row:{ex:graphicTGD}})

}

function drawNewRedLinkInTable(currentLink,sHead,sAtt,path,fObject,tHead){
    let tAtt=currentLink.attributes.target.port.split(",")[0]
    let graphicTGD=$('<div>').append($('<div>').attr('class','li_tgd').append($('<div>').attr('class','li_head_tgd').append(sHead)).append($('<div>').attr('class','li_body_tgd').append(sAtt))).append($('<div>').attr('class','link_tgd').append($('<div>').attr({class:"path_tgd"}).append(path)).append($('<a>').attr({'data-tooltip':'true',title:'Edit',id:currentLink.id,class:'edit_red_tgd'}).append($('<i>').attr('class','fas fa-edit'))).append($('<svg>').attr({height:'17px',width:widthSVGForLine}).append($('<line>').attr({class:'arrowRed',x1:0,x2:widthSVGLine,y1:10,y2:10}))).append($('<div>').attr({class:"iri_tgd"}).append(fObject))).append($('<div>').attr('class', 'li_tgd').append($('<div>').attr('class','li_head_tgd').append(tHead)).append($('<div>').attr('class','li_body_tgd').append(tAtt))).remove().html();
    $table.bootstrapTable('append',[{id:currentLink.id,ex:graphicTGD}])
}

function drawNewGreenLinkInTable(greenLink,sHead,fSubject,tHead){    
    let graphicTGDparent=$('<div>').append($('<span>').attr('class','li_tgd').append(sHead)).append($('<div>').attr({'class':'link_tgd'}).append($('<p>').attr({id:"text_"+greenLink.id}).append(fSubject)).append($('<a>').attr({'data-tooltip':'true',title:'Edit',id:greenLink.id,class:'edit_green_tgd'}).append($('<i>').attr('class','fas fa-edit'))).append($('<svg>').attr({height:'17px',width:widthSVGForLine}).append($('<line>').attr({class:'arrowGreen',x1:0,x2:widthSVGLine,y1:10,y2:10})))).append($('<span>').attr('class', 'li_tgd').append(tHead)).remove().html();
    $table.bootstrapTable('append',[{id:greenLink.id,ex:graphicTGDparent}])
}

function loadPathIRIModal(currentLink,iris, parameters,functionsMap,lsPaths){
	console.log("Path IRI MODAL")
    var CustomView = Backbone.View.extend({
        initialize: function(opts) {
            this.lsPaths=opts.displayParameters;
        },
        render: function() {                             
            var divForm1 = document.createElement("div");
            divForm1.setAttribute("class","form-group");
            
            var divDropdownParameters=document.createElement('div');
            divDropdownParameters.id='ddParameter';
            divDropdownParameters.classList.add('dropdown');
            divDropdownParameters.classList.add("form-control");
            
            
            var buttonDropParameter=createButton(this.lsPaths[0].text);
            divDropdownParameters.appendChild(buttonDropParameter);
            var itemsParameters=createList(this.lsPaths);        
            divDropdownParameters.appendChild(itemsParameters);                              
            divForm1.appendChild(divDropdownParameters);	            
            this.$el.html(divForm1);                
            return this;
        },
        events :{         
			"click .dropdown-menu a":"changeName",
            "mouseover #ddParameter a":"selectPath",
            "mouseout #ddParameter a":"unselectPath",
        },changeName: function(e) {                                           
            $(e.target).parents(".dropdown").find('.btn').html($(e.target).text().replace(/,/g,'&#10781;') + ' <span class="caret"></span>');            
            $(e.target).parents(".dropdown").find('.btn').val($(e.target).data('value'));
        },
        selectPath:function(e){            
            var tablesCombo=$(e.target).data('value').split(',');
            for (var id of tablesCombo){
                graphTGDs.getElements().forEach(function(element){
                    if (id==element.id){
                        var elementView=element.findView(paperTGDs);
                        elementView.highlight();
                    }
                });
            }

        },
        unselectPath:function(e){                        
            var tablesCombo=$(e.target).data('value').split(',');
            for (var id of tablesCombo){
                graphTGDs.getElements().forEach(function(element){
                    if (id==element.id){
                        var elementView=element.findView(paperTGDs);
                        elementView.unhighlight();
                    }
                });
            }
        }
    });
    var modal = new BackboneBootstrapModals.ConfirmationModal({        
        headerViewOptions:{showClose:false, label: 'Select Path'},
        bodyView: CustomView,
        bodyViewOptions: { displayParameters:lsPaths },
        onConfirm: function() {                           
            var joinPath=$("#ddParameter .btn").text().trim();
            currentLink.appendLabel({
                        attrs: {
                            text: {
                                text: joinPath
                            }
                        },
                        position: {
                            offset: -10
                        }
                    });
						
			var linkView=currentLink.findView(paperTGDs)
			let graphicTGD=$('<div>').append($('<div>').attr('class','li_tgd').append($('<div>').attr('class','li_head_tgd').append(linkView.sourceView.model.attributes.question)).append($('<div>').attr('class','li_body_tgd').append(getSourceOptionNameLinkView(currentLink.findView(paperTGDs))))).append($('<div>').attr({'class':'link_tgd'}).append($('<div>').attr({class:"path_tgd"}).append(joinPath)).append($('<a>').attr({'data-tooltip':'true',title:'Edit',id:currentLink.id,class:'edit_tgd'}).append($('<i>').attr('class','fas fa-edit'))).append($('<svg>').attr({height:'17px',width:widthSVGForLine}).append($('<line>').attr({class:'arrowBlue',x1:0,x2:widthSVGLine,y1:10,y2:10}))).append($('<p>').attr({id:"param_"+currentLink.id,class:"param_tgd"}))).append($('<div>').attr('class', 'li_tgd').append($('<div>').attr('class','li_head_tgd').append(linkView.targetView.model.attributes.question)).append($('<div>').attr('class','li_body_tgd').append(currentLink.attributes.target.port.split(",")[0]))).remove().html();
            $table.bootstrapTable('append',[{id:currentLink.id,ex:graphicTGD}])
			currentLink.attr('line/stroke', 'blue');
			createLinkTool(currentLink);
			
			//get the id and set by default the table						
            var paramValue=$('#ddParameter .btn').val();            
            if (paramValue===""){
                paramValue=lsPaths[0].id;
            }
			var lastTable=paramValue.split(",");			
			
			for (var element of graphTGDs.getElements()){                
				if (element.id==lastTable[lastTable.length-1]){					
					var pks=getKeys(element.attributes.options);					
                    var fSymbol=getFunctionSymbol(mapSymbols,linkView.targetView.model.attributes.question);
					var valueIRI=fSymbol+"("+pks[0]+")";											
					var linkParent=link(graphTGDs,element.id,element.attributes.ports.items[0].id,linkView.targetView.model.id,linkView.targetView.model.attributes.ports.items[0].id,'green');
					createLinkTool(linkParent);
                    
                    linkParent.appendLabel({
                        attrs: {
                            text: {
                                text: valueIRI
                            }
                        }
                    });
                    
					let graphicTGDparent=$('<div>').append($('<span>').attr('class','li_tgd').append(element.attributes.question)).append($('<div>').attr({'class':'link_tgd'}).append($('<p>').attr({id:"text_"+linkParent.id}).append((((linkParent.labels()[0]|| {}).attrs||{}).text||{}).text)).append($('<a>').attr({'data-tooltip':'true',title:'Edit',id:linkParent.id,class:'edit_green_tgd'}).append($('<i>').attr('class','fas fa-edit'))).append($('<svg>').attr({height:'17px',width:widthSVGForLine}).append($('<line>').attr({class:'arrowGreen',x1:0,x2:widthSVGLine,y1:10,y2:10})))).append($('<span>').attr('class', 'li_tgd').append(linkView.targetView.model.attributes.question)).remove().html();
					$table.bootstrapTable('append',[{id:linkParent.id,ex:graphicTGDparent}])
				}
			}
        },
        onCancel: function(){
            currentLink.remove();
        }        
    });
    modal.render();
}



function loadModal(currentLink,iris, parameters,functionsMap){
    /*var orderParameters=orderTablesByShortestName(parameters);
    console.log("ordernar de menor longitud a mayor")
    console.log(orderParameters)*/
	let keyParameters=filterKeyParam(parameters)
    var CustomView = Backbone.View.extend({
        initialize: function(opts) {
            this.iris = opts.displayIris;
            this.parameters=opts.displayParameters;
        },
        render: function() {
            var divContainer=document.createElement('div');
            divContainer.className="container";
            var divDropdown=document.createElement('div');
            divDropdown.id='ddIriConstructor';
            divDropdown.className='dropdown';
            
            var iriUrl=createText("iriUrl");
            
            var items = createList(this.iris);            
            var buttonDropIri=createButton(this.iris[0].text);
            divDropdown.appendChild(buttonDropIri);
            divDropdown.appendChild(iriUrl);
            divDropdown.appendChild(items);
            
            var divDropdownParameters=document.createElement('div');
            divDropdownParameters.id='ddParameter';
            divDropdownParameters.className='dropdown';
            var buttonDropParameter=createButton(this.parameters[0].text);
            divDropdownParameters.appendChild(buttonDropParameter);
            var itemsParameters=createList(this.parameters);        
            divDropdownParameters.appendChild(itemsParameters);
                        
            divContainer.appendChild(divDropdown);        
            divContainer.appendChild(divDropdownParameters);
            this.$el.html(divContainer);        
            $("#iriUrl").val(functionsMap.get(this.iris[0].text.trim()))
            return this;
        },
        events :{
            "click .dropdown-menu a":"changeName",
            "click #ddIriConstructor a":"changeInputText"
        },
        changeName: function(e) {                                           
            $(e.target).parents(".dropdown").find('.btn').html($(e.target).text().replace(/,/g,'&#10781;') + ' <span class="caret"></span>');            
            $(e.target).parents(".dropdown").find('.btn').val($(e.target).data('value'));
        },
        changeInputText:function (e) {
            $("#iriUrl").val(functionsMap.get($(e.target).text().trim()));            
        }
    });
    var modal = new BackboneBootstrapModals.ConfirmationModal({        
        headerViewOptions:{showClose:false, label: 'Define IRI Constructor'},
        bodyView: CustomView,
        bodyViewOptions: { displayIris: iris, displayParameters:keyParameters },
        onConfirm: function(a) {                                 
            if ($("#ddParameter .btn").text().trim()=="Constructor Parameters" || $("#ddIriConstructor .btn").text().trim()=="IRI Constructors"){
                alert("Need to specify IRI and Parameter")
                this.isConfirmed=false;                
            }else{            
                var valueIRI=$("#ddIriConstructor .btn").text().trim();
                valueIRI=valueIRI.concat("(");
                valueIRI=valueIRI.concat($("#ddParameter .btn").text().trim());
                valueIRI=valueIRI.concat(")");            
                currentLink.appendLabel({attrs: {text: {text: valueIRI}}});            
                
                createLinkTool(currentLink);
                var linkView=currentLink.findView(paperTGDs)
                let graphicTGD=$('<div>').append($('<span>').attr('class','li_tgd').append(linkView.sourceView.model.attributes.question)).append($('<div>').attr('class','link_tgd').append((((currentLink.labels()[0]|| {}).attrs||{}).text||{}).text).append($('<a>').attr({'data-tooltip':'true',title:'Edit',id:currentLink.id,class:'edit_green_tgd'}).append($('<i>').attr('class','fas fa-edit'))).append($('<svg>').attr({height:'17px',width:widthSVGForLine}).append($('<line>').attr({class:'arrowGreen',x1:0,x2:widthSVGLine,y1:10,y2:10})))).append($('<span>').attr('class', 'li_tgd').append(linkView.targetView.model.attributes.question)).remove().html();
                $table.bootstrapTable('append',[{id:currentLink.id,ex:graphicTGD}])            
            }
        },        
        onCancel: function(){
        	currentLink.remove();
        }        
    });
    modal.render();
}

function loadModalGreenFromTable(currentLink,iris, parameters,functionsMap){
    //show only those parameters that are keys
    let keyParameters=filterKeyParam(parameters)
    var CustomView = Backbone.View.extend({
        initialize: function(opts) {
            this.iris = opts.displayIris;
            this.parameters=opts.displayParameters;
        },
        render: function() {
            var divContainer=document.createElement('div');
            divContainer.className="container";
            var divDropdown=document.createElement('div');
            divDropdown.id='ddIriConstructor';
            divDropdown.className='dropdown';
            
            var iriUrl=createText("iriUrl");
            
            var items = createList(this.iris);            
            var buttonDropIri=createButton(this.iris[0].text);
            divDropdown.appendChild(buttonDropIri);
            divDropdown.appendChild(iriUrl);
            divDropdown.appendChild(items);
            
            var divDropdownParameters=document.createElement('div');
            divDropdownParameters.id='ddParameter';
            divDropdownParameters.className='dropdown';
            var buttonDropParameter=createButton(this.parameters[0].text);
            divDropdownParameters.appendChild(buttonDropParameter);
            var itemsParameters=createList(this.parameters);        
            divDropdownParameters.appendChild(itemsParameters);
                        
            divContainer.appendChild(divDropdown);        
            divContainer.appendChild(divDropdownParameters);
            this.$el.html(divContainer);        
            return this;
        },
        events :{
            "click .dropdown-menu a":"changeName",
            "click #ddIriConstructor a":"changeInputText"
        },
        changeName: function(e) {                                           
            $(e.target).parents(".dropdown").find('.btn').html($(e.target).text().replace(/,/g,'&#10781;') + ' <span class="caret"></span>');            
            $(e.target).parents(".dropdown").find('.btn').val($(e.target).data('value'));
        },
        changeInputText:function (e) {
            $("#iriUrl").val(functionsMap.get($(e.target).text().trim()));            
        }
    });
    var modal = new BackboneBootstrapModals.ConfirmationModal({        
        headerViewOptions:{showClose:false, label: 'Define IRI Constructor'},
        bodyView: CustomView,
        bodyViewOptions: { displayIris: iris, displayParameters:keyParameters },
        onConfirm: function(a) {                                 
            if ($("#ddParameter .btn").text().trim()=="Constructor Parameters" || $("#ddIriConstructor .btn").text().trim()=="IRI Constructors"){
                alert("Need to specify IRI and Parameter")
                this.isConfirmed=false;                
            }else{            
                var valueIRI=$("#ddIriConstructor .btn").text().trim();
                valueIRI=valueIRI.concat("(");
                valueIRI=valueIRI.concat($("#ddParameter .btn").text().trim());
                valueIRI=valueIRI.concat(")");
                if (currentLink.labels().length>0){
                    currentLink.removeLabel(-1);
                }            
                currentLink.appendLabel({attrs: {text: {text: valueIRI}}});            
                let objGraphic=$table.bootstrapTable('getRowByUniqueId',currentLink.id)                                                
                var relName=$(objGraphic.ex)[0].textContent;
                var typeName=$(objGraphic.ex)[2].textContent;
                let graphicTGD=$('<div>').append($('<span>').attr('class','li_tgd').append(relName)).append($('<div>').attr('class','link_tgd').append(valueIRI).append($('<a>').attr({'data-tooltip':'true',title:'Edit',id:currentLink.id,class:'edit_green_tgd'}).append($('<i>').attr('class','fas fa-edit'))).append($('<svg>').attr({height:'17px',width:widthSVGForLine}).append($('<line>').attr({class:'arrowGreen',x1:0,x2:widthSVGLine,y1:10,y2:10})))).append($('<span>').attr('class', 'li_tgd').append(typeName)).remove().html();
                $table.bootstrapTable('updateByUniqueId',{id:currentLink.id,row:{ex:graphicTGD}})
            }
        },        
        onCancel: function(){            
        }        
    });
    modal.render();
}
// for obtaining the links that are related to tables
function getLinkTarget(links,port){
	var linksPort=[];
    for (var tLink of links){                                            
        if (tLink.attributes.target.port==port){
            linksPort.push(tLink);
        }
    };
    return linksPort;
}
// for obtaining the links that are related to types
function getLinkTargetType(links,port){
	var linksPort=[];    
    for (var tLink of links){                                            
        if (tLink.attributes.target.port==port.id){
            linksPort.push(tLink);
        }
    };
    return linksPort;
}

function getJoinsTable (viewModel,tables,initialNode){
    
    var inboundLinks=graphTGDs.getConnectedLinks(viewModel,{inbound:true});
    if (typeof(inboundLinks)!=="undefined"&& inboundLinks.length>0){   
        
        inboundLinks.forEach(function(boundLink){            
            var linkViewTable=boundLink.findView(paperTGDs);            
            var obj={id:initialNode.id+","+linkViewTable.sourceView.model.id, text:initialNode.text+","+linkViewTable.sourceView.model.attributes.question}
            tables.push(obj)
            //verify  self loop
            if (linkViewTable.sourceView.model.id!=linkViewTable.targetView.model.id){
                initialNode=obj;
                getJoinsTable(linkViewTable.sourceView.model,initialNode);
            }
        });        
    }
}

//it needs to test when table is self-referenced
function getJoinsTableAllPaths (currentModel, tables,currentNode,visited){
    var inoutLinks = graphTGDs.getConnectedLinks(currentModel, { deep: true }); // inbound and outbound    

    for (var edge of inoutLinks){
        var edgeView=edge.findView(paperTGDs);
        if (edgeView.sourceView.model.attributes.type=="db.Table" && edgeView.targetView.model.attributes.type=="db.Table"){            
            if (visited.includes(edge.id)==false){                                
                if (edgeView.sourceView.model.id==currentModel.id){ //wrong never equal the same id always different REDO!!
                    
                    var obj={id:currentNode.id+","+edgeView.targetView.model.id, text:currentNode.text+","+edgeView.targetView.model.attributes.question}
                    if (tables.some(ta=>ta['id']===obj.id)==false){
                        tables.push(obj);
                        visited.push(edge.id);
                        if (edgeView.sourceView.model.id!=edgeView.targetView.model.id){
                            currentNode=obj;                    
                            getJoinsTableAllPaths(edgeView.targetView.model,tables,currentNode,visited);
                        }                        
                    }
                }else if (edgeView.targetView.model.id==currentModel.id){
                    var obj={id:currentNode.id+","+edgeView.sourceView.model.id, text:currentNode.text+","+edgeView.sourceView.model.attributes.question}
                    if (tables.some(ta=>ta['id']===obj.id)==false){
                        tables.push(obj);
                        visited.push(edge.id);
                        if (edgeView.sourceView.model.id!=edgeView.targetView.model.id){
                            currentNode=obj;                    
                            getJoinsTableAllPaths(edgeView.sourceView.model,tables,currentNode,visited);
                        }
                    }
                }
                
            }
        }
    }
}

function getJoinsTableFromTo (currentModel,tables,targetNodeId,visited,currentJoin){
    if (currentModel.id==targetNodeId){
        if (tables.some(ta=>ta['id']===currentJoin.id)==false){
        tables.push(currentJoin);}        
    }else{
        var inoutLinks = graphTGDs.getConnectedLinks(currentModel, { deep: true }); 
        for (var edge of inoutLinks){
            var edgeView=edge.findView(paperTGDs);
            if (edgeView.sourceView.model.attributes.type=="db.Table" && edgeView.targetView.model.attributes.type=="db.Table"){
                if (visited.includes(edge.id)==false){
                    if (edgeView.sourceView.model.id==currentModel.id){                    
                        var aux=Object.assign({}, currentJoin);
                        var obj={id:currentJoin.id+","+edgeView.targetView.model.id, text:currentJoin.text+","+edgeView.targetView.model.attributes.question}
                        visited.push(edge.id);                            
                        currentJoin=obj;
                        getJoinsTableFromTo(edgeView.targetView.model,tables,targetNodeId,visited,currentJoin);                    
                        currentJoin=aux;                                        
                    }else if (edgeView.targetView.model.id==currentModel.id){                    
                        var aux=Object.assign({}, currentJoin);
                        var obj={id:currentJoin.id+","+edgeView.sourceView.model.id, text:currentJoin.text+","+edgeView.sourceView.model.attributes.question}                        
                        visited.push(edge.id); 
                        currentJoin=obj;
                        getJoinsTableFromTo(edgeView.sourceView.model,tables,targetNodeId,visited,currentJoin);                    
                        currentJoin=aux;                    
                    }else{
						console.log(edgeView)
					}
                }
                
            }
        }
    }
}


function link(g,source, portSource, target,portTarget,color,vertices){   
    var link = new joint.shapes.standard.Link({
        source: { id: source , port:portSource},
        target: { id: target , port:portTarget}, 
        router: { name: 'manhattan' },
        connector: { name: 'jumpover' },
        vertices: vertices || [],
        attrs:{line:{stroke:color}}

    });    
    g.addCell(link);
    return link;
}

function linkDataBase(g,source, portSource, target,portTarget,vertices) {      	
    var link = new joint.shapes.standard.Link({
        source: { id: target , port:'pk-'.concat(portTarget)},
        target: { id: source , port:'fk-'.concat(portSource)}, 
        router: { name: 'manhattan' },
        connector: { name: 'jumpover' },
        vertices: vertices || []

    });    
    g.addCell(link);
    return link;
}

function getTokens(value){
    var tokens=[];
    var j=0;
    var aux;
    
    for (var i=0; i < value.length; i++) {
        var theUnicode = value.charCodeAt(i);                
        if (theUnicode==10781){
            aux=value.substring(j,i);
            j=i+1;
            tokens.push(aux)            
        }
    }
    tokens.push(value.substring(j,i));
    return tokens;
}

function getSubjectFunctionTerm(graph, model,s_fterm, portType,bind){
    var aux_links=graph.getConnectedLinks(model, {outbound:true});
    for (var s_link of aux_links){                                
        if (model.getPort(s_link.attributes.source.port).group=='in' && s_link.attributes.target.port==portType){
            var fterm=s_link.labels()[0].attrs.text.text.split('(');
            s_fterm.push({function:fterm[0],args:[{rel:getKeyByValue(bind,model.attributes.question),attr:fterm[1].slice(0,-1)}]});
            break;
        }
    }        
}

function getNameAttribute(attributes,id){
    for (var att of attributes){
        if (att.id==id)
            return att.text;
    }
}


function getKeys(rows){	
	var keys=[];
	for (var row of rows){
		if (row.iskey){
			keys.push(row.text);
		}
	}
	return keys;
}

function getFunctionSymbol(myMap,objText){
	for (let [k, v] of myMap) {
	  if (v.includes(objText)){
		  return k;
	  }
	}
}
function createLinkTool(link){
	var verticesTool = new joint.linkTools.Vertices();
	var segmentsTool = new joint.linkTools.Segments();
	var sourceArrowheadTool = new joint.linkTools.SourceArrowhead();
	var targetArrowheadTool = new joint.linkTools.TargetArrowhead();
	var sourceAnchorTool = new joint.linkTools.SourceAnchor();
	var targetAnchorTool = new joint.linkTools.TargetAnchor();
	var boundaryTool = new joint.linkTools.Boundary();
	var removeButton = new joint.linkTools.Remove();
	var toolsView = new joint.dia.ToolsView({
		tools: [
			verticesTool, segmentsTool,
			sourceArrowheadTool, targetArrowheadTool,
			sourceAnchorTool, targetAnchorTool,
			boundaryTool, removeButton
		]
	});
	var linkView = link.findView(paperTGDs);
	linkView.addTools(toolsView)
}


function stTGD2(graph,paper,mapTables){
    var bindNames={}
    graph.getElements().forEach(function(element){
        if (element.attributes.type=="db.Table"){
            bindNames[element.attributes.question]=element.attributes.question;
        }
    });    
    var sigma={functions:convert_map_to_obj(mapSymbols),rules:[]};    
    for (var link of graph.getLinks()){
        var linkView=link.findView(paper);
        if (linkView.sourceView.model.attributes.type=="db.Table" && linkView.targetView.model.attributes.type=="shex.Type" && linkView.sourceMagnet.nodeName=='circle'){ 
			var rule={bind:bindNames,constraints:[],yield:[]};
            //construct body terms
            var objterm=[];
            var s_fterm=[];
			var relNames;
			console.log(link.labels())
            for (var lab of link.labels()){
                var annotation=lab.attrs.text.text;                
                if (annotation.includes('(')){
                    var fterm=annotation.split('(');                                        
                    objterm.push({function:fterm[0],args:[{rel:getKeyByValue(rule.bind,linkView.sourceView.model.attributes.question),attr:fterm[1].slice(0,-1)}]});                                   
                } else if (annotation.includes('function')){
					
					annotation=annotation.replace(/[\[\]]/g,"")					
					let paramAnnots=annotation.split(",")
					for (let  paramAnnot of paramAnnots){
                        if (paramAnnot.includes("function") && comparisonOp.includes(paramAnnot.split(":")[1].split(" ")[0]) ){                            
							rule.constraints.push({type:paramAnnot.split(":")[1].split(" ")[0],left:{rel:linkView.sourceView.model.attributes.question,attrs:[{attr:getSourceOptionNameLinkView(linkView)}]},right:{value:paramAnnot.split(":")[1].split(" ")[1]}})
						} else if (paramAnnot.includes("function")){                            
							rule.constraints.push({type:"apply",left:{rel:linkView.sourceView.model.attributes.question,attrs:[{attr:getSourceOptionNameLinkView(linkView)}]},right:{function:paramAnnot.split(":")[1]}})
						}
						if (paramAnnot.includes("filter")){							
							rule.constraints.push({type:"like",left:{rel:linkView.sourceView.model.attributes.question,attrs:[{attr:getSourceOptionNameLinkView(linkView)}]},right:{value:paramAnnot.split(":")[1]}})
						}
					}
					
					
				}else{
                    relNames=getTokens(annotation);                    
                    if (relNames.length==1){
                        //get subject term 
                        getSubjectFunctionTerm(graph,linkView.sourceView.model,s_fterm, linkView.targetView.model.attributes.ports.items[0].id,rule.bind);
                        
                    }else{
                        
                        for (var i=0;i<relNames.length;i++){
                            var name=relNames[i];
                            var mapFD=new Map();
                            var mapBFD=new Map();
                            for (var element of graph.getElements()){                            
                                if (mapTables.get(name)==element.id){
                                    var elementView=element.findView(paper);  
									
									if (i==relNames.length-1)
										getSubjectFunctionTerm(graph,elementView.model,s_fterm, linkView.targetView.model.attributes.ports.items[0].id,rule.bind);
									
                                    mapFD.set(name,[]);
                                    mapFD.set(relNames[i+1],[]);
                                    for (var opt of elementView.model.attributes.options){                                        
                                        if (!!opt.ref){											
                                            if (i<relNames.length && opt.ref.name==relNames[i+1]){
                                                var joinsA=mapFD.get(name);
                                                joinsA.push({name:opt.text});
                                                
                                                //obtain the attribute to which goes
                                                var nameAttRef="";
                                                for (var taElem of graph.getElements()){
                                                    if (mapTables.get(opt.ref.name)==taElem.id){
                                                        var taView=taElem.findView(paper);
                                                        nameAttRef=getNameAttribute(taView.model.attributes.options,opt.ref.id);
                                                        break;
                                                    }
                                                }                                                
                                                var joinsB=mapFD.get(opt.ref.name);
                                                joinsB.push({name:nameAttRef});         
                                            }else if (typeof(relNames[i-1])!=='undefined' && opt.ref.name==relNames[i-1]){
                                                if (mapBFD.has(name)){
                                                    var joinsA=mapBFD.get(name);
                                                    joinsA.push({name:opt.text});
                                                }else
                                                    mapBFD.set(name,[{name:opt.text}])
                                                //obtain the attribute to which goes
                                                var nameAttRef="";
                                                for (var taElem of graph.getElements()){
                                                    if (mapTables.get(opt.ref.name)==taElem.id){
                                                        var taView=taElem.findView(paper);
                                                        nameAttRef=getNameAttribute(taView.model.attributes.options,opt.ref.id);
                                                        break;
                                                    }
                                                }
                                                if (mapBFD.has(relNames[i-2])){
                                                    var joinsB=mapBFD.get(relNames[i-2])
                                                    joinsB.push({name:nameAttRef})
                                                }else
                                                    mapBFD.set(relNames[i-2],[{name:nameAttRef}]);
                                            }											
                                        }
                                    }
                                    break;
                                }
                            }                                                 
                            if (mapBFD.has(relNames[i-2])){                                
                                rule.constraints[rule.constraints.length-1].left.attrs=mapBFD.get(relNames[i-2]);
                                rule.constraints[rule.constraints.length-1].right.attrs=mapBFD.get(name);                                
                            }
							if (i<relNames.length-1)
								rule.constraints.push({type:"eq",left:{rel:name,attrs:mapFD.get(name)},right:{rel:relNames[i+1],attrs:mapFD.get(relNames[i+1])}});							
                            
                        }
                        
                    }                    
                }
            }
            if (objterm.length==0){
				for (var opt of linkView.sourceView.model.attributes.options){                        
                        if (opt.id==V(linkView.sourceMagnet.parentNode).attr('port')){                            
							objterm.push({rel:getKeyByValue(rule.bind,relNames[0]),attr:opt.text})
                            break;
                        }
                    }
				
			}
            var triTerms=[];
            //Add the type
            rule.yield.push({atom:linkView.targetView.model.attributes.question,args:s_fterm});
            //Add the triple
            var iriProperty=link.attributes.target.port.split(",")[0];
            triTerms.push(s_fterm);
            triTerms.push(iriProperty);
			triTerms.push(objterm);
            rule.yield.push({atom:"Triple",args:triTerms});
			sigma.rules.push(rule)
        }
    }    
    return sigma;
    
}

function getSourceOptionNameLinkView(linkView){
    for (var opt of linkView.sourceView.model.attributes.options){                        
        if (opt.id==V(linkView.sourceMagnet.parentNode).attr('port')){                            
            return opt.text;            
        }
    }
}
function getTargetOptionNameLinkView(linkView){
    for (var opt of linkView.targetView.model.attributes.options){                        
        if (opt.id==V(linkView.targetMagnet.parentNode).attr('port')){                            
            return opt.text;            
        }
    }
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

function orderTablesByShortestName(tables){    
    return tables.sort(function(a,b){
        if (a.id.split(",").length > b.id.split(",").length)
            return 1;
        if (a.id.split(",").length < b.id.split(",").length)
            return -1;
        return 0;
            
    })
}

function getHeight() {
        return $(window).height() - $('h1').outerHeight(true);
    }
function filterKeyParam(params){
    var keyparams=[]
    for (var param of params){
        if (param.iskey){
            keyparams.push(param)
        }
    }
    return keyparams;
}
const convert_map_to_obj = ( aMap => {
    const obj = {};
    aMap.forEach ((v,k) => { obj[k] = v });
    return obj;
});

