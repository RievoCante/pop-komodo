// helpers for PopKomodo contract
import abi from "./abi/pop-komodo.json";

const RAW_ADDRESS = (import.meta.env.VITE_POPKOMODO_ADDRESS ?? "")
  .toString()
  .trim();
const VALID_ADDRESS = /^0x[a-fA-F0-9]{40}$/;

export const POPKOMODO_ADDRESS = VALID_ADDRESS.test(RAW_ADDRESS)
  ? (RAW_ADDRESS as `0x${string}`)
  : undefined;

export const popKomodo: {
  address: `0x${string}` | undefined;
  abi: typeof abi;
} = {
  address: POPKOMODO_ADDRESS,
  abi: abi,
};
