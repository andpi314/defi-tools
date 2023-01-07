import { useCallback, useMemo } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  Edge,
  Node,
  MiniMap,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  Connection,
  NodeToolbar,
} from "reactflow";
import rawNodes from "../../data/nodes.json";
// 👇 you need to import the reactflow styles
import "reactflow/dist/style.css";
import { AnalysisNode, ProcessedTransaction } from "./types";

const analysisNodes = rawNodes as AnalysisNode[];

function Flow() {
  // const initialNodes = [
  //   { id: "1", position: { x: 0, y: 0 }, data: { label: "1" } },
  //   { id: "2", position: { x: 0, y: 100 }, data: { label: "2" } },
  //   { id: "3", position: { x: 0, y: 130 }, data: { label: "3" } },
  // ];

  // const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

  console.log(analysisNodes);

  const parsedNodes: Node[] = useMemo(
    () =>
      analysisNodes.map((n, index) => {
        const node: Node = {
          id: n.address,
          position: { x: index * 10, y: index * 100 },
          data: { label: n.address },
          style: { minWidth: 400 },
        };
        return node;
      }),
    [analysisNodes]
  );

  const parsedEdges: Edge[] = useMemo(() => {
    const incoming = analysisNodes.reduce(
      (acc: Map<string, ProcessedTransaction>, curr) => {
        curr.transactions.incoming.forEach((trx) => {
          acc.set(trx.hash, trx);
        });
        //  acc.push(...curr.transactions.incoming);
        return acc;
      },
      new Map()
    );

    return Array.from(incoming, ([name, value]) => value).map((trx) => ({
      id: trx.hash,
      source: trx.to,
      target: trx.from,
      label: trx.hash,
    }));
  }, [analysisNodes]);

  console.log(parsedEdges);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>(parsedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>(parsedEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const nodeColor = (node: Node) => {
    switch (node.type) {
      case "input":
        return "#6ede87";
      case "output":
        return "#6865A5";
      default:
        return "#ff0072";
    }
  };

  return (
    <>
      <p>{"React flow"}</p>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={(event, edge) => console.log(edge, event)}
      >
        <MiniMap nodeColor={nodeColor} nodeStrokeWidth={3} zoomable pannable />
        <Controls />
        <Background />
        <NodeToolbar />
      </ReactFlow>
    </>
  );
}

function FlowWithProvider(props: any) {
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  );
}

export default FlowWithProvider;
