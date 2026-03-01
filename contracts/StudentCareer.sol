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

    address public immutable _factory;
    address public immutable _studentAddress;

    // Lista pubblica di esami
    Exam[] public _exams;

    uint256 public _totalCredits;
    bool public _isGraduated;
    uint256 public _finalAverage;
    uint256 public _finalGrade;
    bool public _hasHonors;

    event ExamProposed(
        string subject,
        uint8 grade,
        uint8 credits,
        uint256 date
    );
    event ExamAccepted(
        string subject,
        uint8 grade,
        uint8 credits,
        uint256 date
    );
    event ExamRejected(
        string subject,
        uint8 grade,
        uint8 credits,
        uint256 date
    );
    event StudentGraduated(uint256 date);
    event FinalGradeSet(uint256 finalGrade, bool hasHonors);

    modifier onlyFactory() {
        require(msg.sender == _factory, "Only factory allowed");
        _;
    }

    modifier onlyStudent() {
        require(msg.sender == _studentAddress, "Only student allowed");
        _;
    }

    modifier activeCareer() {
        require(!_isGraduated, "Already graduated");
        _;
    }

    constructor(address studentAddress) {
        _factory = msg.sender;
        _studentAddress = studentAddress;
    }

    // Il professore (tramite Factory) PROPONE il voto
    function proposeExam(
        string memory name,
        uint8 grade,
        uint8 credits
    ) external onlyFactory activeCareer {
        require(grade >= 18 && grade <= 31, "Invalid grade");
        require(credits > 0, "Credits must be positive");

        uint256 ts = block.timestamp;

        _exams.push(
            Exam({
                name: name,
                grade: grade,
                credits: credits,
                date: ts,
                status: ExamStatus.PENDING
            })
        );

        emit ExamProposed(name, grade, credits, ts);
    }

    // Lo studente ACCETTA il voto (Interazione diretta Studente -> Contratto)
    function acceptGrade(uint256 examIndex) external onlyStudent activeCareer {
        require(examIndex < _exams.length, "Exam index out of bounds");
        Exam storage e = _exams[examIndex];

        require(e.status == ExamStatus.PENDING, "Exam not pending");

        e.status = ExamStatus.REGISTERED;
        _totalCredits += e.credits;

        emit ExamAccepted(e.name, e.grade, e.credits, block.timestamp);
    }

    // Lo studente RIFIUTA il voto
    function rejectGrade(uint256 examIndex) external onlyStudent activeCareer {
        require(examIndex < _exams.length, "Exam index out of bounds");
        Exam storage e = _exams[examIndex];

        require(e.status == ExamStatus.PENDING, "Exam not pending");

        // Se rifiuta, lo stato diventa REJECTED e non si aggiungono crediti
        e.status = ExamStatus.REJECTED;

        emit ExamRejected(e.name, e.grade, e.grade, block.timestamp);
    }

    // Calcola la media pesata moltiplicata per 100 per mantenere 2 decimali
    // Esempio per il problema del floating-point imprecision (faccio prima la moltiplicazione e poi la divisione)
    function calculateAverage() public view returns (uint256) {
        uint256 totalWeightedGrades = 0;
        uint256 registeredCredits = 0;

        for (uint256 i = 0; i < _exams.length; i++) {
            if (_exams[i].status == ExamStatus.REGISTERED) {
                totalWeightedGrades +=
                    uint256(_exams[i].grade) *
                    uint256(_exams[i].credits);
                registeredCredits += uint256(_exams[i].credits);
            }
        }

        // Evita la divisione per 0
        if (registeredCredits == 0) return 0;

        return (totalWeightedGrades * 100) / registeredCredits;
    }

    // Calcolo della laurea
    function graduate() external onlyStudent activeCareer {
        require(_totalCredits >= 180, "Not enough credits to graduate");

        // Salviamo la media al momento della laurea
        _finalAverage = calculateAverage();
        _finalGrade = (_finalAverage * 110) / 30;

        // Il controllo if (_finalGrade < 6600) _finalGrade = 6600; non è necessario perché non è possibile una media sotto il 18

        if (_finalGrade > 11000) {
            _finalGrade = 11000; // Limitiamo a 110
            _hasHonors = true; // Se supera 110, assegniamo la lode
        }
        _isGraduated = true;

        emit StudentGraduated(block.timestamp);
        emit FinalGradeSet(_finalGrade, _hasHonors);
    }

    function getExams() external view returns (Exam[] memory) {
        return _exams;
    }
}
