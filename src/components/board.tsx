import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { IDragEvent, ILink, INodes } from "../interfaces";

const CIRCLE_RADIUS = 20;
export default function Board() {
  const ref = useRef<HTMLDivElement>(null);

  const [nodes, setNodes] = useState<INodes[]>([
    { id: "Jair", nombre: "Jair", main: true },
    { id: "Angelica", nombre: "Angelica" },
    { id: "Willy", nombre: "Willy" },
    { id: "Daniel", nombre: "Daniel" },
    { id: "Jose", nombre: "Jose" },
    { id: "Miranda", nombre: "Miranda" },
  ]);
  const [links, setLinks] = useState<ILink[]>([
    { source: "Jair", target: "Angelica" },
    { source: "Jair", target: "Willy" },
    { source: "Jair", target: "Daniel" },
    { source: "Jair", target: "Jose" },
    { source: "Willy", target: "Daniel" },
    { source: "Willy", target: "Angelica" },
    { source: "Willy", target: "Jose" },
    { source: "Daniel", target: "Jose" },
    { source: "Jose", target: "Miranda" },
  ]);

  useEffect(() => {
    const width = ref.current?.clientWidth ?? 0;
    const height = ref.current?.clientHeight ?? 0;

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3.forceLink<INodes, ILink>(links).id((d) => d.id)
      )
      .force("charge", d3.forceManyBody().strength(-(CIRCLE_RADIUS * 100)))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const svg = d3
      .select("#board-container")
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%");

    const link = svg
      .append("g")
      .attr("stroke", "#000")
      .attr("stroke-opacity", 0.3)
      .selectAll()
      .data(links)
      .join("line");

    const node = svg
      .append("g")
      .attr("stroke", "#ffffff1f")
      .attr("stroke-width", 1)
      .attr("class", "node")
      .selectAll()
      .data(nodes)
      .join("circle")
      .attr("r", (val) => CIRCLE_RADIUS)
      .attr("fill", (val) => {
        if (val.main) return "#fea500";
        return "#064168";
      })
      .attr("id", (val) => `node-${val.id}`)
      .attr("name", (d) => d.id)
      .on("mouseover", (e, d) => {
        // console.log(d);
      });

    const text = svg
      .selectAll()
      .data(nodes)
      .join("text")
      .attr("fill", "#000")

      .attr("font-size", "smaller")
      .text((val) => {
        return val.id;
      });
    node.append("title").text((d) => d.id);

    node.call(
      // eslint-disable-next-line no-unnecessary-generics
      d3
        .drag<any, INodes>()
        .on("start", (e: IDragEvent) => {
          if (!e.active) simulation.alphaTarget(0.3).restart();

          e.subject.fx = e.subject.x;
          e.subject.fy = e.subject.y;
        })
        .on("drag", (e: IDragEvent) => {
          e.subject.fx = e.x;
          e.subject.fy = e.y;
        })
        .on("end", (e: IDragEvent) => {
          if (!e.active) simulation.alphaTarget(0);
          e.subject.fx = null;
          e.subject.fy = null;
        })
    );

    simulation.on("tick", () => {
      // console.log("xd");
      node.attr("cx", (d) => d.x ?? 0).attr("cy", (d) => d.y ?? 0);
      link
        .attr("x1", (d) => (d.source as INodes).x ?? 0)
        .attr("y1", (d) => (d.source as INodes).y ?? 0)
        .attr("x2", (d) => (d.target as INodes).x ?? 0)
        .attr("y2", (d) => (d.target as INodes).y ?? 0);

      text
        .attr("x", (d) => (d.x ?? 0) - CIRCLE_RADIUS)
        .attr("y", (d) => (d.y ?? 0) + CIRCLE_RADIUS + 20);
    });
  }, [links, nodes]);

  useEffect(() => {
    return () => document.getElementsByTagName("svg").item(0)?.remove();
  }, []);
  return (
    <>
      <div
        ref={ref}
        id="board-container"
        className="w-[700px] h-[700px] relative m-12 border-black border-[1px]"
      ></div>
      <button
        onClick={() => {
          setLinks((prev) => [
            ...prev,
            { source: "Daniel", target: "Miranda" },
          ]);
        }}
      >
        Add new nember
      </button>
    </>
  );
}
