//noinspection ThisExpressionReferencesGlobalObjectJS
_.extend(this, graphs());

describe("quick find", function() {
    it("can determine if points are connected", function() {
        var quickFind = newQuickFindIndex(3);
        expect(quickFind.areConnected(1, 2)).toBe(false);
        expect(quickFind.areConnected(1, 3)).toBe(false);

        quickFind.connect(1, 2);
        expect(quickFind.areConnected(1, 2)).toBe(true);
        expect(quickFind.areConnected(1, 3)).toBe(false);

        quickFind.connect(2, 3);
        expect(quickFind.areConnected(1, 2)).toBe(true);
        expect(quickFind.areConnected(1, 3)).toBe(true);
    });
});

describe("graph", function() {
    beforeEach(initNodesAndLinks);

    it("sends update with graph nodes and links", function() {
        var graph = newGraph({
            nodes: [nodeA, nodeB, nodeC],
            links: [linkAB, linkBC, linkCA]
        });
        var received = captureUpdateOf(graph);

        graph.sendUpdate();

        expect(received().nodes).toEqual([nodeA, nodeB, nodeC]);
        expect(received().links).toEqual([linkAB, linkBC, linkCA]);
        expect(received().linkStrengthExtent).toEqual({min: 1, max: 3});
    });
});

describe("graph with node cluster selection", function() {
    beforeEach(initNodesAndLinks);

    it("sends update with empty list of selected nodes", function() {
        var graph = withNodeClusterSelection(newGraph({
            nodes: [nodeA, nodeB, nodeC],
            links: [linkAB, linkBC, linkCA]
        }));
        var received = captureUpdateOf(graph);

        graph.sendUpdate();

        expect(received().isSelectionUpdate).toEqual(false);
        expect(received().selectedNodes).toEqual([]);
        expect(nodeA.selected).toEqual(false);
        expect(nodeB.selected).toEqual(false);
        expect(nodeC.selected).toEqual(false);
    });

    it("on selection sends update with list of selected nodes", function() {
        var graph = withNodeClusterSelection(newGraph({
            nodes: [nodeA, nodeB, nodeC],
            links: [linkCA]
        }));
        var received = captureUpdateOf(graph);

        graph.sendUpdate();
        graph.selectRelatedNodes(nodeA);

        expect(received().isSelectionUpdate).toEqual(true);
        expect(received().selectedNodes).toEqual([nodeA, nodeC]);
        expect(nodeA.selected).toEqual(true);
        expect(nodeB.selected).toEqual(false);
        expect(nodeC.selected).toEqual(true);
    });
});

describe("graph with node neighbors selection", function() {
    beforeEach(initNodesAndLinks);

    it("on selection sends update with list of selected nodes", function() {
        var graph = withNodeNeighborsSelection(newGraph({
            nodes: [nodeA, nodeB, nodeC],
            links: [linkAB, linkBC]
        }));
        var received = captureUpdateOf(graph);

        graph.sendUpdate();
        graph.selectRelatedNodes(nodeA);

        expect(received().isSelectionUpdate).toEqual(true);
        expect(received().selectedNodes).toEqual([nodeA, nodeB]);
        expect(nodeA.selected).toEqual(true);
        expect(nodeB.selected).toEqual(true);
        expect(nodeC.selected).toEqual(false);
    });
});

describe("graph with removed nodes", function() {
    beforeEach(initNodesAndLinks);

    it("sends update without removed nodes", function() {
        var graph = withRemovedNodes(newGraph({
            nodes: [nodeA, nodeB, nodeC],
            links: [linkAB, linkBC, linkCA]
        }));
        var received = captureUpdateOf(graph);

        graph.sendUpdate();
        graph.removeNode(nodeC);

        expect(received().nodes).toEqual([nodeA, nodeB]);
        expect(received().links).toEqual([linkAB]);

        graph.removeNodesInClusterWith(nodeA);

        expect(received().nodes).toEqual([]);
        expect(received().links).toEqual([]);
    });

    it("can undo node removal", function() {
        var graph = withRemovedNodes(newGraph({
            nodes: [nodeA, nodeB, nodeC],
            links: [linkAB, linkBC, linkCA]
        }));
        var received = captureUpdateOf(graph);

        graph.sendUpdate();
        graph.removeNodesInClusterWith(nodeA);
        graph.undoNodeRemoval();

        expect(received().nodes).toEqual([nodeA, nodeB, nodeC]);
        expect(received().links).toEqual([linkAB, linkBC, linkCA]);
    });
});

