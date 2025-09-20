// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Simple team-based clicker game state
contract PopKomodo {
    enum Team { Ethereum, Bitcoin, Monad }

    // player => chosen team (0/1/2). Uses Team(uint) casting.
    mapping(address => Team) private playerTeam;
    // whether an address has chosen already
    mapping(address => bool) private hasChosen;
    // total score contributed by each player (for moderation resets)
    mapping(address => uint256) private playerScores;

    // scores for teams: index by uint(Team)
    uint256[3] private teamScores;

    // simple owner pattern for moderation
    address public owner;

    event TeamChosen(address indexed player, Team team);
    event Popped(address indexed player, Team team, uint256 newTeamScore);
    event PoppedBy(address indexed player, Team team, uint32 amount, uint256 newTeamScore);
    event PlayerReset(address indexed player, Team team, uint256 removed);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // One-time irreversible team selection
    function chooseTeam(Team team) external {
        require(!hasChosen[msg.sender], "Team already chosen");
        require(uint256(team) < 3, "Invalid team");

        playerTeam[msg.sender] = team;
        hasChosen[msg.sender] = true;

        emit TeamChosen(msg.sender, team);
    }

    // Increment the score for the caller's team
    function pop() external {
        require(hasChosen[msg.sender], "Choose a team first");
        Team team = playerTeam[msg.sender];

        uint256 index = uint256(team);
        playerScores[msg.sender] += 1;
        uint256 newScore = ++teamScores[index];

        emit Popped(msg.sender, team, newScore);
    }

    // Batch increment within a capped burst amount
    function popBy(uint32 amount) external {
        require(hasChosen[msg.sender], "Choose a team first");
        require(amount > 0, "Amount must be > 0");

        Team team = playerTeam[msg.sender];
        uint256 index = uint256(team);
        teamScores[index] += amount;
        playerScores[msg.sender] += amount;
        uint256 newScore = teamScores[index];

        emit PoppedBy(msg.sender, team, amount, newScore);
    }

    // Admin moderation: remove all contribution of a player from the team's score
    function resetPlayer(address player) external onlyOwner {
        require(hasChosen[player], "No team");
        uint256 contributed = playerScores[player];
        if (contributed == 0) return;
        Team team = playerTeam[player];
        uint256 index = uint256(team);
        require(teamScores[index] >= contributed, "Underflow");
        teamScores[index] -= contributed;
        playerScores[player] = 0;
        emit PlayerReset(player, team, contributed);
    }

    function getPlayerScore(address player) external view returns (uint256) {
        return playerScores[player];
    }

    // Views
    function getTeam(address player) external view returns (bool chosen, Team team) {
        return (hasChosen[player], playerTeam[player]);
    }

    function getScores() external view returns (uint256 ethScore, uint256 btcScore, uint256 monadScore) {
        return (teamScores[0], teamScores[1], teamScores[2]);
    }

    function getScore(Team team) external view returns (uint256) {
        return teamScores[uint256(team)];
    }
}


