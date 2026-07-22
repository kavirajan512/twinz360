import * as THREE from 'three';

export class PBRMaterials {

  static getWoodFloor(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0x8b6914,
      roughness: 0.55,
      metalness: 0.0,
      map: this.colorMap(0x8b6914, 0xa0782c),
      roughnessMap: this.simpleMap(0.55),
    });
  }

  static getMarbleFloor(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0xf0f0f0,
      roughness: 0.08,
      metalness: 0.05,
      map: this.colorMap(0xf0f0f0, 0xd0d0d0),
    });
  }

  static getWhiteMarble(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0xf8f8f8,
      roughness: 0.06,
      metalness: 0.1,
    });
  }

  static getLeather(color: number = 0x8b4513): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.7,
      metalness: 0.0,
    });
  }

  static getFabric(color: number = 0xc0c0c0): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.9,
      metalness: 0.0,
    });
  }

  static getSteel(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.2,
      metalness: 0.9,
    });
  }

  static getChrome(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.05,
      metalness: 1.0,
      envMapIntensity: 1.0,
    });
  }

  static getGlass(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.02,
      metalness: 0.95,
      transparent: true,
      opacity: 0.25,
    });
  }

  static getWoodDark(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0x4a3728,
      roughness: 0.6,
      metalness: 0.0,
    });
  }

  static getWoodLight(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0xc4a46c,
      roughness: 0.6,
      metalness: 0.0,
    });
  }

  static getConcrete(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0x808080,
      roughness: 0.85,
      metalness: 0.0,
    });
  }

  static getPlaster(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0xf0ece3,
      roughness: 0.9,
      metalness: 0.0,
    });
  }

  static getCeiling(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0xf5f0eb,
      roughness: 0.9,
      metalness: 0.0,
    });
  }

  static getCeramic(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0xf0f0f0,
      roughness: 0.15,
      metalness: 0.1,
    });
  }

  static getGranite(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0x505050,
      roughness: 0.15,
      metalness: 0.2,
    });
  }

  static getGold(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.15,
      metalness: 1.0,
    });
  }

  static getBrass(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0xb5a642,
      roughness: 0.25,
      metalness: 0.9,
    });
  }

  static getMarbleDark(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0x2c2c2c,
      roughness: 0.06,
      metalness: 0.1,
    });
  }

  static getPaint(color: number): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.4,
      metalness: 0.0,
    });
  }

  static getEmissive(color: number, intensity: number = 1.0): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: intensity,
    });
  }

  private static colorMap(a: number, b: number): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = `#${a.toString(16).padStart(6, '0')}`;
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = `#${b.toString(16).padStart(6, '0')}`;
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      ctx.fillRect(x, y, 4 + Math.random() * 8, 4 + Math.random() * 8);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }

  private static simpleMap(val: number): THREE.DataTexture {
    return new THREE.DataTexture(new Uint8Array([Math.round(val * 255)]), 1, 1, THREE.RedFormat);
  }
}
