/* global Ext */
/**
 * @singleton
 */
Ext.define('Gnt.data.linearizator.CycleResolvers', function(thisClass) {

    /**
     * Doesn't resolve dependency cycle.
     *
     * @method none
     * @member Gnt.data.linearizator.CycleResolvers
     */
    function resolveCycleNone() {
        return false;
    }

    /**
     * Doesn't resolve dependency cycle and throws exception.
     *
     * @method exception
     * @member Gnt.data.linearizator.CycleResolvers
     */
    function resolveCycleByException() {
        Ext.Error.raise("Can't linearize dependent tasks, there's a cycle in the dependency chain!");
    }

    /**
     * Resolve a dependency cycle by cutting (forcefully marking one or more dependencies as resolved ('green')).
     *
     * @method cut
     * @member Gnt.data.linearizator.CycleResolvers
     */
    function resolveCycleByCuttingLinks$(sourceSet, depsData) {

        // The code assuming that nodes in source set form strict upward vertical hierarchy i.e. there can't be child
        // nodes missing parents but the opposite (downward) might be possible, i.e. it is possible for parent node to
        // miss children in the source set, as well as horizontal hierarchy might be lax, i.e. there might be nodes
        // whose siblings are not present in the source set.

        var sourceTree      = buildSourceTreeFromSourceSet(sourceSet, depsData),
            cuts            = {},
            cutsCollector   = function(from, to) {
                (cuts[from] || (cuts[from] = [])).push(to);
            };

        // Folding order is the following:
        //   A
        // +-+-+
        // B C D
        //
        // B - skipped
        // C - folded with B
        // D - folded with C and then folded with A
        traverseSourceTreePostOrder(sourceTree, function foldNode$(node) {

            // First we fold a node with it's previous sibling if one exists
            if (node.prevSibling) {

                // Folding previous sibling with the node, as the result node will represent both
                // folded previous sibling and itself
                node.foldedDeps = foldDepsForNodesHorizontaly(node.prevSibling.foldedDeps, node.foldedDeps, cutsCollector);
            }

            // Next if a node is the last sibling in a parent node then we fold it with parent node
            if (!node.nextSibling && node.parentNode) {

                // Folding node with it's parent, as the result parent node will represent both
                // folded child and itself
                node.parentNode.foldedDeps = foldDepsForNodesVerticaly(node.foldedDeps, node.parentNode.foldedDeps, cutsCollector);
            }

        });

        cutCycles$(depsData.fromById, cuts);

        return true;
    }

    // --- Private functions --------------------------------------------------------------------------------------- //
    // Source set represents a set of colored nodes, which might or might not have vertical links among themselves
    // regardless of that fact we have to build a traversable tree from that linear data structure, so if a task
    // from colored node has some siblings which are not in the sources set then those siblings shouldn't be present
    // in resulting tree, same goes for children and parent nodes. Due to this node skipping we might end with several
    // nodes having no parent nodes, such nodes will be then joined together under common pseudo root node.
    function buildSourceTreeFromSourceSet(sourceSet, depsData) {
        var root,
            roots = [],
            nodes = {},
            internalId, node;

        // In this loop we transform each colored node from a source set into a tree node (an object we use
        // to represent a tree node), and collecting each transformed node for furher realization as well as each
        // root node, i.e. nodes whose parents are not in the source set, for further processing.
        for (internalId in sourceSet) {
            if (sourceSet.hasOwnProperty(internalId)) {
                node = nodes[internalId] = createRawSourceTreeNode(sourceSet[internalId].task, sourceSet, depsData);
                if (!sourceSet.hasOwnProperty(node.parentNode)) {
                    roots.push(node);
                }
            }
        }

        // In this loop we relize collected tree nodes to point to other tree nodes instead of ids.
        for (internalId in nodes) {
            if (nodes.hasOwnProperty(internalId)) {
                nodes[internalId] = realizeRawSourceTreeNode$(nodes[internalId], nodes);
            }
        }

        if (roots.length == 1) {
            root = roots[0];
        }
        else {
            // The data structure is the same as createRawSourceTreeNode() returns
            root = {
                parentNode  : null,
                prevSibling : null,
                nextSibling : null,
                children    : roots,
                foldedDeps  : {}
            };
        }

        return root;
    }


    function createRawSourceTreeNode(storeNode, sourceSet, depsData) {
        var EO               = Ext.Object,
            fromDeps         = depsData.fromById,
            foldedDeps       = {},
            internalId       = storeNode.internalId,
            toIds,
            parentNode, nextSibling, prevSibling,
            children, childInternalId, childrenInternalIds,
            i, len;

        // We count outgoing horizontal (i.e. successors)  dependencies only, this is ok, since if we would count
        // both successors and predecessors then each successor - predecessor pair will create a direct loop
        // NOTE: It is important for following code that folded dependencies map contained node's internal id
        //       even if node has no outgoing dependencies
        toIds = EO.getKeys(fromDeps[internalId]);
        if (toIds.length) {
            foldedDeps[ internalId ] = toIds;
        }
        else {
            foldedDeps[ internalId ] = {};
        }

        // Vertical upward hierarchy might be either present or not, if it's present then it's present up to root
        parentNode = storeNode.parentNode && sourceSet.hasOwnProperty(storeNode.parentNode.internalId) && storeNode.parentNode.internalId;

        // Vertical downward hierarchy might be lax
        children = storeNode.childNodes || [];
        childrenInternalIds = [];

        for (i = 0, len = children.length; i < len; i++) {
            childInternalId = children[i].internalId;
            if (sourceSet.hasOwnProperty(childInternalId)) {
                childrenInternalIds.push(childInternalId);
            }
        }

        // Horizontal hierarchy might be lax.
        prevSibling = storeNode.previousSibling;
        while (prevSibling && !sourceSet.hasOwnProperty(prevSibling.internalId)) {
            prevSibling = prevSibling.previousSibling;
        }
        prevSibling = prevSibling && prevSibling.internalId;

        nextSibling = storeNode.nextSibling;
        while (nextSibling && !sourceSet.hasOwnProperty(nextSibling.internalId)) {
            nextSibling = nextSibling.nextSibling;
        }
        nextSibling = nextSibling && nextSibling.internalId;

        // That'll be our source node
        // now it references related nodes by ids.
        // Each original node which is referenced by a task but not present in source set has been skipped
        // The resulting data structure will be further realized to reference other tree nodes instances instead of ids.
        return {
            parentNode  : parentNode,
            prevSibling : prevSibling,
            nextSibling : nextSibling,
            children    : childrenInternalIds,
            foldedDeps  : foldedDeps
        };
    }


    function realizeRawSourceTreeNode$(node, nodes) {
        var i, len,
            children = node.children;

        for (i = 0, len = children.length; i < len; i++) {
            children[i] = nodes[children[i]];
        }

        node.parentNode  = (node.parentNode  || node.parentNode === 0)   && nodes[node.parentNode]  || null;
        node.prevSibling = (node.prevSibling || node.prevSibling === 0)  && nodes[node.prevSibling] || null;
        node.nextSibling = (node.nextSibling || node.nextSibling === 0)  && nodes[node.nextSibling] || null;

        return node;
    }


    function traverseSourceTreePostOrder(branchRoot, stepFn) {
        var children = branchRoot.children,
            i, len;

        for (i = 0, len = children.length; i < len; i++) {
            traverseSourceTreePostOrder(children[i], stepFn);
        }

        stepFn(branchRoot);

        return branchRoot;
    }

    function foldDepsForNodesHorizontaly(aDeps, bDeps, cutsCollector) {
        var crossDeps     = getHorizontalCrossDeps(aDeps, bDeps),
            fromAtoB      = crossDeps.fromAtoB,
            fromBtoA      = crossDeps.fromBtoA,
            fromAtoBtotal = crossDeps.fromAtoBtotal,
            fromBtoAtotal = crossDeps.fromBtoAtotal,
            cuts          = {};

        // A cycle is when A references some ids from B and B references some ids from A simultaneously
        if (fromAtoBtotal > 0 && fromBtoAtotal > 0) {
            cuts = fromAtoBtotal < fromBtoAtotal ? fromAtoB : fromBtoA;
        }

        // Now in cuts we have a minimal map of links to cut, collecting them
        collectCuts(cuts, cutsCollector);

        // Joining two nodes dependencies removing ones which are in cuts
        return joinDeps(aDeps, bDeps, cuts);
    }

    function foldDepsForNodesVerticaly(aDeps, bDeps, cutsCollector) {
        var EO = Ext.Object,
            crossDeps     = getHorizontalCrossDeps(aDeps, bDeps),
            fromAtoB      = crossDeps.fromAtoB,
            fromBtoA      = crossDeps.fromBtoA,
            cuts;

        // During vertical fold all horizontal links from A to B and vise versa should be removed
        cuts = EO.merge({}, fromAtoB, fromBtoA);

        // Collecting cuts
        collectCuts(cuts, cutsCollector);

        // Joining two nodes dependencies removing ones which are in cuts
        return joinDeps(aDeps, bDeps, cuts);
    }

    function getHorizontalCrossDeps(aDeps, bDeps) {
        var EO            = Ext.Object,
            EA            = Ext.Array,
            aIds          = EO.getKeys(aDeps),
            bIds          = EO.getKeys(bDeps),
            fromAtoB      = {},
            fromBtoA      = {},
            fromAtoBtotal = 0,
            fromBtoAtotal = 0,
            i, len, id, toX;

        // Searching for outgoing links from A to B
        for (i = 0, len = aIds.length; i < len; ++i) {
            id = aIds[i];
            toX = EA.intersect(bIds, aDeps[id]);
            if (toX.length) {
                fromAtoB[id] = toX;
                fromAtoBtotal += toX.length;
            }
        }

        // Searching for outgoing links from B to A
        for (i = 0, len = bIds.length; i < len; ++i) {
            id = bIds[i];
            toX = EA.intersect(aIds, bDeps[id]);
            if (toX.length) {
                fromBtoA[id] = toX;
                fromBtoAtotal += toX.length;
            }
        }

        return {
            fromAtoB      : fromAtoB,
            fromBtoA      : fromBtoA,
            fromAtoBtotal : fromAtoBtotal,
            fromBtoAtotal : fromBtoAtotal
        };
    }

    function collectCuts(cuts, cutsCollector) {
        var id, i, len, toX;

        for (id in cuts) {
            if (cuts.hasOwnProperty(id)) {
                toX = cuts[id];
                for (i = 0, len = toX.length; i < len; ++i) {
                    cutsCollector(id, toX[i]);
                }
            }
        }
    }

    function joinDeps(aDeps, bDeps, cuts) {
        var EO = Ext.Object,
            EA = Ext.Array,
            result,
            id;

        // Joining two nodes dependencies removing ones which are in cuts
        result = EO.merge({}, aDeps, bDeps);

        for (id in cuts) {
            if (cuts.hasOwnProperty(id) && result.hasOwnProperty(id)) {
                result[id] = EA.difference(result[id], cuts[id]);
            }
        }

        return result;
    }

    function cutCycles$(fromDeps, cuts) {
        var fromId, tos, toId, i, len;

        for (fromId in cuts) {
            if (cuts.hasOwnProperty(fromId)) {
                tos = cuts[fromId];
                for (i = 0, len = tos.length; i < len; ++i) {
                    toId = tos[i];
                    fromDeps[fromId][toId][0] = 'green';
                }
            }
        }

        return fromDeps;
    }

    // --- Public interface ---------------------------------------------------------------------------------------- //
    return {
        singleton   : true,

        'none'      : resolveCycleNone,
        'exception' : resolveCycleByException,
        'cut'       : resolveCycleByCuttingLinks$
    };
});
