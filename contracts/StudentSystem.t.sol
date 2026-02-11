// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../contracts/StudentFactory.sol";
import "../contracts/StudentCareer.sol";

contract TestStudentSystem {
    StudentFactory factory;
    address fakeStudent = address(0x123);

    constructor() {
        factory = new StudentFactory();
    }

    function testInitialization() public view {
        assert(factory.owner() == address(this));
    }

    function testCreateCareerLogic() public {
        factory.createCareer(fakeStudent);
        address careerAddr = factory.studentToContract(fakeStudent);
        assert(careerAddr != address(0));
    }

    function testGradeValidation() public {
        factory.createCareer(fakeStudent);
        factory.registerGrade(fakeStudent, "Analisi", 28);
        
        StudentCareer career = StudentCareer(factory.studentToContract(fakeStudent));
        assert(career.getExams().length == 1);
        assert(keccak256(bytes(career.getExams()[0].name)) == keccak256(bytes("Analisi")));
        assert(career.getExams()[0].grade == 28);
    }
}
