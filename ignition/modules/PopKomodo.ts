// Ignition module to deploy PopKomodo
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("PopKomodoModule", (m) => {
  const PopKomodo = m.contract("PopKomodo");
  return { PopKomodo };
});
