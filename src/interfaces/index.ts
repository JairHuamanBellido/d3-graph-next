import * as d3 from "d3";

export interface INodes extends d3.SimulationNodeDatum {
  id: string;
  nombre: string;
  main?: boolean;
}

export interface ILink extends d3.SimulationLinkDatum<INodes> {}
export interface IExtraDragEvents extends d3.SubjectPosition {
  fx: number | null;
  fy: number | null;
}
export interface IDragEvent
  extends d3.D3DragEvent<any, INodes, IExtraDragEvents> {}
