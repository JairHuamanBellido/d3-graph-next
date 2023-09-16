import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { IDragEvent, ILink, INodes } from "../interfaces";

const CIRCLE_RADIUS = 20;

type SVG = d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
type NodeSVG =  d3.Selection<SVGCircleElement | null, INodes, SVGGElement, unknown>;
type LinkSVG =  d3.Selection<SVGLineElement | null, ILink, SVGGElement, unknown>
type TextSVG =   d3.Selection<SVGTextElement | null, INodes, SVGGElement, unknown>

function appendNodes(
  svg: SVG,
  simulation: d3.Simulation<INodes, ILink>,
  nodes: INodes[]
){
  // Add nodes to svg and get the reference
  const appendedNodes = svg
    .append("g")
    .attr("class", "node")
    .attr("stroke", "#ffffff1f")
    .attr("stroke-width", 1)
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

  appendedNodes.append("title").text((d) => d.id);

  // Add drag capabilities
  appendedNodes.call(
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

  return {appendedNodes,}
}

function removeNodes(svg: SVG){
  svg.select(".node").remove();
}


function appendTexts(
  svg: SVG,
  nodes: INodes[]
){
  const appendedTexts = svg
    .append("g")
    .attr("class", "text")
    .selectAll()
    .data(nodes)
    .join("text")
    .attr("fill", "#000")
    .attr("font-size", "smaller")
    .text((val) => {
      return val.id;
    });

  return {appendedTexts}
}

function removeTexts(svg: SVG){
  svg.select(".text").remove();
}

function appendLinks(
  svg: SVG,
  links: ILink[]
){
  const appendedLinks = svg
    .append("g")
    .attr("class", "link")
    .attr("stroke", "#000")
    .attr("stroke-opacity", 0.3)
    .selectAll()
    .data(links)
    .join("line");

  return {appendedLinks}
}

function removeLinks(svg: SVG){
  svg.select(".link").remove();
}

function createSimulation(
  element: HTMLElement|null,
  nodes: INodes[], links: ILink[]){
  const width = element?.clientWidth ?? 0;
  const height = element?.clientHeight ?? 0;

  return d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3.forceLink<INodes, ILink>(links).id((d) => d.id)
    )
    .force("charge", d3.forceManyBody().strength(-(CIRCLE_RADIUS * 100)))
    .force("center", d3.forceCenter(width / 2, height / 2))
}

function addSimulationTick(
  simulation: d3.Simulation<INodes, ILink>,
  nodes: NodeSVG,
  links: LinkSVG,
  texts: TextSVG,
){
  simulation.on("tick", () => {
    nodes.attr("cx", (d) => d.x ?? 0).attr("cy", (d) => d.y ?? 0);
    links
      .attr("x1", (d) => (d.source as INodes).x ?? 0)
      .attr("y1", (d) => (d.source as INodes).y ?? 0)
      .attr("x2", (d) => (d.target as INodes).x ?? 0)
      .attr("y2", (d) => (d.target as INodes).y ?? 0);
    texts
      .attr("x", (d) => (d.x ?? 0) - CIRCLE_RADIUS)
      .attr("y", (d) => (d.y ?? 0) + CIRCLE_RADIUS + 20);
  })
}



const INITIAL_NODES: INodes[] = [
  { id: "Jair", nombre: "Jair", main: true },
  { id: "Angelica", nombre: "Angelica" },
  { id: "Willy", nombre: "Willy" },
  { id: "Daniel", nombre: "Daniel" },
  { id: "Jose", nombre: "Jose" },
  { id: "Miranda", nombre: "Miranda" },
];

const INITIAL_LINKS: ILink[] = [
  { source: "Jair", target: "Angelica" },
  { source: "Jair", target: "Willy" },
  { source: "Jair", target: "Daniel" },
  { source: "Jair", target: "Jose" },
  { source: "Willy", target: "Daniel" },
  { source: "Willy", target: "Angelica" },
  { source: "Willy", target: "Jose" },
  { source: "Daniel", target: "Jose" },
  { source: "Jose", target: "Miranda" },
];

export default function Board() {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<SVG|null>(null);


  const [nodes, setNodes] = useState<INodes[]>(INITIAL_NODES);
  const [links, setLinks] = useState<ILink[]>(INITIAL_LINKS);

  useEffect(() => {
    // First and only creation of the svg
    const createdSvg = d3
      .select("#board-container")
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%");

    setSvg(createdSvg);
  }, []);

  useEffect(() => {
    if(!svg) return;

    // Remove all nodes, links and texts
    removeLinks(svg);
    removeTexts(svg);
    removeNodes(svg);

    // Create new nodes, links and texts
    const simulation = createSimulation(ref.current, nodes, links);
    const {appendedNodes} = appendNodes(svg, simulation, nodes);
    const {appendedTexts} = appendTexts(svg, nodes);
    const {appendedLinks} = appendLinks(svg, links);
    addSimulationTick(simulation, appendedNodes, appendedLinks, appendedTexts);
  }, [svg, links, nodes]);

  useEffect(() => {
    return () => document.getElementsByTagName("svg").item(0)?.remove();
  }, []);

  return (
    <>
      <div
        ref={ref}
        id="board-container"
        style={{ width: "700px", height: "700px" }}
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
