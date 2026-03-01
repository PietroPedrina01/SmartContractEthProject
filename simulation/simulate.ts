import hre from "hardhat";

async function main() {
    const { viem } = await hre.network.connect();

    // fondamentale che owner sia primo in quanto è il primo di questi che deploya la factory
    const [owner, student] = await viem.getWalletClients();

    console.log("\n=== SIMULAZIONE ===\n");
    console.log("Owner:", owner.account.address);
    console.log("Student:", student.account.address);

    // Deploy
    const factory = await viem.deployContract("StudentFactory");
    console.log("Factory deployata a:", factory.address);

    // Creazione carriera
    console.log("\nCreazione carriera per lo studente...");
    await factory.write.createCareer([student.account.address]);

    const careerAddr = await factory.read.getCareerAddress([
        student.account.address,
    ]);

    const career = await viem.getContractAt("StudentCareer", careerAddr);

    await logStatus(career);

    // Proposta voto 1
    console.log("\nProposta voto 1: Basi di dati - 30");
    await factory.write.proposeGrade([
        student.account.address,
        "Basi di dati",
        30,
        90,
    ]);

    // Accettazione 1
    console.log("Accettazione voto 1");
    await career.write.acceptGrade([0n], {
        account: student.account,
    });

    await logStatus(career);

    // Proposta voto 2
    console.log("\nProposta voto 2: Business intelligence - 18");
    await factory.write.proposeGrade([
        student.account.address,
        "Business intelligence",
        18,
        90,
    ]);

    // Rifiuto 2
    console.log("Rifiuto voto 2");
    await career.write.rejectGrade([1n], {
        account: student.account,
    });

    await logStatus(career);

    // Proposta voto 3
    console.log("\nProposta voto 3: Business intelligence - 30 e lode");
    await factory.write.proposeGrade([
        student.account.address,
        "Business intelligence",
        31,
        90,
    ]);

    // Accettazione 3
    console.log("Accettazione voto 3");
    await career.write.acceptGrade([2n], {
        account: student.account,
    });

    await logStatus(career);

    // Laurea
    console.log("\nTentativo di laurea...");
    await career.write.graduate({
        account: student.account,
    });

    await logStatus(career);
    const finalGrade = await career.read._finalGrade();
    const hasHonors = await career.read._hasHonors();
    console.log("\nLaurea ottenuta con una votazione finale di: " + (Number(finalGrade) / 100).toFixed(2) + (await cumLaude(hasHonors)));

    console.log("\nSimulazione completata\n");
}

async function logStatus(career: any) {
    const credits = await career.read._totalCredits();
    const avg = await career.read.calculateAverage();
    const graduated = await career.read._isGraduated();

    console.log("\n>> Stato Attuale:");
    console.log(`   Crediti: ${credits}`);
    console.log(`   Media:   ${(Number(avg) / 100).toFixed(2)}`);
    console.log(`   Laureato: ${graduated ? "SÌ" : "NO"}`);
}

async function cumLaude(hasHonors: boolean) {
    return hasHonors ? " e lode" : "";
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});