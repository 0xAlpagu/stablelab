// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Staking {
    IERC20 public stakingToken;

    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public lastStakeTime;

    uint256 public rewardRatePerSecond = 1e15; // saniyede kazanılan ödül (wei cinsinden, ör: 0.001 token/saniye)

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);

    constructor(address _stakingToken) {
        stakingToken = IERC20(_stakingToken);
    }

    function stake(uint256 amount) external {
        require(amount > 0, "Miktar sifir olamaz");
        stakingToken.transferFrom(msg.sender, address(this), amount);

        if (stakedBalance[msg.sender] > 0) {
            uint256 pendingReward = calculateReward(msg.sender);
            stakedBalance[msg.sender] += pendingReward;
        }

        stakedBalance[msg.sender] += amount;
        lastStakeTime[msg.sender] = block.timestamp;

        emit Staked(msg.sender, amount);
    }

    function unstake() external {
        uint256 staked = stakedBalance[msg.sender];
        require(staked > 0, "Stake edilmis bakiye yok");

        uint256 reward = calculateReward(msg.sender);
        uint256 totalAmount = staked + reward;

        stakedBalance[msg.sender] = 0;
        lastStakeTime[msg.sender] = 0;

        stakingToken.transfer(msg.sender, totalAmount);

        emit Unstaked(msg.sender, staked, reward);
    }

    function calculateReward(address user) public view returns (uint256) {
        if (stakedBalance[user] == 0) return 0;
        uint256 timeElapsed = block.timestamp - lastStakeTime[user];
        return timeElapsed * rewardRatePerSecond;
    }
}
