// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title BadgeMinterV2
 * @notice ERC721 contract with ETH tipping functionality for revivals
 */
contract BadgeMinterV2 is ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    uint256[] public thresholds;
    string[] public badgeNames;
    string private _baseTokenURI;

    // Mapping from revival creator address to total ETH received
    mapping(address => uint256) public totalTipsReceived;
    
    // Mapping from revival ID to creator address
    mapping(string => address) public revivalCreators;

    event BadgeMinted(address indexed to, uint256 indexed tokenId, string badgeName, uint256 blessings);
    event TipSent(address indexed from, address indexed to, string revivalId, uint256 amount);

    constructor(string memory baseURI_) ERC721("Deadtime Scroll Badges V2", "DSB2") {
        // Initialize thresholds
        thresholds.push(1);
        thresholds.push(30);
        thresholds.push(50);
        thresholds.push(70);
        thresholds.push(100);
        thresholds.push(150);

        // Initialize badge names
        badgeNames.push("Gravekeeper");
        badgeNames.push("Necromancer");
        badgeNames.push("Digital Ghost");
        badgeNames.push("Phoenix");
        badgeNames.push("Soul Shepherd");
        badgeNames.push("Master Curator");

        _baseTokenURI = baseURI_;
    }

    // =============================
    // 💰 Tipping Functions
    // =============================

    function setRevivalCreator(string memory revivalId, address creator) external onlyOwner {
        revivalCreators[revivalId] = creator;
    }

    function tipRevivalCreator(string memory revivalId) external payable nonReentrant {
        require(msg.value > 0, "Tip amount must be greater than 0");
        address creator = revivalCreators[revivalId];
        require(creator != address(0), "Revival creator not found");
        require(creator != msg.sender, "Cannot tip yourself");

        // Send ETH directly to creator
        (bool success, ) = creator.call{value: msg.value}("");
        require(success, "Failed to send tip");

        // Update total tips received
        totalTipsReceived[creator] += msg.value;

        emit TipSent(msg.sender, creator, revivalId, msg.value);
    }

    // =============================
    // 🎖️ Badge Functions
    // =============================

    function mintBadgeFor(address to, uint256 blessings) external onlyOwner returns (uint256) {
        uint256 badgeCount = 0;
        for (uint256 i = 0; i < thresholds.length; i++) {
            badgeCount += (blessings >= thresholds[i]) ? 1 : 0;
        }
        require(badgeCount > 0, "BadgeMinter: no badge for blessings count");

        uint256 badgeIndex = badgeCount - 1;
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _safeMint(to, newTokenId);

        string memory name = badgeNames[badgeIndex];
        string memory tokenURI_ = bytes(_baseTokenURI).length == 0
            ? name
            : string(abi.encodePacked(_baseTokenURI, name));
        _setTokenURI(newTokenId, tokenURI_);

        emit BadgeMinted(to, newTokenId, name, blessings);
        return newTokenId;
    }

    // =============================
    // 🔧 Admin Functions
    // =============================

    function setBaseURI(string memory baseURI_) external onlyOwner {
        _baseTokenURI = baseURI_;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function setThresholdsAndNames(uint256[] memory newThresholds, string[] memory newNames) external onlyOwner {
        require(newThresholds.length == newNames.length, "BadgeMinter: lengths must match");
        thresholds = newThresholds;
        badgeNames = newNames;
    }

    // Emergency withdraw (should not be needed since tips go directly to creators)
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
}