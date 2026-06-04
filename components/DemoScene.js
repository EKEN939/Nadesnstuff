"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { MAPS } from "@/data/maps";

const TEAM_COLOR = { T: 0xe0b341, CT: 0x5aa9e0 };

// 3D reconstruction: the radar is the ground, players are figures, the camera can
// sit at a player's eyes (POV). No walls/occlusion — that needs real map geometry.
export default function DemoScene({ data, frame, mode, povIndex }) {
  const mountRef = useRef(null);
  const refs = useRef({});

  useEffect(() => {
    if (!data || !mountRef.current) return;
    const mount = mountRef.current;
    const W = mount.clientWidth || 700;
    const H = Math.round(W * 9 / 16);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x16181b);
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(40, 80, 20);
    scene.add(dir);

    // ground = radar image
    const radar = MAPS.find((m) => m.id === (data.map || "mirage"))?.radar;
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshBasicMaterial({ color: 0x2a2e33 })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    if (radar) {
      new THREE.TextureLoader().load(radar, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        ground.material = new THREE.MeshBasicMaterial({ map: tex });
        ground.material.needsUpdate = true;
        renderUpdate();
      });
    }

    // players
    const players = data.players.map((p) => {
      const g = new THREE.Group();
      const color = TEAM_COLOR[p.team] ?? 0xcccccc;
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.9, 0.9, 3.2, 16),
        new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
      );
      body.position.y = 1.6;
      const nose = new THREE.Mesh(
        new THREE.ConeGeometry(0.5, 1.2, 12),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      nose.rotation.z = -Math.PI / 2;
      nose.position.set(1.1, 2.4, 0);
      g.add(body); g.add(nose);
      scene.add(g);
      return g;
    });

    const toWorld = (x, y) => [x - 50, y - 50];

    function update() {
      const f = Math.min(frameRef.current, data.duration - 1);
      const pos = data.frames[f];
      pos.forEach((p, i) => {
        const [wx, wz] = toWorld(p[0], p[1]);
        const g = players[i];
        g.position.set(wx, 0, wz);
        g.rotation.y = -THREE.MathUtils.degToRad(p[2]);
      });
      const m = modeRef.current;
      if (m === "pov" && pos[povRef.current]) {
        const pv = pos[povRef.current];
        const [wx, wz] = toWorld(pv[0], pv[1]);
        const yaw = THREE.MathUtils.degToRad(pv[2]);
        camera.fov = 90; camera.updateProjectionMatrix();
        camera.position.set(wx, 3, wz);
        camera.lookAt(wx + Math.cos(yaw) * 5, 3, wz + Math.sin(yaw) * 5);
      } else {
        camera.fov = 50; camera.updateProjectionMatrix();
        camera.position.set(0, 92, 58);
        camera.lookAt(0, 0, 0);
      }
    }
    function renderUpdate() { update(); renderer.render(scene, camera); }

    const frameRef = { current: frame };
    const modeRef = { current: mode };
    const povRef = { current: povIndex || 0 };
    refs.current = { renderUpdate, frameRef, modeRef, povRef, renderer, camera, mount, scene };

    function onResize() {
      const w = mount.clientWidth || 700; const h = Math.round(w * 9 / 16);
      renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); renderUpdate();
    }
    window.addEventListener("resize", onResize);
    renderUpdate();

    return () => {
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [data]);

  useEffect(() => {
    const r = refs.current;
    if (!r.renderUpdate) return;
    r.frameRef.current = frame; r.modeRef.current = mode; r.povRef.current = povIndex || 0;
    r.renderUpdate();
  }, [frame, mode, povIndex]);

  return <div ref={mountRef} className="dh-scene" />;
}
