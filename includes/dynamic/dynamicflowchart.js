Ext.define('dynamicflowchart', {
    alias: 'widget.dynamicflowchart',
    extend: 'Ext.panel.Panel',
	mixins: {
        field: 'Ext.form.field.Base'
    },

	/* DATA */
	datasource: 'ESEMPIO',
	datasourcetype: 'TABLE',
	valueField: 'ID',
	displayField: 'DESCRIZIONE',
	iconField: '',
	imageField:'',
	colorField:'',
	datasourcefield: 'dynamicflowchart1',
	defaultValue: '',
	
    instance: null,
    flowData: null,

	layout: {
        type: 'hbox',
        align: 'stretch'
    },
    items: [{
        title: 'Object To Drag',
        name: 'MyPalette',
        xtype: 'panel',
        flex: 0.2,
        minHeight: 100,
        title: 'Left Panel',
        layout: 'fit'
    }, {
        title: 'Map',
        name: 'MyMap',
        xtype: 'panel',
        region: 'east',
        title: 'East Panel',
        flex: 0.8,
        minHeight: 100,
        layout: 'fit'
    }],
    initComponent: function () {
        // Define GoJS diagram initialization
        var self = this;
        self.goDiagram = null;
        self.goModel = null;
        self.goNodeDataArray = [];
        self.goLinkDataArray = [];

        this.callParent();
    },

    afterRender: function () {
        this.callParent(arguments);

        // Initialize GoJS diagram
        this.initializeDiagram();
        //this.loadFromJSON();
    },

    initializeDiagram: function () {
        var self = this; // Reference to GraphPanel instance

        var MyMap = this.down('panel[name=MyMap]');
        var diagramDiv = MyMap.body.dom;

        var MyPalette = this.down('panel[name=MyPalette]');
        var paletteDiv = MyPalette.body.dom;

        var $ = go.GraphObject.make;

        this.goDiagram = $(go.Diagram, diagramDiv, {
            initialContentAlignment: go.Spot.Left,
            // when a drag-drop occurs in the Diagram's background, make it a top-level node
            mouseDrop: e => this.finishDrop(e, null),
            layout: // Diagram has simple horizontal layout
                new go.GridLayout({
                wrappingWidth: Infinity,
                alignment: go.GridLayout.Position,
                cellSize: new go.Size(1, 1)
            }),
            "commandHandler.archetypeGroupData": {
                isGroup: true,
                text: "Group",
                horiz: false
            },
            "undoManager.isEnabled": true
        });

        this.goDiagram.groupTemplate =
            new go.Group("Auto", {
                background: "blue",
                ungroupable: true,
                // highlight when dragging into the Group
                mouseDragEnter: (e, grp, prev) => this.highlightGroup(e, grp, true),
                mouseDragLeave: (e, grp, next) => this.highlightGroup(e, grp, false),
                computesBoundsAfterDrag: true,
                // when the selection is dropped into a Group, add the selected Parts into that Group;
                // if it fails, cancel the tool, rolling back any changes
                mouseDrop: this.finishDrop,
                handlesDragDropForMembers: true, // don't need to define handlers on member Nodes and Links
                // Groups containing Groups lay out their members horizontally
                layout: this.makeLayout(false)
            })
            .bind("layout", "horiz", this.makeLayout)
            .bind(new go.Binding("background", "isHighlighted", h => h ? "rgba(255,0,0,0.2)" : "transparent").ofObject())
            .add(new go.Shape("Rectangle", {
                    fill: null,
                    stroke: this.defaultColor(false),
                    fill: this.defaultColor(false),
                    strokeWidth: 2
                })
                .bind("stroke", "horiz", this.defaultColor)
                .bind("fill", "horiz", this.defaultColor))
            .add(
                new go.Panel("Vertical") // title above Placeholder
                .add(new go.Panel("Horizontal", // button next to TextBlock
                        {
                            stretch: go.GraphObject.Horizontal,
                            background: this.defaultColor(false)
                        })
                    .bind("background", "horiz", this.defaultColor)
                    .add(go.GraphObject.make("SubGraphExpanderButton", {
                        alignment: go.Spot.Right,
                        margin: 5
                    }))
                    .add(new go.TextBlock({
                            alignment: go.Spot.Left,
                            editable: true,
                            margin: 5,
                            font: this.defaultFont(false),
                            opacity: 0.95, // allow some color to show through
                            stroke: "#404040"
                        })
                        .bind("font", "horiz", this.defaultFont)
                        .bind("text", "text", null, null)) // `null` as the fourth argument makes this a two-way binding
                ) // end Horizontal Panel
                .add(new go.Placeholder({
                    padding: 5,
                    alignment: go.Spot.TopLeft
                }))
            ) // end Vertical Panel

        this.goDiagram.nodeTemplate =
            new go.Node("Auto", { // dropping on a Node is the same as dropping on its containing Group, even if it's top-level
                mouseDrop: (e, node) => this.finishDrop(e, node.containingGroup)
            })
            .add(new go.Shape("RoundedRectangle", {
                fill: "rgba(172, 230, 0, 0.9)",
                stroke: "white",
                strokeWidth: 0.5
            }))
            .add(new go.TextBlock({
                    margin: 7,
                    editable: true,
                    font: "bold 13px sans-serif",
                    opacity: 0.90
                })
                .bind("text", "text", null, null)); // `null` as the fourth argument makes this a two-way binding

        //console.log(MyPaletteDiv);

        myPalette = new go.Palette(paletteDiv, {
            nodeTemplateMap: this.goDiagram.nodeTemplateMap,
            groupTemplateMap: this.goDiagram.groupTemplateMap
        });

        myPalette.model = new go.GraphLinksModel([{
            text: "New Node",
            color: "#ACE600"
        }, {
            isGroup: true,
            text: "H Group",
            horiz: true
        }, {
            isGroup: true,
            text: "V Group",
            horiz: false
        }]);

        // Define node template
        this.goDiagram.nodeTemplate = $(
            go.Node,
            'Auto',
            new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
            $(go.Shape, 'RoundedRectangle', {
                fill: 'white'
            }),
            $(go.TextBlock, {
                margin: 10
            }, new go.Binding('text', 'name'))
        );

        // Define group template
        this.goDiagram.groupTemplate = $(
            go.Group,
            'Auto',
            new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
            $(go.Shape, 'RoundedRectangle', {
                fill: 'rgba(128,128,128,0.2)',
                stroke: 'gray'
            }),
            $(go.Placeholder, {
                padding: 10
            })
        );

        // Define link template
        this.goDiagram.linkTemplate = $(
            go.Link,
            $(go.Shape),
            $(go.Shape, {
                toArrow: 'Standard'
            }),
            $(go.TextBlock, {
                segmentOffset: new go.Point(0, -10)
            }, new go.Binding('text', 'text'))
        );

        // Create model and assign data
        this.goModel = $(go.GraphLinksModel);
        this.goDiagram.model = this.goModel;

    },

    makeLayout: function (horiz) { // a Binding conversion function
        if (horiz) {
            return new go.GridLayout({
                wrappingWidth: Infinity,
                alignment: go.GridLayout.Position,
                cellSize: new go.Size(1, 1),
                spacing: new go.Size(4, 4)
            });
        } else {
            return new go.GridLayout({
                wrappingColumn: 1,
                alignment: go.GridLayout.Position,
                cellSize: new go.Size(1, 1),
                spacing: new go.Size(4, 4)
            });
        }
    },
    defaultColor: function (horiz) { // a Binding conversion function
        return horiz ? "rgba(255, 221, 51, 0.55)" : "rgba(51,211,229, 0.5)";
    },
    defaultFont: function (horiz) { // a Binding conversion function
        return horiz ? "bold 20px sans-serif" : "bold 16px sans-serif";
    },
    // this function is used to highlight a Group that the selection may be dropped into
    highlightGroup: function (e, grp, show) {
        if (!grp) return;
        e.handled = true;
        if (show) {
            // cannot depend on the grp.diagram.selection in the case of external drag-and-drops;
            // instead depend on the DraggingTool.draggedParts or .copiedParts
            var tool = grp.diagram.toolManager.draggingTool;
            var map = tool.draggedParts || tool.copiedParts; // this is a Map
            // now we can check to see if the Group will accept membership of the dragged Parts
            if (grp.canAddMembers(map.toKeySet())) {
                grp.isHighlighted = true;
                return;
            }
        }
        grp.isHighlighted = false;
    },
    // Upon a drop onto a Group, we try to add the selection as members of the Group.
    // Upon a drop onto the background, or onto a top-level Node, make selection top-level.
    // If this is OK, we're done; otherwise we cancel the operation to rollback everything.
    finishDrop: function (e, grp) {
        var ok = (grp !== null ? grp.addMembers(grp.diagram.selection, true) : e.diagram.commandHandler.addTopLevelParts(e.diagram.selection, true));
        if (!ok) e.diagram.currentTool.doCancel();
    },
    reexpand: function (e) {
        myDiagram.commit(diag => {
            var level = parseInt(document.getElementById("levelSlider").value);
            diag.findTopLevelGroups().each(g => expandGroups(g, 0, level))
        }, "reexpand");
    },
    expandGroups: function (g, i, level) {
        if (!(g instanceof go.Group)) return;
        g.isSubGraphExpanded = i < level;
        g.memberParts.each(m => expandGroups(m, i + 1, level))
    },

    layoutDiagram: function () {
        this.goDiagram.layoutDiagram(true);
    },

/* add property to manage as field in form*/
initValue : function(){
    this.setValue(this.value);
},
setValue: function (new_value) {
  var self = this;
  self.text = new_value;
  var jsonData = Ext.decode(self.text);
    if (jsonData && jsonData.nodeDataArray && jsonData.linkDataArray) {
        self.goModel.nodeDataArray = jsonData.nodeDataArray;
        self.goModel.linkDataArray = jsonData.linkDataArray;
        self.goModel.groupDataArray = jsonData.groupDataArray || [];
        self.goModel.groupLinkDataArray = jsonData.groupLinkDataArray || [];
    } else {
        console.error('Invalid JSON file format');
    }
},
getValue: function () {
  var me = this;
  //var flowData = me.getFlowData();
  //me.text = Ext.encode(flowData);
  return '' + me.text;
},
getSubmitData: function () {
  var me = this;
  var data = {};
  var panel = this.up('graphpanel');

    var jsonData = {
        nodeDataArray: this.goModel.nodeDataArray,
        linkDataArray: this.goModel.linkDataArray,
        groupDataArray: this.goModel.groupDataArray,
        groupLinkDataArray: this.goModel.groupLinkDataArray
    };
    var jsonContent = JSON.stringify(jsonData, null, 2);

  me.text = jsonContent;
  data = {};
  data[me.getName()] = '' + me.text;
  return data;
}
});
	