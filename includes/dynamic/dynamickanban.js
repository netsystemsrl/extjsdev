Ext.define('dynamickanban', {
    extend: 'Ext.view.View',
    xtype: 'mycolumn',
    alias: 'widget.dynamickanban',
    padding: 5,
    margin: 5,
    style: 'background-color: #F5F5F5; color: #FF0000; title: abc',
    itemSelector: 'div.nameselector',
    tpl: ['<tpl for=".">', '<div class="nameselector<tpl if="isTemp"> temp</tpl>">', '<b>{name}</b><br>{prio}<hr>{attribute}', '</div>', '</tpl>'],
    listeners: {
        render: function (me) {
            var tempRec = null;
            // Create drag zone
            this.dragZone = new Ext.dd.DragZone(me.getEl(), {
                // On receipt of a mousedown event, see if it is within a DataView node.
                // Return a drag data object if so.
                getDragData: function (e) {
                    // Use the DataView's own itemSelector (a mandatory property) to
                    // test if the mousedown is within one of the DataView's nodes.
                    var sourceEl = e.getTarget(me.itemSelector, 10);
                    // If the mousedown is within a DataView node, clone the node to produce
                    // a ddel element for use by the drag proxy. Also add application data
                    // to the returned data object.
                    if (sourceEl) {
                        d = sourceEl.cloneNode(true);
                        d.id = Ext.id();
                        return {
                            ddel: d,
                            sourceEl: sourceEl,
                            sourceZone: me,
                            sourceStore: me.store,
                            repairXY: Ext.fly(sourceEl).getXY(),
                            draggedRecord: me.getRecord(sourceEl)
                        }
                    }
                },
                getRepairXY: function () {
                    return this.dragData.repairXY;
                }
            });

            /*function readTextFile(file, callback) {
                var rawFile = new XMLHttpRequest();
                rawFile.overrideMimeType("Data/json");
                rawFile.open("GET", file, true);
                rawFile.onreadystatechange = function() {
                    if (rawFile.readyState === 4 && rawFile.status == "200") {
                        callback(rawFile.responseText);
                    }
                }
                rawFile.send(null);
                console.log("Data/json");
            }

            //usage:
            readTextFile("/Data/data.json", function(text){
                var data = JSON.parse(text);
                console.log(data);
            });


            var x = 0;
            var array = Array();
            function display_array()
            {
               var e = "<hr/>";
               for (var y=0; y<array.length; y++)
               {
                 e += "Element " + y + " = " + array[y] + "<br/>";
               }
               document.getElementById("Result").innerHTML = e;
            }
            */

            this.dropZone = new Ext.dd.DropZone(me.getEl(), {
                // Helper method to return correct class string if drop
                // is permitted or not.
                getAllowed: function (allowed) {
                    var proto = Ext.dd.DropZone.prototype;
                    return allowed ? proto.dropAllowed : proto.dropNotAllowed;
                },
                notifyOver: function (source) {
                    return this.getAllowed(source !== me.dragZone);
                },
                // Called when dragged element is over a drop zone.
                // If allowed, make a copy of the dragged record to
                // display in the zone (temporarily) by adding the record
                // to the column store.
                notifyEnter: function (source, e, data) {
                    var allowed = source !== me.dragZone;
                    if (allowed) {
                        tempRec = data.draggedRecord.clone();
                        // Set record field 'isTemp' to true which will cause the dataview
                        // template to use the 'temp' style defined in app.css
                        tempRec.set('isTemp', true);
                        me.getStore().add(tempRec);
                    }
                    return this.getAllowed(allowed);
                },
                // Called when the dragged element leaves a container. Remove
                // the temporary record from the column store, removing the placeholder.
                notifyOut: function (source, e, data) {
                    if (tempRec) {
                        me.getStore().remove(tempRec);
                    }
                },
                // When a dragged source is over a container,
                // set the appropriate drop style for the dragged element.
                onContainerOver: function (source, e, data) {
                    return this.getAllowed(source === me.dragZone);
                },
                // When the element is dropped on a column, check to see
                // if we are dropping on the same column or not. If not,
                // then remove record from source column, add record to
                // drop column.
                onContainerDrop: function (source, e, data) {
                    var overSame = source == me.dragZone,
                        dragData = source.dragData;
                    if (overSame) {
                        // Do not allow drop over same zone
                        // Return false to do a repair.
                        return false;
                    }
                    var rec = dragData.draggedRecord;
                    dragData.sourceStore.remove(rec);
                    me.getStore().add(rec);
                    // Clear temporary record
                    tempRec = null;
                    return true;
                }
            });
        }
    }
});