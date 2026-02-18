import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("StudentModule", (m) => {
  const factory = m.contract("StudentFactory");

  return { factory };
});
