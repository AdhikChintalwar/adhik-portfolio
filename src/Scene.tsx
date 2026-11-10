import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';

type Props = {progress: React.MutableRefObject<number>; reduced:boolean};
const MODEL=`${import.meta.env.BASE_URL}models/porsche-911-gt3-rs.glb`;
const clamp=THREE.MathUtils.clamp;
const smooth=(x:number)=>{const t=clamp(x,0,1);return t*t*(3-2*t)};
const lerp=THREE.MathUtils.lerp;

function Porsche({progress,reduced}:{progress:React.MutableRefObject<number>;reduced:boolean}) {
 const gltf=useGLTF(MODEL);
 const drive=useRef<THREE.Group>(null);
 const setup=useMemo(()=>{
  const scene=gltf.scene.clone(true);
  const bounds=new THREE.Box3().setFromObject(scene);
  const size=bounds.getSize(new THREE.Vector3());
  const center=bounds.getCenter(new THREE.Vector3());
  // The supplied GLB uses centimeter-scale coordinates and +Z is the nose.
  const scale=5.25/Math.max(size.z,.001);
  const origin=new THREE.Group();
  scene.position.set(-center.x,-bounds.min.y,-center.z);
  origin.scale.setScalar(scale);
  origin.add(scene);
  const wheels:THREE.Object3D[]=[];
  let steering:THREE.Object3D|undefined;
  scene.traverse(o=>{
   if (/^TwiXeR_992_gt3rs_style_1_chrome_wheels_20x9(?:\.00[1-3])?$/.test(o.name)) wheels.push(o);
   if(o.name==='TwiXeR_992_steer_3') steering=o;
   if((o as THREE.Mesh).isMesh){(o as THREE.Mesh).castShadow=true;(o as THREE.Mesh).receiveShadow=true;}
  });
  const wheelRest=wheels.map(w=>w.rotation.clone());
  const steerRest=steering?.rotation.clone();
  return {origin,wheels,wheelRest,steering,steerRest,scale,size};
 },[gltf.scene]);
 useFrame(({clock},dt)=>{
  const p=clamp(progress.current,0,1);
  const depart=smooth((p-.80)/.20);
  if(drive.current){
   drive.current.position.z=-depart*4.0;
   drive.current.position.y=reduced?0:Math.sin(clock.elapsedTime*8)*.002;
  }
  const idle=reduced?0:clock.elapsedTime*.17;
  const rotation=p*18+idle+depart*9;
  setup.wheels.forEach((wheel,i)=>{
   wheel.rotation.set(setup.wheelRest[i].x+rotation,setup.wheelRest[i].y,setup.wheelRest[i].z);
  });
  if(setup.steering&&setup.steerRest){
   setup.steering.rotation.set(setup.steerRest.x,setup.steerRest.y,setup.steerRest.z+Math.sin(p*12)*.17+(reduced?0:Math.sin(clock.elapsedTime*.7)*.035));
  }
 });
 return <group ref={drive}><primitive object={setup.origin}/></group>;
}

// Each camera point is in normalized vehicle dimensions: full car length = 5.25 units.
// Camera is kept outside the body for all shots; wheel/wing shots use offset targets.
const shots=[
 {p:0,eye:[4.2,2.05,7.9],target:[0,.85,0],fov:42},
 {p:.12,eye:[3.0,1.35,5.3],target:[0,.65,1.25],fov:43},
 {p:.25,eye:[-3.7,1.85,3.8],target:[0,.95,.6],fov:43},
 {p:.38,eye:[-2.75,1.65,.65],target:[0,1.0,.25],fov:43},
 {p:.51,eye:[3.2,1.05,1.75],target:[1,.55,1.35],fov:40},
 {p:.64,eye:[3.6,1.8,-2.8],target:[0,1.2,-1.65],fov:42},
 {p:.78,eye:[1.9,1.35,-5.8],target:[0,.8,-1.2],fov:42},
 {p:.89,eye:[0,1.7,-7.8],target:[0,.85,-1.4],fov:43},
 {p:1,eye:[0,2.0,-11],target:[0,.8,-4.0],fov:45}
];
function CameraChoreography({progress,reduced}:{progress:React.MutableRefObject<number>;reduced:boolean}){
 const {camera,size}=useThree();
 const focus=useRef(new THREE.Vector3());
 useFrame(({clock},dt)=>{
  const p=clamp(progress.current,0,1);
  let i=0;while(i<shots.length-2&&p>shots[i+1].p)i++;
  const a=shots[i],b=shots[i+1];
  const t=smooth((p-a.p)/(b.p-a.p));
  const mobile=size.width<700;
  const depart=smooth((p-.8)/.2);
  const pos=new THREE.Vector3(...a.eye).lerp(new THREE.Vector3(...b.eye),t);
  const look=new THREE.Vector3(...a.target).lerp(new THREE.Vector3(...b.target),t);
  if(mobile){pos.x*=1.3;pos.z*=1.25;pos.y+=.35;}
  // In the final chapter, follow the car as it drives away.
  pos.z-=depart*1.5;look.z-=depart*4;
  if(!reduced)pos.x+=Math.sin(clock.elapsedTime*.23)*.035;
  const alpha=1-Math.exp(-dt*3.5);
  camera.position.lerp(pos,alpha);
  focus.current.lerp(look,alpha);
  camera.lookAt(focus.current);
  if(camera instanceof THREE.PerspectiveCamera){
   camera.fov=THREE.MathUtils.damp(camera.fov,lerp(a.fov,b.fov,t)+(mobile?10:0),3.5,dt);
   camera.near=.03;camera.far=120;camera.updateProjectionMatrix();
  }
 });
 return null;
}
function Stage({progress,reduced}:Props){return <>
 <color attach="background" args={['#080e0b']}/>
 <fog attach="fog" args={['#080e0b',18,45]}/>
 <ambientLight intensity={1.55}/>
 <hemisphereLight args={['#d8ffe6','#252725',1.4]}/>
 <directionalLight position={[4,8,7]} intensity={3.3} color="#ffffff"/>
 <spotLight position={[-5,6,4]} intensity={105} color="#baff3c" angle={.75} penumbra={.85}/>
 <spotLight position={[4,5,-4]} intensity={120} color="#ef2638" angle={.8} penumbra={.9}/>
 <pointLight position={[0,2,-6]} intensity={35} color="#ff3448" distance={16}/>
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.025,0]} receiveShadow><planeGeometry args={[200,200]}/><meshStandardMaterial color="#0c1510" metalness={.32} roughness={.38}/></mesh>
 <Suspense fallback={null}><Porsche progress={progress} reduced={reduced}/></Suspense>
 <CameraChoreography progress={progress} reduced={reduced}/>
 </>}
export default function Scene(props:Props){return <Canvas dpr={[1,1.65]} gl={{antialias:true,powerPreference:'high-performance'}} camera={{position:[4,2,8],fov:42}}><Stage {...props}/></Canvas>}
