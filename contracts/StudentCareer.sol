// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract StudentCareer {
    // Custom Errors per risparmiare gas
    error OnlyFactoryAllowed();
    error InvalidGrade();

    struct Exam {
        string name;
        uint8 grade;
        uint256 date;
    }

    address public immutable factory;
    address public immutable studentAddress;
    Exam[] public exams;

    modifier onlyFactory() {
        if (msg.sender != factory) revert OnlyFactoryAllowed();
        _;
    }

    constructor(address _studentAddress) {
        factory = msg.sender;
        studentAddress = _studentAddress;
    }

    function addExam(string memory _name, uint8 _grade) external onlyFactory {
        if (_grade > 31) revert InvalidGrade(); // Voto massimo per superare l'esame: 31 = 30L
        if (_grade < 18) revert InvalidGrade(); // Voto minimo per superare l'esame:  18
        
        exams.push(Exam({
            name: _name,
            grade: _grade,
            date: block.timestamp
        }));
    }

    function getExams() external view returns (Exam[] memory) {
        return exams;
    }
}