describe("graph with node cluster size filter", function() {
    beforeEach(initNodesAndLinks);

    it("sends update with current filter value", function() {
        var graph = withNodeClusterSizeFilter(newGraph({
            nodes: [nodeA, nodeB, nodeC],
            links: [linkAB]
        }));
        var received = null;
        graph.onUpdate(function(it) {
            received = it;
        });

        graph.sendUpdate();

        expect(received.minNodeClusterSize).toEqual(2);
        expect(received.nodes).toEqual([nodeA, nodeB]);
        expect(received.links).toEqual([linkAB]);
    });

    it("removes nodes which are in a cluster smaller than filter value", function() {
        var graph = withNodeClusterSizeFilter(newGraph({
            nodes: [nodeA, nodeB, nodeC],
            links: [linkAB]
        }));
        var received = captureUpdateOf(graph);

        graph.sendUpdate();
        graph.setMinNodeClusterSize(3);

        expect(received().minNodeClusterSize).toEqual(3);
        expect(received().nodes).toEqual([]);
        expect(received().links).toEqual([]);
    });
});

describe("graph with link strength filter", function() {
    beforeEach(initNodesAndLinks);

    it("sends update with current filter value", function() {
        var graph = withLinkStrengthFilter(newGraph({
            nodes: [nodeA, nodeB, nodeC],
            links: [linkAB, linkBC, linkCA]
        }));
        var received = captureUpdateOf(graph);

        graph.sendUpdate();

        expect(received().minLinkStrength).toEqual(-1);
        expect(received().links).toEqual([linkAB, linkBC, linkCA]);
    });

    it("removes links weaker than current filter value", function() {
        var graph = withLinkStrengthFilter(newGraph({
            nodes: [nodeA, nodeB, nodeC],
            links: [linkAB, linkBC, linkCA]
        }));
        var received = null;
        graph.onUpdate(function(it) {
            received = it;
        });

        graph.sendUpdate();
        graph.setMinLinkStrength(2);

        expect(received.minLinkStrength).toEqual(2);
        expect(received.links).toEqual([linkBC, linkCA]);
    });
});

describe("graph with node selection, removal and link strength filter", function() {
    beforeEach(initNodesAndLinks);

    it("combines all modifications", function() {
        var graph = withNodeClusterSelection(withRemovedNodes(withLinkStrengthFilter(newGraph({
            nodes: [nodeA, nodeB, nodeC],
            links: [linkAB, linkBC]
        }))));
        var received = captureUpdateOf(graph);

        graph.sendUpdate();
        graph.removeNode(nodeB);
        graph.selectRelatedNodes(nodeA);

        expect(received().nodes).toEqual([nodeA, nodeC]);
        expect(received().links).toEqual([]);
        expect(nodeA.selected).toEqual(true);
        expect(nodeB.selected).toEqual(false);
        expect(nodeC.selected).toEqual(false);
    });
});


var nodeA, nodeB, nodeC, linkAB, linkBC, linkCA;
function initNodesAndLinks() {
    nodeA = {name: "A", group: "group1", index: 0};
    nodeB = {name: "B", group: "group1", index: 1};
    nodeC = {name: "C", group: "group1", index: 2};
    linkAB = {source: nodeA, target: nodeB, value: 1};
    linkBC = {source: nodeB, target: nodeC, value: 2};
    linkCA = {source: nodeC, target: nodeA, value: 3};
}