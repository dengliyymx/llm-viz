
import { ILSSchematic } from "@/src/cpu/ImportExport";
export const mux_2InternalSchematic: ILSSchematic = {"id":"c-6f4cdt0t","name":"Mux 2 Internal","parentCompDefId":"core/flow/mux2","parentComp":{"id":"","defId":"core/flow/mux2","x":0,"y":0,"r":0,"args":{"reverse":false,"bitWidth":32}},"compArgs":{"w":5,"h":8,"ports":[{"id":"","name":"","type":1,"x":4,"y":8,"width":32},{"id":"a","name":"A","type":1,"x":0,"y":2,"width":32},{"id":"b","name":"B","type":1,"x":0,"y":7,"width":32},{"id":"s","name":"S","type":1,"x":3,"y":0,"width":1},{"id":"o","name":"O","type":2,"x":5,"y":4,"width":1}]},"compBbox":{"minX":4,"minY":-8,"maxX":22,"maxY":46},"model":{"wires":[{"nodes":[{"id":0,"x":20,"y":19,"edges":[1],"ref":{"type":3,"id":"4","compNodeId":"o"}},{"id":1,"x":22,"y":19,"edges":[0],"ref":{"type":3,"id":"3","compNodeId":"a"}}]},{"nodes":[{"id":0,"x":8,"y":1,"edges":[1],"ref":{"type":3,"id":"12","compNodeId":"a"}},{"id":1,"x":4,"y":1,"edges":[0],"ref":{"type":3,"id":"0","compNodeId":"a"}}]},{"nodes":[{"id":0,"x":10,"y":-1,"edges":[1],"ref":{"type":3,"id":"12","compNodeId":"b"}},{"id":1,"x":10,"y":-2,"edges":[0,2]},{"id":2,"x":9,"y":-2,"edges":[1],"ref":{"type":3,"id":"13","compNodeId":"o"}}]},{"nodes":[{"id":0,"x":8,"y":37,"edges":[1],"ref":{"type":3,"id":"14","compNodeId":"a"}},{"id":1,"x":3,"y":37,"edges":[0],"ref":{"type":3,"id":"1","compNodeId":"a"}}]},{"nodes":[{"id":0,"x":10,"y":35,"edges":[1],"ref":{"type":3,"id":"14","compNodeId":"b"}},{"id":1,"x":10,"y":34,"edges":[0,2]},{"id":2,"x":5,"y":34,"edges":[1,3]},{"id":3,"x":5,"y":-2,"edges":[2,4,5]},{"id":4,"x":6,"y":-2,"edges":[3],"ref":{"type":3,"id":"13","compNodeId":"i"}},{"id":5,"x":5,"y":-6,"edges":[3,6]},{"id":6,"x":13,"y":-6,"edges":[5,7]},{"id":7,"x":13,"y":-8,"edges":[6],"ref":{"type":3,"id":"2","compNodeId":"a"}}]},{"nodes":[{"id":0,"x":12,"y":1,"edges":[1],"ref":{"type":3,"id":"12","compNodeId":"o"}},{"id":1,"x":14,"y":1,"edges":[0,2]},{"id":2,"x":14,"y":18,"edges":[1,3]},{"id":3,"x":17,"y":18,"edges":[2],"ref":{"type":3,"id":"4","compNodeId":"a"}}]},{"nodes":[{"id":0,"x":12,"y":37,"edges":[1],"ref":{"type":3,"id":"14","compNodeId":"o"}},{"id":1,"x":14,"y":37,"edges":[0,2]},{"id":2,"x":14,"y":20,"edges":[1,3]},{"id":3,"x":17,"y":20,"edges":[2],"ref":{"type":3,"id":"4","compNodeId":"b"}}]}],"comps":[{"id":"0","defId":"core/comp/port","x":-2,"y":0,"r":0,"args":{"portId":"a","name":"A","w":6,"h":2,"type":1,"portPos":0,"rotate":0,"bitWidth":32,"signed":false,"flags":3,"valueMode":1,"inputOverride":false,"inputValueOverride":16,"extId":"a"}},{"id":"1","defId":"core/comp/port","x":-3,"y":36,"r":0,"args":{"portId":"b","name":"B","w":6,"h":2,"type":1,"portPos":0,"rotate":0,"bitWidth":32,"signed":false,"flags":3,"valueMode":1,"inputOverride":true,"inputValueOverride":6,"extId":""}},{"id":"2","defId":"core/comp/port","x":14,"y":-10,"r":1,"args":{"portId":"sel","name":"S","w":2,"h":2,"type":1,"portPos":1,"rotate":0,"bitWidth":1,"signed":false,"flags":3,"valueMode":2,"inputOverride":true,"inputValueOverride":0,"extId":""}},{"id":"3","defId":"core/comp/port","x":28,"y":20,"r":2,"args":{"portId":"out","name":"O","w":6,"h":2,"type":2,"portPos":2,"rotate":0,"bitWidth":32,"signed":false,"flags":3,"valueMode":1,"inputOverride":true,"inputValueOverride":0,"extId":""}},{"id":"4","defId":"core/gate/or","x":17,"y":17,"r":0,"args":{"rotate":0,"bitWidth":32}},{"id":"12","defId":"core/gate/and-bcast","x":8,"y":-1,"r":0,"args":{"rotate":0,"bitWidth":32}},{"id":"13","defId":"core/gate/not","x":6,"y":-3,"r":0,"args":{"rotate":0,"bitWidth":1}},{"id":"14","defId":"core/gate/and-bcast","x":8,"y":35,"r":0,"args":{"rotate":0,"bitWidth":32,"extId":""}}]}};

