// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./StudentCareer.sol";

contract StudentFactory {
    error OnlyOwnerAllowed();
    error CareerAlreadyExists();
    error StudentNotFound();

    address public immutable owner;
    mapping(address => address) public studentToContract;
    address[] public allCareers;

    event CareerCreated(address indexed student, address contractAddress);
    event GradeRegistered(address indexed student, string subject, uint8 grade);

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwnerAllowed();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // external perché viene chiamata da un altro contratto (StudentContract) e costa meno di public
    function createCareer(address _student) external onlyOwner {
        // Verifica che lo studente non abbia già un contratto
        if (studentToContract[_student] != address(0)) revert CareerAlreadyExists();
        
        // Deploy del nuovo contratto
        StudentCareer newCareer = new StudentCareer(_student);
        address careerAddr = address(newCareer);
        
        studentToContract[_student] = careerAddr;
        allCareers.push(careerAddr);

        emit CareerCreated(_student, careerAddr);
    }

    function registerGrade(address _student, string calldata _subject, uint8 _grade) external onlyOwner {
        address careerAddress = studentToContract[_student];
        if (careerAddress == address(0)) revert StudentNotFound();
        
        StudentCareer(careerAddress).addExam(_subject, _grade);
        emit GradeRegistered(_student, _subject, _grade);
    }
}
