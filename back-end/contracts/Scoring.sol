// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Scoring is Ownable {
    struct UserScore {
        uint256 quizCompletions;
        bool hasSubscribedToNewsletter;
        bool hasBookedCall;
    }

    mapping(address => UserScore) public userScores;

    event ScoreUpdated(address indexed user, UserScore score);

    constructor() Ownable(msg.sender) {}

    function submitQuizAttestation() public {
        userScores[msg.sender].quizCompletions++;
        emit ScoreUpdated(msg.sender, userScores[msg.sender]);
    }

    function updateNewsletterSubscription(address user, bool subscribed) public onlyOwner {
        userScores[user].hasSubscribedToNewsletter = subscribed;
        emit ScoreUpdated(user, userScores[user]);
    }

    function updateCallBooking(address user, bool booked) public onlyOwner {
        userScores[user].hasBookedCall = booked;
        emit ScoreUpdated(user, userScores[user]);
    }

    function getUserScore(address user) public view returns (UserScore memory) {
        return userScores[user];
    }
}
