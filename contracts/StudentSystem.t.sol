// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../contracts/StudentFactory.sol";
import "../contracts/StudentCareer.sol";

contract TestStudentSystem {
    StudentFactory factory;
    address studentAddr = address(0x123);

    constructor() {
        factory = new StudentFactory();
    }

    function testInitialization() public view {
        assert(factory.owner() == address(this));
    }

    function testCreateCareer() public {
        factory.createCareer(studentAddr);
        address careerAddr = factory.studentToContract(studentAddr);
        assert(careerAddr != address(0));

        StudentCareer career = StudentCareer(careerAddr);
        assert(career.studentAddress() == studentAddr);
    }

    function testProposeGradeLogic() public {
        factory.createCareer(studentAddr);
        // L'admin (questo contratto) propone un voto
        factory.proposeGrade(studentAddr, "Business intelligence", 30, 6);

        StudentCareer career = StudentCareer(
            factory.studentToContract(studentAddr)
        );
        (
            string memory name,
            uint8 grade,
            uint8 credits,
            ,
            StudentCareer.ExamStatus status
        ) = career.exams(0);

        assert(
            keccak256(bytes(name)) == keccak256(bytes("Business intelligence"))
        );
        assert(grade == 30);
        assert(credits == 6);
        assert(status == StudentCareer.ExamStatus.PENDING);
    }
}
