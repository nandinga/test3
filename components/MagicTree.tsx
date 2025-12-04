import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, Vector3, Color, MeshStandardMaterial, Group } from 'three';
import { TreeState, TreeElementData, UserPhoto } from '../types';
import { getRandomSpherePoint, getConePoint, getConeSurfacePoint } from '../utils/math';
import { Image, Text } from '@react-three/drei';

const TEMP_OBJECT = new Object3D();
const TEMP_POS = new Vector3();
const TEMP_VEC = new Vector3();

// Configuration
const NEEDLE_COUNT = 3500;
const ORNAMENT_COUNT = 300;
const LIGHT_COUNT = 200;
const SCATTER_RADIUS = 25;
const TREE_HEIGHT = 18;
const TREE_RADIUS = 7;

interface MagicTreeProps {
  treeState: TreeState;
  userImages: UserPhoto[];
}

export const MagicTree: React.FC<MagicTreeProps> = ({ treeState, userImages }) => {
  const needlesRef = useRef<InstancedMesh>(null);
  const ornamentsRef = useRef<InstancedMesh>(null);
  const lightsRef = useRef<InstancedMesh>(null);
  const photoGroupRef = useRef<Group>(null);

  // --- Data Generation ---
  
  // Needles (The green bulk of the tree)
  const needlesData = useMemo(() => {
    return Array.from({ length: NEEDLE_COUNT }).map((_, i) => ({
      id: i,
      scatterPos: getRandomSpherePoint(SCATTER_RADIUS),
      treePos: getConePoint(TREE_HEIGHT, TREE_RADIUS),
      scale: 0.2 + Math.random() * 0.4,
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [number, number, number],
      color: new Color().setHSL(0.4, 0.8, 0.1 + Math.random() * 0.2), // Dark emerald variations
      speed: 0.02 + Math.random() * 0.04,
    }));
  }, []);

  // Ornaments (Red Velvet & Gold)
  const ornamentsData = useMemo(() => {
    return Array.from({ length: ORNAMENT_COUNT }).map((_, i) => {
      const isGold = Math.random() > 0.6; // 40% Gold, 60% Red
      return {
        id: i,
        scatterPos: getRandomSpherePoint(SCATTER_RADIUS * 1.2),
        treePos: getConeSurfacePoint(TREE_HEIGHT, TREE_RADIUS),
        scale: 0.3 + Math.random() * 0.4,
        rotation: [0, 0, 0] as [number, number, number],
        // Deep Red (#800020) or Gold (#FFD700)
        color: isGold ? new Color('#FFD700') : new Color('#720e1e'),
        type: 'ornament',
        speed: 0.015 + Math.random() * 0.03,
      };
    });
  }, []);

  // Lights (Emissive points)
  const lightsData = useMemo(() => {
    return Array.from({ length: LIGHT_COUNT }).map((_, i) => ({
      id: i,
      scatterPos: getRandomSpherePoint(SCATTER_RADIUS * 1.5),
      treePos: getConeSurfacePoint(TREE_HEIGHT, TREE_RADIUS * 0.9), // Slightly buried
      scale: 0.15,
      rotation: [0,0,0] as [number, number, number],
      color: new Color('#fffDD0'), // Warm white/cream
      type: 'light',
      speed: 0.01 + Math.random() * 0.05,
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  // Calculate photo positions (pre-calculate slots on the tree)
  const photoSlots = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => {
      const pos = getConeSurfacePoint(TREE_HEIGHT, TREE_RADIUS);
      // Ensure they face outward from center
      const angle = Math.atan2(pos.x, pos.z);
      return {
        scatterPos: getRandomSpherePoint(SCATTER_RADIUS * 0.8),
        treePos: pos.multiplyScalar(1.1), // Float slightly off the tree
        rotationY: angle,
      };
    });
  }, []);


  // --- Animation Loop ---

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const isTree = treeState === TreeState.TREE_SHAPE;

    // 1. Animate Needles
    if (needlesRef.current) {
      needlesData.forEach((data, i) => {
        const target = isTree ? data.treePos : data.scatterPos;
        
        // We use a simple object to hold current state (reconstructing it from matrix is expensive, 
        // usually we'd store currentPos in a Float32Array, but for <5000 items this is okay in JS)
        needlesRef.current!.getMatrixAt(i, TEMP_OBJECT.matrix);
        TEMP_OBJECT.matrix.decompose(TEMP_POS, TEMP_OBJECT.quaternion, TEMP_VEC); // Scale into TEMP_VEC
        
        // Lerp position
        TEMP_POS.lerp(target, data.speed * (isTree ? 1.5 : 0.5)); // Faster to assemble, slower to explode
        
        // Add subtle floating noise in scatter mode
        if (!isTree) {
          TEMP_POS.y += Math.sin(time + data.id) * 0.01;
        }

        TEMP_OBJECT.position.copy(TEMP_POS);
        TEMP_OBJECT.scale.setScalar(data.scale);
        TEMP_OBJECT.rotation.set(data.rotation[0], data.rotation[1], data.rotation[2]);
        
        // Spin needles slightly in scatter mode
        if(!isTree) {
            TEMP_OBJECT.rotation.x += delta * 0.2;
            TEMP_OBJECT.rotation.y += delta * 0.2;
        }

        TEMP_OBJECT.updateMatrix();
        needlesRef.current!.setMatrixAt(i, TEMP_OBJECT.matrix);
        
        // Color variation is static, set once in useEffect technically, but safe here
        needlesRef.current!.setColorAt(i, data.color);
      });
      needlesRef.current.instanceMatrix.needsUpdate = true;
      if (needlesRef.current.instanceColor) needlesRef.current.instanceColor.needsUpdate = true;
    }

    // 2. Animate Ornaments
    if (ornamentsRef.current) {
      ornamentsData.forEach((data, i) => {
        const target = isTree ? data.treePos : data.scatterPos;
        
        ornamentsRef.current!.getMatrixAt(i, TEMP_OBJECT.matrix);
        TEMP_OBJECT.matrix.decompose(TEMP_POS, TEMP_OBJECT.quaternion, TEMP_VEC);
        
        TEMP_POS.lerp(target, data.speed);
        
        // Orbit effect in scatter mode
        if (!isTree) {
           const orbitSpeed = 0.2;
           TEMP_POS.applyAxisAngle(new Vector3(0,1,0), delta * orbitSpeed * (i % 2 === 0 ? 1 : -1));
        }

        TEMP_OBJECT.position.copy(TEMP_POS);
        TEMP_OBJECT.scale.setScalar(data.scale);
        TEMP_OBJECT.updateMatrix();
        ornamentsRef.current!.setMatrixAt(i, TEMP_OBJECT.matrix);
        ornamentsRef.current!.setColorAt(i, data.color as Color);
      });
      ornamentsRef.current.instanceMatrix.needsUpdate = true;
      if (ornamentsRef.current.instanceColor) ornamentsRef.current.instanceColor.needsUpdate = true;
    }

    // 3. Animate Lights (Blinking)
    if (lightsRef.current) {
      lightsData.forEach((data, i) => {
        const target = isTree ? data.treePos : data.scatterPos;
        
        lightsRef.current!.getMatrixAt(i, TEMP_OBJECT.matrix);
        TEMP_OBJECT.matrix.decompose(TEMP_POS, TEMP_OBJECT.quaternion, TEMP_VEC);
        
        TEMP_POS.lerp(target, data.speed);
        TEMP_OBJECT.position.copy(TEMP_POS);

        // Twinkle Effect
        const brightness = (Math.sin(time * 3 + data.phase) + 1) * 0.5 + 0.5; // 0.5 to 1.5
        const scale = data.scale * brightness;
        
        TEMP_OBJECT.scale.setScalar(scale);
        TEMP_OBJECT.updateMatrix();
        lightsRef.current!.setMatrixAt(i, TEMP_OBJECT.matrix);
        
        // Boost color for bloom
        const c = (data.color as Color).clone().multiplyScalar(brightness * 2);
        lightsRef.current!.setColorAt(i, c);
      });
      lightsRef.current.instanceMatrix.needsUpdate = true;
      if (lightsRef.current.instanceColor) lightsRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Needles - Tetrahedrons are cheap and look spikey */}
      <instancedMesh ref={needlesRef} args={[undefined, undefined, NEEDLE_COUNT]} castShadow receiveShadow>
        <tetrahedronGeometry args={[1, 0]} />
        <meshStandardMaterial roughness={0.8} metalness={0.1} />
      </instancedMesh>

      {/* Ornaments - Spheres */}
      <instancedMesh ref={ornamentsRef} args={[undefined, undefined, ORNAMENT_COUNT]} castShadow receiveShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
            roughness={0.2} 
            metalness={0.8} 
            envMapIntensity={1.5}
        />
      </instancedMesh>

      {/* Lights - Small spheres with high emissivity */}
      <instancedMesh ref={lightsRef} args={[undefined, undefined, LIGHT_COUNT]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial 
            emissive={'#fffDD0'} 
            emissiveIntensity={4} 
            toneMapped={false} 
            color={'#fffDD0'}
        />
      </instancedMesh>

      {/* Dynamic Photos */}
      <group ref={photoGroupRef}>
        {userImages.map((img, index) => {
            if (index >= photoSlots.length) return null;
            const slot = photoSlots[index];
            
            return (
                <PhotoPlane 
                    key={img.id}
                    url={img.dataUrl}
                    targetPos={treeState === TreeState.TREE_SHAPE ? slot.treePos : slot.scatterPos}
                    targetRotY={slot.rotationY}
                    isTree={treeState === TreeState.TREE_SHAPE}
                />
            );
        })}
      </group>
    </group>
  );
};

// Sub-component for individual photos to handle their own lerping cleanly
const PhotoPlane: React.FC<{ url: string, targetPos: Vector3, targetRotY: number, isTree: boolean }> = ({ url, targetPos, targetRotY, isTree }) => {
    const meshRef = useRef<any>(null);
    const vec = new Vector3();

    useFrame((_, delta) => {
        if (!meshRef.current) return;
        
        // Lerp Position
        meshRef.current.position.lerp(targetPos, delta * 2);

        // Lerp Rotation
        // In scatter, random rotation. In tree, face outward.
        if (isTree) {
            meshRef.current.lookAt(0, meshRef.current.position.y, 0);
            meshRef.current.rotation.y += Math.PI; // Correct for Image component orientation
        } else {
             meshRef.current.rotation.x += delta * 0.1;
             meshRef.current.rotation.z += delta * 0.1;
        }
    });

    return (
        <group ref={meshRef}>
            {/* The Polaroid Border */}
            <mesh position={[0, 0, -0.01]}>
                <planeGeometry args={[2.2, 2.6]} />
                <meshStandardMaterial color="#FFFAF0" roughness={1} />
            </mesh>
            {/* The Image */}
            <Image url={url} scale={[2, 2.4]} position={[0,0,0]} transparent />
        </group>
    )
}
