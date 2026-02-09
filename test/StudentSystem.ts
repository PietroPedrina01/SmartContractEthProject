import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { getAddress } from "viem";
import { describe, it } from "node:test";

describe("Sistema Carriere Studenti (Integrazione TS + Viem)", function () {
  
  // Fixture per resettare la blockchain locale prima di ogni test
  async function deployFixture() {
    const [admin, student, stranger] = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();

    const factory = await hre.viem.deployContract("StudentFactory");

    return { factory, admin, student, stranger, publicClient };
  }

  describe("Aggiunta Voti e Permessi", function () {
    it("Dovrebbe permettere all'admin di registrare un voto e allo studente di vederlo", async function () {
      const { factory, student, publicClient } = await loadFixture(deployFixture);

      // 1. Creazione carriera
      await factory.write.createCareer([student.account.address]);
      const careerAddr = await factory.read.studentToContract([student.account.address]);
      
      // 2. Registrazione voto (Transazione dell'admin)
      await factory.write.registerGrade([student.account.address, "Programmazione", 30]);

      // 3. Verifica (Lettura tramite Public Client)
      const careerContract = await hre.viem.getContractAt("StudentCareer", careerAddr);
      const exams = await careerContract.read.getExams();
      
      expect(exams[0].name).to.equal("Programmazione");
      expect(exams[0].grade).to.equal(30);
    });

    it("Dovrebbe fallire se un account non autorizzato prova a registrare un voto", async function () {
      const { factory, student, stranger } = await loadFixture(deployFixture);

      await factory.write.createCareer([student.account.address]);

      // Proviamo a inviare la transazione usando l'account 'stranger'
      await expect(
        factory.write.registerGrade([student.account.address, "Hacking", 31], {
          account: stranger.account,
        })
      ).to.be.rejectedWith("OnlyOwnerAllowed");
    });
  });
});