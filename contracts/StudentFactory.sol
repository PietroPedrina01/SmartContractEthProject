// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./StudentCareer.sol";

contract StudentFactory {
    address public immutable _owner;
    mapping(address => address) public _studentToContract;
    address[] public _allCareers;

    event CareerCreated(address indexed student, address contractAddress);
    event GradeProposed(
        address indexed student,
        string subject,
        uint8 grade,
        uint8 credits
    );

    modifier onlyOwner() {
        require(msg.sender == _owner, "Only owner allowed");
        _;
    }

    constructor() {
        _owner = msg.sender;
    }

    // Creazione della carriera di uno studente
    function createCareer(address student) external onlyOwner {
        require(
            _studentToContract[student] == address(0),
            "Career already exists"
        );

        StudentCareer newCareer = new StudentCareer(student);
        address careerAddr = address(newCareer);

        _studentToContract[student] = careerAddr;
        _allCareers.push(careerAddr);

        emit CareerCreated(student, careerAddr);
    }

    // Il professore PROPONE il voto richiamando StudentCareer
    function proposeGrade(
        address student,
        string calldata subject,
        uint8 grade,
        uint8 credits
    ) external onlyOwner {
        address careerAddress = _studentToContract[student];
        require(careerAddress != address(0), "Student not found");

        // chiamiamo la funzione di proposta, non di registrazione diretta
        StudentCareer(careerAddress).proposeExam(subject, grade, credits);

        emit GradeProposed(student, subject, grade, credits);
    }

    function getCareerAddress(address student) external view returns (address) {
        return _studentToContract[student];
    }
}
