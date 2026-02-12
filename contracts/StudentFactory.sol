// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./StudentCareer.sol";

contract StudentFactory {
    address public immutable owner;
    mapping(address => address) public studentToContract;
    address[] public allCareers;

    event CareerCreated(address indexed student, address contractAddress);
    event GradeProposed(address indexed student, string subject, uint8 grade);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner allowed");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createCareer(address _student) external onlyOwner {
        require(
            studentToContract[_student] == address(0),
            "Career already exists"
        );

        StudentCareer newCareer = new StudentCareer(_student);
        address careerAddr = address(newCareer);

        studentToContract[_student] = careerAddr;
        allCareers.push(careerAddr);

        emit CareerCreated(_student, careerAddr);
    }

    // Ora includiamo anche i crediti
    function proposeGrade(
        address _student,
        string calldata _subject,
        uint8 _grade,
        uint8 _credits
    ) external onlyOwner {
        address careerAddress = studentToContract[_student];
        require(careerAddress != address(0), "Student not found");

        // Chiamiamo la funzione di proposta, non di registrazione diretta
        StudentCareer(careerAddress).proposeExam(_subject, _grade, _credits);

        emit GradeProposed(_student, _subject, _grade);
    }

    // Helper per il frontend/script
    function getCareerAddress(
        address _student
    ) external view returns (address) {
        return studentToContract[_student];
    }
}
