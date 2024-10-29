// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

contract NonogramValidator {
    address public alignedServiceManager;
    address public paymentServiceAddr;
    bytes32 public nonogramProgramIdCommitment = 0x069ed9f3972550a2901523723f4beb5e240749dcafa30e1623d0778e17d69d70;
    address[] public verifiedPlayers;

    struct Player {
        bool hasJoined;
        bool isSolved;
    }

    mapping(address => Player) public players;

    constructor(address _alignedServiceManager, address _paymentServiceAddr) {
        alignedServiceManager = _alignedServiceManager;
        paymentServiceAddr = _paymentServiceAddr;
    }

    function joinGame() public payable {
        require(msg.value == 0.2 ether, "You must stake exactly 0.2 ether to join the game");
        require(!players[msg.sender].hasJoined, "You have already joined the game");

        players[msg.sender].hasJoined = true;
    }

    function verifyBatchInclusion(
        bytes32 proofCommitment,
        bytes32 pubInputCommitment,
        bytes32 programIdCommitment,
        bytes20 proofGeneratorAddr,
        bytes32 batchMerkleRoot,
        bytes memory merkleProof,
        uint256 verificationDataBatchIndex,
        bytes memory pubInputBytes
    ) public returns (bool) {
        require(players[msg.sender].hasJoined, "You must join the game first with 0.2 ether");
        require(
            nonogramProgramIdCommitment == programIdCommitment,
            "Program ID doesn't match"
        );

        require(
            pubInputCommitment == keccak256(abi.encodePacked(pubInputBytes)),
            "Nonogram numbers don't match with public input"
        );

        (
            bool callWasSuccessful,
            bytes memory proofIsIncluded
        ) = alignedServiceManager.staticcall(
                abi.encodeWithSignature(
                    "verifyBatchInclusion(bytes32,bytes32,bytes32,bytes20,bytes32,bytes,uint256,address)",
                    proofCommitment,
                    pubInputCommitment,
                    programIdCommitment,
                    proofGeneratorAddr,
                    batchMerkleRoot,
                    merkleProof,
                    verificationDataBatchIndex,
                    paymentServiceAddr
                )
            );

        require(callWasSuccessful, "static_call failed");

        bool isVerified = abi.decode(proofIsIncluded, (bool));

        if (isVerified) {
            if (!players[msg.sender].isSolved) {
                players[msg.sender].isSolved = true;
                verifiedPlayers.push(msg.sender);
                uint256 reward = address(this).balance / 2;
                if (reward > 0) {
                    payable(msg.sender).transfer(reward);
                }
            }
        }

        return isVerified;
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
