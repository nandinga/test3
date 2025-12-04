import { Vector3, MathUtils } from 'three';

// Generate a random point inside a sphere
export const getRandomSpherePoint = (radius: number): Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);
  return new Vector3(x, y, z);
};

// Generate a random point on a cone surface (volumetric)
export const getConePoint = (height: number, bottomRadius: number): Vector3 => {
  const y = Math.random() * height; // Height from bottom (0 to height)
  const relativeHeight = y / height; // 0 to 1
  const currentRadius = bottomRadius * (1 - relativeHeight);
  
  // Distribute points somewhat evenly around the tree, thicker at bottom
  const angle = Math.random() * Math.PI * 2;
  const radiusOffset = Math.sqrt(Math.random()) * currentRadius; // Sqrt for uniform disk distribution
  
  const x = Math.cos(angle) * radiusOffset;
  const z = Math.sin(angle) * radiusOffset;
  
  // Center the cone vertically
  return new Vector3(x, y - height / 2, z);
};

// Generate a point specifically on the surface/edge for lights/ornaments
export const getConeSurfacePoint = (height: number, bottomRadius: number): Vector3 => {
    const y = Math.random() * height;
    const relativeHeight = y / height;
    const currentRadius = bottomRadius * (1 - relativeHeight);
    
    const angle = Math.random() * Math.PI * 2;
    
    // Push slightly out or in for depth
    const variance = 0.8 + Math.random() * 0.4; 
    const r = currentRadius * variance;

    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    
    return new Vector3(x, y - height / 2, z);
}
