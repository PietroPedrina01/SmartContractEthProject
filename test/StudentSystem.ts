import assert from "node:assert/strict";
import hre from "hardhat";
import { describe, it } from "node:test";


const { viem, networkHelpers } = await hre.network.connect();

describe("Sistema Carriere - Integrazione", function () {

	async function deployFixture() {
		const [owner, student, stranger] = await viem.getWalletClients();
		const factory = await viem.deployContract("StudentFactory");

		return { owner, factory, student, stranger };
	}

	it("Dovrebbe completare l'intero ciclo: Proposta -> Accettazione -> Laurea", async function () {
		const { factory, student } = await networkHelpers.loadFixture(deployFixture);

		// 1. Creazione Carriera
		await factory.write.createCareer([student.account.address]);
		const careerAddr = await factory.read.getCareerAddress([student.account.address]);
		const careerContract = await viem.getContractAt("StudentCareer", careerAddr);

		// 2. Proposta Voto
		await factory.write.proposeGrade([student.account.address, "Basi di dati", 30, 180]);

		// 3. Accettazione Voto
		await careerContract.write.acceptGrade([0n], { account: student.account });

		// 4. Verifica Crediti e Laurea
		const credits = await careerContract.read._totalCredits();
		assert.equal(credits, 180n);

		await careerContract.write.graduate({ account: student.account });
		const isGraduated = await careerContract.read._isGraduated();
		assert.strictEqual(isGraduated, true);
	});

	it("Dovrebbe fallire se un estraneo prova ad accettare un voto", async function () {
		const { factory, student, stranger } = await networkHelpers.loadFixture(deployFixture);
		await factory.write.createCareer([student.account.address]);
		const careerAddr = await factory.read.getCareerAddress([student.account.address]);
		const careerContract = await viem.getContractAt("StudentCareer", careerAddr);

		await factory.write.proposeGrade([student.account.address, "Crittografia", 25, 6]);

		// Tentativo di accettazione da parte di 'stranger'
		await assert.rejects(
			careerContract.write.acceptGrade([0n], { account: stranger.account }),
			"Only student allowed"
		);
	});

	it("Dovrebbe fallire la proposta di un voto invalido", async function () {
		const { factory, student } = await networkHelpers.loadFixture(deployFixture);
		await factory.write.createCareer([student.account.address]);

		await assert.rejects(
			factory.write.proposeGrade([student.account.address, "Test", 35, 6]),
			"Invalid grade"
		);
	});

	it("Dovrebbe fallire se lo studente prova a laurearsi senza crediti sufficienti", async function () {
		const { factory, student } = await networkHelpers.loadFixture(deployFixture);
		await factory.write.createCareer([student.account.address]);
		const careerAddr = await factory.read.getCareerAddress([student.account.address]);
		const careerContract = await viem.getContractAt("StudentCareer", careerAddr);

		await assert.rejects(
			careerContract.write.graduate({ account: student.account }),
			"Not enough credits to graduate"
		);
	});

	it("Dovrebbe fallire se un account non-owner prova a proporre un voto tramite Factory", async function () {
		const { factory, student } = await networkHelpers.loadFixture(deployFixture);

		// Creiamo prima la carriera
		await factory.write.createCareer([student.account.address]);

		// Lo studente prova a chiamare proposeGrade sulla Factory
		await assert.rejects(
			factory.write.proposeGrade(
				[student.account.address, "Sicurezza", 31, 6],
				{ account: student.account }
			),
			"Only owner allowed"
		);
	});

	it("Dovrebbe fallire se qualcuno chiama direttamente proposeExam sul contratto carriera", async function () {
		const { factory, student, stranger } = await networkHelpers.loadFixture(deployFixture);

		await factory.write.createCareer([student.account.address]);
		const careerAddr = await factory.read.getCareerAddress([student.account.address]);
		const careerContract = await viem.getContractAt("StudentCareer", careerAddr);

		// Qualcuno (stranger o lo studente stesso) chiama proposeExam direttamente
		await assert.rejects(
			careerContract.write.proposeExam(
				["Hacker Grade", 31, 180],
				{ account: stranger.account }
			),
			"Only factory allowed"
		);
		await assert.rejects(
			careerContract.write.proposeExam(
				["Hacker Grade", 31, 180],
				{ account: student.account }
			),
			"Only factory allowed"
		);
	});

	it("Dovrebbe fallire se si prova a creare una carriera per uno studente già registrato", async function () {
		const { factory, student } = await networkHelpers.loadFixture(deployFixture);

		await factory.write.createCareer([student.account.address]);

		// Proviamo a creare una seconda carriera per lo stesso studente
		await assert.rejects(
			factory.write.createCareer([student.account.address]),
			"Career already exists"
		);
	});

	it("Dovrebbe fallire se si prova a proporre un voto per uno studente senza carriera", async function () {
		const { factory, student } = await networkHelpers.loadFixture(deployFixture);

		// Proviamo a proporre un voto per uno studente che non ha una carriera
		await assert.rejects(
			factory.write.proposeGrade([student.account.address, "Non Esistente", 30, 6]),
			"Student not found"
		);
	});

	it("Dovrebbe fallire se si prova a proporre un voto ad uno studente già laureato", async function () {
		const { factory, student } = await networkHelpers.loadFixture(deployFixture);

		await factory.write.createCareer([student.account.address]);
		const careerAddr = await factory.read.getCareerAddress([student.account.address]);
		const careerContract = await viem.getContractAt("StudentCareer", careerAddr);

		// Proponiamo un voto e accettiamo per raggiungere i 180 crediti
		await factory.write.proposeGrade([student.account.address, "Esame Finale", 30, 180]);
		await careerContract.write.acceptGrade([0n], { account: student.account });

		await careerContract.write.graduate({ account: student.account });

		// Ora lo studente è laureato, proviamo a proporre un altro voto
		await assert.rejects(
			factory.write.proposeGrade([student.account.address, "Dopo Laurea", 30, 6]),
			"Already graduated"
		);
	});

	it("Dovrebbe fallire se uno studente prova ad accettare un voto per un esame che non esiste", async function () {
		const { factory, student } = await networkHelpers.loadFixture(deployFixture);

		await factory.write.createCareer([student.account.address]);
		const careerAddr = await factory.read.getCareerAddress([student.account.address]);
		const careerContract = await viem.getContractAt("StudentCareer", careerAddr);

		// Lo studente prova ad accettare un voto che non esiste
		await assert.rejects(
			careerContract.write.acceptGrade([0n], { account: student.account }),
			"Exam not found or not pending"
		);
	});

	it("Dovrebbe fallire se uno studente prova ad accettare un voto che non è in stato PENDING", async function () {
		const { factory, student } = await networkHelpers.loadFixture(deployFixture);

		await factory.write.createCareer([student.account.address]);
		const careerAddr = await factory.read.getCareerAddress([student.account.address]);
		const careerContract = await viem.getContractAt("StudentCareer", careerAddr);

		// Proponiamo un voto e accettiamo per portarlo in stato REGISTERED
		await factory.write.proposeGrade([student.account.address, "Esame", 30, 6]);
		await careerContract.write.acceptGrade([0n], { account: student.account });

		// Ora il voto è in stato REGISTERED, proviamo ad accettarlo di nuovo
		await assert.rejects(
			careerContract.write.acceptGrade([0n], { account: student.account }),
			"Exam not found or not pending"
		);
	});

	it("Dovrebbe fallire se uno studente prova a rigettare un voto per un esame che non esiste", async function () {
		const { factory, student } = await networkHelpers.loadFixture(deployFixture);

		await factory.write.createCareer([student.account.address]);
		const careerAddr = await factory.read.getCareerAddress([student.account.address]);
		const careerContract = await viem.getContractAt("StudentCareer", careerAddr);

		// Lo studente prova a rigettare un voto che non esiste
		await assert.rejects(
			careerContract.write.rejectGrade([0n], { account: student.account }),
			"Exam not found or not pending"
		);
	});

	it("Dovrebbe fallire se uno studente prova a rigettare un voto che non è in stato PENDING", async function () {
		const { factory, student } = await networkHelpers.loadFixture(deployFixture);

		await factory.write.createCareer([student.account.address]);
		const careerAddr = await factory.read.getCareerAddress([student.account.address]);
		const careerContract = await viem.getContractAt("StudentCareer", careerAddr);

		// Proponiamo un voto e accettiamo per portarlo in stato REGISTERED
		await factory.write.proposeGrade([student.account.address, "Esame", 30, 6]);
		await careerContract.write.acceptGrade([0n], { account: student.account });

		// Ora il voto è in stato REGISTERED, proviamo a rigettarlo
		await assert.rejects(
			careerContract.write.rejectGrade([0n], { account: student.account }),
			"Exam not pending"
		);
	});

	it("Uno studente dovrebbe poter rigettare un voto proposto", async function () {
		const { factory, student } = await networkHelpers.loadFixture(deployFixture);

		await factory.write.createCareer([student.account.address]);
		const careerAddr = await factory.read.getCareerAddress([student.account.address]);
		const careerContract = await viem.getContractAt("StudentCareer", careerAddr);

		// Proponiamo un voto
		await factory.write.proposeGrade([student.account.address, "Esame da Rigettare", 30, 6]);

		// Lo studente rigetta il voto
		await careerContract.write.rejectGrade([0n], { account: student.account });

		// Verifichiamo che lo stato dell'esame sia stato aggiornato correttamente (ad esempio, potrebbe essere cancellato o marcato come REJECTED)
		const exams = await careerContract.read.getExams();

		assert.equal(exams.length, 1);
		assert.equal(exams[0].name, "Esame da Rigettare");
		assert.equal(exams[0].status, 3); // 3 <=> REJECTED
	});

	it("Dovrebbe calcolare correttamente la media pesata", async function () {
		const { factory, student } = await networkHelpers.loadFixture(deployFixture);

		await factory.write.createCareer([student.account.address]);
		const careerAddr = await factory.read.getCareerAddress([student.account.address]);
		const careerContract = await viem.getContractAt("StudentCareer", careerAddr);

		// Proponiamo e accettiamo più voti
		await factory.write.proposeGrade([student.account.address, "Esame 1", 30, 6]);
		await careerContract.write.acceptGrade([0n], { account: student.account });

		await factory.write.proposeGrade([student.account.address, "Esame 2", 28, 12]);
		await careerContract.write.acceptGrade([1n], { account: student.account });

		// Calcoliamo la media pesata
		const average = await careerContract.read.calculateAverage();

		// La media pesata dovrebbe essere: ((30*6)+(28*12)) / (6+12) = 516 / 18 = 28.666... => moltiplichiamo per 100 per mantenere 2 decimali => 2866
		assert.equal(average, 2866n);
	});

	it("Dovrebbe restituire 0 come media se non ci sono esami registrati", async function () {
		const { factory, student } = await networkHelpers.loadFixture(deployFixture);

		await factory.write.createCareer([student.account.address]);
		const careerAddr = await factory.read.getCareerAddress([student.account.address]);
		const careerContract = await viem.getContractAt("StudentCareer", careerAddr);

		const average = await careerContract.read.calculateAverage();
		assert.equal(average, 0n);
	});

	it("Laurea con media di 18 dovrebbe assegnare il voto di laurea minimo (66/110)", async function () {
		const { factory, student } = await networkHelpers.loadFixture(deployFixture);

		await factory.write.createCareer([student.account.address]);
		const careerAddr = await factory.read.getCareerAddress([student.account.address]);
		const careerContract = await viem.getContractAt("StudentCareer", careerAddr);

		// Proponiamo e accettiamo voti per raggiungere una media di 18
		await factory.write.proposeGrade([student.account.address, "Esame 1", 18, 180]);
		await careerContract.write.acceptGrade([0n], { account: student.account });

		await careerContract.write.graduate({ account: student.account });

		const finalAverage = await careerContract.read._finalAverage();
		const finalGrade = await careerContract.read._finalGrade();
		const hasHonors = await careerContract.read._hasHonors();
		assert.equal(finalAverage, 1800n); // Media di 18.00
		assert.equal(finalGrade, 6600n); // Voto di laurea minimo 66/110
		assert.equal(hasHonors, false);
	});

	it("Laurea con media di 31 (30L) dovrebbe assegnare il voto di laurea massimo (110/110)", async function () {
		const { factory, student } = await networkHelpers.loadFixture(deployFixture);

		await factory.write.createCareer([student.account.address]);
		const careerAddr = await factory.read.getCareerAddress([student.account.address]);
		const careerContract = await viem.getContractAt("StudentCareer", careerAddr);

		// Proponiamo e accettiamo voti per raggiungere una media di 31 (30L)
		await factory.write.proposeGrade([student.account.address, "Esame 1", 31, 180]);
		await careerContract.write.acceptGrade([0n], { account: student.account });

		await careerContract.write.graduate({ account: student.account });

		const finalAverage = await careerContract.read._finalAverage();
		const finalGrade = await careerContract.read._finalGrade();
		const hasHonors = await careerContract.read._hasHonors();
		assert.equal(finalAverage, 3100n); // Media di 31.00
		assert.equal(finalGrade, 11000n); // Voto di laurea massimo 110/110
		assert.equal(hasHonors, true);
	});

});