import { Vector3, Color } from 'three';

export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE',
}

export interface TreeElementData {
  id: number;
  scatterPos: Vector3;
  treePos: Vector3;
  scale: number;
  rotation: [number, number, number];
  color: Color;
  type: 'ornament' | 'light' | 'needle';
  speed: number; // For individual variation in movement
  phase: number; // For blinking lights
}

export interface UserPhoto {
  id: string;
  dataUrl: string; // Base64
}
