import { isCloudflareWorkers } from "./runtime";

type PhotonModule = typeof import("@cf-wasm/photon/workerd");

let modulePromise: Promise<PhotonModule> | null = null;

async function loadPhotonModule(): Promise<PhotonModule> {
  if (!modulePromise) {
    modulePromise = (
      isCloudflareWorkers()
        ? import("@cf-wasm/photon/workerd")
        : import("@cf-wasm/photon/node")
    ) as Promise<PhotonModule>;
  }
  return modulePromise;
}

/** Load Photon and wait until WASM is ready (workerd/node entries self-init on import). */
export async function getPhoton(): Promise<PhotonModule> {
  const mod = await loadPhotonModule();
  await mod.initPhoton.ensure();
  return mod;
}
