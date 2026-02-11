// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract StudentCareer {
    // Errori custom
    error OnlyFactoryAllowed();
    error OnlyStudentAllowed();
    error InvalidGrade();
    error ExamAlreadyPassed();
    error ExamNotFoundOrNotPending();
    error AlreadyGraduated();
    error NotEnoughCredits();

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

    event ExamProposed(string subject, uint8 grade, uint8 credits);
    event ExamAccepted(string subject, uint8 grade);
    event ExamRejected(string subject, uint8 grade);
    event StudentGraduated(uint256 date);

    modifier onlyFactory() {
        if (msg.sender != factory) revert OnlyFactoryAllowed();
        _;
    }

    modifier onlyStudent() {
        if (msg.sender != studentAddress) revert OnlyStudentAllowed();
        _;
    }

    modifier activeCareer() {
        if (isGraduated) revert AlreadyGraduated();
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
        if (_grade > 31 || _grade < 18) revert InvalidGrade();

        exams.push(
            Exam({
                name: _name,
                grade: _grade,
                credits: _credits,
                date: block.timestamp,
                status: ExamStatus.PENDING // Il voto è in attesa
            })
        );

        emit ExamProposed(_name, _grade, _credits);
    }

    // Lo studente ACCETTA il voto (Interazione diretta Studente -> Contratto)
    function acceptGrade(uint256 _examIndex) external onlyStudent activeCareer {
        if (_examIndex >= exams.length) revert ExamNotFoundOrNotPending();
        Exam storage e = exams[_examIndex];

        if (e.status != ExamStatus.PENDING) revert ExamNotFoundOrNotPending();

        e.status = ExamStatus.REGISTERED;
        totalCredits += e.credits;

        emit ExamAccepted(e.name, e.grade);
    }

    // Funzione per rifiutare un voto (opzionale, ma carino)
    function rejectGrade(uint256 _examIndex) external onlyStudent activeCareer {
        if (_examIndex >= exams.length) revert ExamNotFoundOrNotPending();
        Exam storage e = exams[_examIndex];

        if (e.status != ExamStatus.PENDING) revert ExamNotFoundOrNotPending();

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
        if (totalCredits < 180) revert NotEnoughCredits();

        // Salviamo la media al momento della laurea
        finalAverage = calculateAverage();
        isGraduated = true;

        emit StudentGraduated(block.timestamp);
    }

    function getExams() external view returns (Exam[] memory) {
        return exams;
    }
}
