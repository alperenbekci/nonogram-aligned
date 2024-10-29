// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {NonogramValidator} from "../src/NonogramValidator.sol";

contract CounterTest is Test {
    NonogramValidator public nonogramValidator;
    address alignedServiceManager = 0x815aeCA64a974297942D2Bbf034ABEe22a38A003;
    address paymentServiceAddr = 0x58F280BeBE9B34c9939C3C39e0890C81f163B623;
    bytes32 proofCommitment = bytes32(abi.encodePacked([14,152,142,85,114,51,234,82,147,13,89,236,58,228,116,202,201,6,81,100,64,147,103,108,124,5,101,234,189,82,150,65]));
    bytes32 pubInputCommitment = bytes32(abi.encodePacked([215,12,219,66,161,99,16,27,152,188,231,11,35,219,222,94,8,151,45,43,150,205,27,44,44,139,239,70,207,60,161,176]));
    bytes32 programIdCommitment = 0x069ed9f3972550a2901523723f4beb5e240749dcafa30e1623d0778e17d69d70;
    bytes20 proofGeneratorAddr = bytes20(abi.encodePacked([102,249,102,79,151,242,181,15,98,209,62,160,100,152,47,147,109,231,102,87]));
    bytes32 batchMerkleRoot = bytes32(abi.encodePacked([11,31,109,7,91,237,171,31,177,77,178,133,72,255,28,239,155,201,8,58,49,42,89,160,246,109,15,100,148,55,144,92]));
    bytes merkleProof = bytes(abi.encodePacked([[173,142,88,254,151,153,114,151,196,25,217,222,46,144,119,207,88,140,125,165,167,31,221,170,162,24,186,15,229,70,188,154],[202,232,71,178,74,205,154,200,227,179,187,124,54,223,198,207,20,250,31,52,147,161,100,176,122,71,18,190,24,250,88,71],[220,242,38,173,209,40,187,223,151,144,128,2,87,202,94,163,99,67,244,134,146,196,214,98,148,106,86,24,79,123,20,76],[87,5,192,151,188,219,169,4,8,206,57,92,111,233,245,61,1,184,210,74,213,114,8,131,198,81,174,57,21,46,213,181],[248,116,94,238,57,35,251,76,226,186,60,21,149,8,10,213,91,69,58,183,182,129,39,13,226,167,104,207,223,227,116,113]]));
    uint256 verificationDataBatchIndex = 17;
    bytes pubInputBytes = bytes(abi.encodePacked("asd"));

    function setUp() public {
        nonogramValidator = new NonogramValidator(alignedServiceManager, paymentServiceAddr );
    }

    function test_Verifier() public {
        nonogramValidator.verifyBatchInclusion(
        proofCommitment,
        pubInputCommitment,
        programIdCommitment,
        proofGeneratorAddr,
        batchMerkleRoot,
        merkleProof,
        verificationDataBatchIndex,
        pubInputBytes);
        
    }

    function testFuzz_SetNumber(uint256 x) public {}
}