export const mux_2InternalSchematicStr = `#wire-schema 1
C 0 core/comp/port p:-2,0,0 c:{"portId":"a","name":"A","w":6,"h":2,"type":1,"portPos":0,"rotate":0,"bitWidth":32,"signed":false,"flags":3,"valueMode":1,"inputOverride":false,"inputValueOverride":16,"extId":"a"}
C 1 core/comp/port p:-3,36,0 c:{"portId":"b","name":"B","w":6,"h":2,"type":1,"portPos":0,"rotate":0,"bitWidth":32,"signed":false,"flags":3,"valueMode":1,"inputOverride":true,"inputValueOverride":6,"extId":""}
C 2 core/comp/port p:14,-10,1 c:{"portId":"sel","name":"S","w":2,"h":2,"type":1,"portPos":1,"rotate":0,"bitWidth":1,"signed":false,"flags":3,"valueMode":2,"inputOverride":true,"inputValueOverride":0,"extId":""}
C 3 core/comp/port p:28,20,2 c:{"portId":"out","name":"O","w":6,"h":2,"type":2,"portPos":2,"rotate":0,"bitWidth":32,"signed":false,"flags":3,"valueMode":1,"inputOverride":true,"inputValueOverride":0,"extId":""}
C 4 core/gate/or p:17,17,0 c:{"rotate":0,"bitWidth":32}
C 12 core/gate/and-bcast p:8,-1,0 c:{"rotate":0,"bitWidth":32}
C 13 core/gate/not p:6,-3,0 c:{"rotate":0,"bitWidth":1}
C 14 core/gate/and-bcast p:8,35,0 c:{"rotate":0,"bitWidth":32,"extId":""}
W 0 ns:[20,19 p:4/o|22,19,0 p:3/a]
W 3 ns:[8,1 p:12/a|4,1,0 p:0/a]
W 4 ns:[10,-1 p:12/b|10,-2,0|9,-2,1 p:13/o]
W 5 ns:[8,37 p:14/a|3,37,0 p:1/a]
W 6 ns:[10,35 p:14/b|10,34,0|5,34,1|5,-2,2|6,-2,3 p:13/i|5,-6,3|13,-6,5|13,-8,6 p:2/a]
W 7 ns:[12,1 p:12/o|14,1,0|14,18,1|17,18,2 p:4/a]
W 8 ns:[12,37 p:14/o|14,37,0|14,20,1|17,20,2 p:4/b]
`;