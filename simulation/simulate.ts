import hre from "hardhat";

async function main() {
    const { viem } = await hre.network.connect();

    // fondamentale che owner sia primo in quanto è il primo di questi che deploya la factory
    const [owner, student] = await viem.getWalletClients();

    console.log("=== SIMULAZIONE ===");
    console.log("Owner:", owner.account.address);
    console.log("Student:", student.account.address);

    // Deploy
    const factory = await viem.deployContract("StudentFactory");
    console.log("Factory deployata a:", factory.address);

    // Creazione carriera
    await factory.write.createCareer([student.account.address]);

    const careerAddr = await factory.read.getCareerAddress([
        student.account.address,
    ]);

    const career = await viem.getContractAt("StudentCareer", careerAddr);

    await log(career);

    // Proposta voto 1
    await factory.write.proposeGrade([
        student.account.address,
        "Basi di dati",
        30,
        90,
    ]);

    // Accettazione 1
    await career.write.acceptGrade([0n], {
        account: student.account,
    });

    await log(career);

    // Proposta voto 2
    await factory.write.proposeGrade([
        student.account.address,
        "Business intelligence",
        29,
        90,
    ]);

    // Accettazione 2
    await career.write.acceptGrade([1n], {
        account: student.account,
    });

    // Laurea
    await career.write.graduate({
        account: student.account,
    });

    await log(career);

    console.log("Simulazione completata");
}

async function log(career: any) {
    const credits = await career.read.totalCredits();
    console.log("Crediti totali:", credits.toString());

    const avg = await career.read.calculateAverage();
    console.log("Media:", (Number(avg) / 100).toFixed(2));

    const graduated = await career.read.isGraduated();
    console.log("Laureato:", graduated);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});