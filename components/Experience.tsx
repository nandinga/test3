import React, { useRef } from 'react';
import { OrbitControls, PerspectiveCamera, Environment, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { MagicTree } from './MagicTree';
import { TreeState, UserPhoto } from '../types';
import { Vector2 } from 'three';

interface ExperienceProps {
  treeState: TreeState;
  userImages: UserPhoto[];
}

export const Experience: React.FC<ExperienceProps> = ({ treeState, userImages }) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 5, 30]} fov={50} />
      <OrbitControls 
        makeDefault 
        autoRotate={treeState === TreeState.TREE_SHAPE} 
        autoRotateSpeed={0.5}
        enablePan={false}
        minDistance={10}
        maxDistance={50}
        maxPolarAngle={Math.PI / 1.5}
      />

      {/* Lighting - Cinematic Gold/Red tint */}
      <ambientLight intensity={0.2} color="#001100" />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={100} 
        color="#ffaa00" 
        castShadow 
      />
      <spotLight 
        position={[-10, 5, -10]} 
        angle={0.5} 
        penumbra={1} 
        intensity={50} 
        color="#aa0020" 
      />
      
      {/* Background Ambience */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Environment preset="city" background={false} blur={0.8} />
      
      {/* Floating dust/magic particles */}
      <Sparkles count={200} scale={30} size={5} speed={0.4} opacity={0.5} color="#FFD700" />

      {/* The Star of the Show */}
      <MagicTree treeState={treeState} userImages={userImages} />

      {/* Post Processing */}
      <EffectComposer enableNormalPass={false}>
        <Bloom 
            luminanceThreshold={1.2} 
            mipmapBlur 
            intensity={1.5} 
            radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.8} />
        <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
      </EffectComposer>
    </>
  );
};