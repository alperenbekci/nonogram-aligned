// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {NonogramValidator} from "../src/NonogramValidator.sol";

contract NonogramScript is Script {
    NonogramValidator public nonogramValidator;
    address alignedServiceManager = 0x815aeCA64a974297942D2Bbf034ABEe22a38A003;
    address paymentServiceAddr = 0x58F280BeBE9B34c9939C3C39e0890C81f163B623;

    function setUp() public {

    }


    function run() public {
        vm.startBroadcast();
        nonogramValidator = new NonogramValidator(alignedServiceManager, paymentServiceAddr);
        vm.stopBroadcast();
    }
}
