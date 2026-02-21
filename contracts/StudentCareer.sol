// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract StudentCareer {
    // Enum per gestire lo stato di un esame
    enum ExamStatus {
        NON_EXISTENT,
        PENDING,
        REGISTERED,
        REJECTED
    }

    struct Exam {
        string name;
        uint8 grade;
        uint8 credits;
        uint256 date;
        ExamStatus status;
    }

    address public immutable factory;
    address public immutable studentAddress;

    // Usiamo una mapping per gestire meglio gli stati per materia,
    // oppure un array se vuoi permettere di rifare lo stesso esame (qui semplifico con array)
    Exam[] public exams;

    uint256 public totalCredits;
    bool public isGraduated;
    uint256 public finalAverage;
    uint256 public finalGrade;
    bool public hasHonors;

    event ExamProposed(string subject, uint8 grade, uint8 credits);
    event ExamAccepted(string subject, uint8 grade);
    event ExamRejected(string subject, uint8 grade);
    event StudentGraduated(uint256 date);
    event FinalGradeSet(uint256 finalGrade, bool hasHonors);

    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory allowed");
        _;
    }

    modifier onlyStudent() {
        require(msg.sender == studentAddress, "Only student allowed");
        _;
    }

    modifier activeCareer() {
        require(!isGraduated, "Already graduated");
        _;
    }

    constructor(address _studentAddress) {
        factory = msg.sender;
        studentAddress = _studentAddress;
    }

    // Il professore (tramite Factory) PROPONE il voto
    function proposeExam(
        string memory _name,
        uint8 _grade,
        uint8 _credits
    ) external onlyFactory activeCareer {
        require(_grade >= 18 && _grade <= 31, "Invalid grade");
        require(_credits > 0, "Credits must be positive");

        exams.push(
            Exam({
                name: _name,
                grade: _grade,
                credits: _credits,
                date: block.timestamp,
                status: ExamStatus.PENDING
            })
        );

        emit ExamProposed(_name, _grade, _credits);
    }

    // Lo studente ACCETTA il voto (Interazione diretta Studente -> Contratto)
    function acceptGrade(uint256 _examIndex) external onlyStudent activeCareer {
        require(_examIndex < exams.length, "Exam index out of bounds");
        Exam storage e = exams[_examIndex];

        require(e.status == ExamStatus.PENDING, "Exam not pending");

        e.status = ExamStatus.REGISTERED;
        totalCredits += e.credits;

        emit ExamAccepted(e.name, e.grade);
    }

    // Funzione per rifiutare un voto (opzionale, ma carino)
    function rejectGrade(uint256 _examIndex) external onlyStudent activeCareer {
        require(_examIndex < exams.length, "Exam index out of bounds");
        Exam storage e = exams[_examIndex];

        require(e.status == ExamStatus.PENDING, "Exam not pending");

        // Se rifiuta, lo stato diventa REJECTED e non si aggiungono crediti
        e.status = ExamStatus.REJECTED;
        emit ExamRejected(e.name, e.grade);
    }

    // Calcola la media pesata moltiplicata per 100 per mantenere 2 decimali
    // Esempio per il problema del floating point imprecision (faccio prima la moltiplicazione e poi la divisione)
    function calculateAverage() public view returns (uint256) {
        uint256 totalWeightedGrades = 0;
        uint256 registeredCredits = 0;
        uint256 count = 0;

        for (uint256 i = 0; i < exams.length; i++) {
            if (exams[i].status == ExamStatus.REGISTERED) {
                totalWeightedGrades +=
                    uint256(exams[i].grade) *
                    uint256(exams[i].credits);
                registeredCredits += uint256(exams[i].credits);
                count++;
            }
        }

        if (registeredCredits == 0) return 0;

        return (totalWeightedGrades * 100) / registeredCredits;
    }

    // Calcolo della laurea
    function graduate() external onlyStudent activeCareer {
        require(totalCredits >= 180, "Not enough credits to graduate");

        // Salviamo la media al momento della laurea
        finalAverage = calculateAverage();
        finalGrade = (finalAverage * 110) / 30;
        // Il controllo if (finalGrade < 6600) finalGrade = 6600; non è necessario perché non è possibile una media sotto il 18
        if (finalGrade > 11000) {
            finalGrade = 11000; // Limitiamo a 110
            hasHonors = true; // Se supera 110, assegniamo la lode
        }
        isGraduated = true;

        emit StudentGraduated(block.timestamp);
        emit FinalGradeSet(finalGrade, hasHonors);
    }

    function getExams() external view returns (Exam[] memory) {
        return exams;
    }
}
