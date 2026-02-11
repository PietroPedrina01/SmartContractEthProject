import assert from "node:assert/strict";
import hre from "hardhat";
import { describe, it } from "node:test";

const { viem, networkHelpers } = await hre.network.connect();

describe("Sistema Carriere Studenti", function () {
  
  // Fixture per resettare la blockchain locale prima di ogni test
  async function deployFixture() {
    const [admin, student, stranger] = await viem.getWalletClients();
    const publicClient = await viem.getPublicClient();

    const factory = await viem.deployContract("StudentFactory");

    return { factory, admin, student, stranger, publicClient };
  }

  describe("Aggiunta Voti e Permessi", function () {
    it("Dovrebbe permettere all'admin di registrare un voto e allo studente di vederlo", async function () {
      const { factory, student, publicClient } = await networkHelpers.loadFixture(deployFixture);

      // 1. Creazione carriera
      await factory.write.createCareer([student.account.address]);
      const careerAddr = await factory.read.studentToContract([student.account.address]);
      
      // 2. Registrazione voto (Transazione dell'admin)
      await factory.write.registerGrade([student.account.address, "Programmazione", 30]);

      // 3. Verifica (Lettura tramite Public Client)
      const careerContract = await viem.getContractAt("StudentCareer", careerAddr);
      const exams = await careerContract.read.getExams();
      
      assert.equal(exams[0].name, "Programmazione");
      assert.equal(exams[0].grade, 30);
    });

    it("Dovrebbe fallire se si prova a registrare un voto superiore a 31", async function () {
      const { factory, student } = await networkHelpers.loadFixture(deployFixture);

      await factory.write.createCareer([student.account.address]);

      await assert.rejects(
        factory.write.registerGrade([student.account.address, "Fisica", 32]),
        /InvalidGrade/
      );
    });

    it("Dovrebbe fallire se si prova a registrare un voto inferiore a 18", async function () {
      const { factory, student } = await networkHelpers.loadFixture(deployFixture);

      await factory.write.createCareer([student.account.address]);

      await assert.rejects(
        factory.write.registerGrade([student.account.address, "Chimica", 17]),
        /InvalidGrade/
      );
    });

    it("Dovrebbe fallire se un msg.sender che non è factory prova a chiamare addExam", async function () {
      const { factory, student } = await networkHelpers.loadFixture(deployFixture);

      await factory.write.createCareer([student.account.address]);
      const careerAddr = await factory.read.studentToContract([student.account.address]);
      const careerContract = await viem.getContractAt("StudentCareer", careerAddr);

      await assert.rejects(
        careerContract.write.addExam(["Storia", 28], {
          account: student.account,
        }),
        /OnlyFactoryAllowed/
      );
    });

    it("Dovrebbe fallire se si prova a creare una carriera per uno studente che ne ha già una", async function () {
      const { factory, student } = await networkHelpers.loadFixture(deployFixture);

      await factory.write.createCareer([student.account.address]);

      await assert.rejects(
        factory.write.createCareer([student.account.address]),
        /CareerAlreadyExists/
      );
    });
    
    it("Dovrebbe fallire se si prova a registrare un voto per uno studente senza carriera", async function () {
      const { factory, student } = await networkHelpers.loadFixture(deployFixture);

      await assert.rejects(
        factory.write.registerGrade([student.account.address, "Geografia", 25]),
        /StudentNotFound/
      );
    });

    it("Dovrebbe fallire se un account non autorizzato prova a registrare un voto", async function () {
      const { factory, student, stranger } = await networkHelpers.loadFixture(deployFixture);

      await factory.write.createCareer([student.account.address]);

      // Proviamo a inviare la transazione usando l'account 'stranger'
      await assert.rejects(
        factory.write.registerGrade([student.account.address, "Hacking", 31], {
          account: stranger.account,
        }),
        /OnlyOwnerAllowed/
      );
    });
  });
});