// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title BadgeMinter
 * @notice ERC721 contract that mints badges for recipients based on blessing thresholds.
 * No explicit if-statements — thresholds determine which badge a user earns.
 *
 * Badge thresholds (inclusive):
 *  - 1   => Gravekeeper
 *  - 30  => Necromancer
 *  - 50  => Digital Ghost
 *  - 70  => Phoenix
 *  - 100 => Soul Shepherd
 *  - 150 => Master Curator
 */
contract BadgeMinter is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    using ECDSA for bytes32;

    Counters.Counter private _tokenIds;

    uint256[] public thresholds;
    string[] public badgeNames;

    // Base URI for token metadata
    string private _baseTokenURI;

    // signer address used to verify off-chain attestations
    address private _authorizedSigner;

    // used nonces per user to prevent replay
    mapping(address => mapping(uint256 => bool)) public usedNonces;

    // per-user per-badge index claim tracking
    mapping(address => mapping(uint256 => bool)) public claimed;

    event BadgeMinted(address indexed to, uint256 indexed tokenId, string badgeName, uint256 blessings);
    event BadgeClaimed(address indexed claimer, uint256 indexed tokenId, string badgeName, uint256 blessings);

    constructor(string memory baseURI_) ERC721("Deadtime Scroll Badges", "DSB") Ownable(msg.sender) {
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
        _authorizedSigner = msg.sender;
    }

    // =============================
    // 🔐  Admin Utilities
    // =============================

    function setAuthorizedSigner(address signer) external onlyOwner {
        _authorizedSigner = signer;
    }

    function authorizedSigner() external view returns (address) {
        return _authorizedSigner;
    }

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

    // =============================
    // 🪄  Core Minting Logic
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

    function badgeForBlessings(uint256 blessings) external view returns (string memory) {
        uint256 badgeCount = 0;
        for (uint256 i = 0; i < thresholds.length; i++) {
            badgeCount += (blessings >= thresholds[i]) ? 1 : 0;
        }
        require(badgeCount > 0, "BadgeMinter: no badge for blessings count");
        return badgeNames[badgeCount - 1];
    }

    // =============================
    // 🧾  Claiming with Signature
    // =============================

   function claimBadge(uint256 blessings, uint256 nonce, bytes calldata signature) external returns (uint256) {
    // Step 1: Verify signature and nonce
    bytes32 hash = _getClaimHash(msg.sender, blessings, nonce);
    address signer = hash.recover(signature);
    require(signer == _authorizedSigner, "BadgeMinter: invalid signer");
    require(!usedNonces[msg.sender][nonce], "BadgeMinter: nonce used");
    usedNonces[msg.sender][nonce] = true;

    // Step 2: Determine badge eligibility
    uint256 badgeIndex = _getBadgeIndex(blessings);
    require(!claimed[msg.sender][badgeIndex], "BadgeMinter: badge already claimed");
    claimed[msg.sender][badgeIndex] = true;

    // Step 3: Mint token and set URI
    _tokenIds.increment();
    uint256 newTokenId = _tokenIds.current();
    _safeMint(msg.sender, newTokenId);

    string memory name = badgeNames[badgeIndex];
    _setTokenURI(newTokenId, _buildTokenURI(name));

    // Step 4: Emit events
    emit BadgeMinted(msg.sender, newTokenId, name, blessings);
    emit BadgeClaimed(msg.sender, newTokenId, name, blessings);
    return newTokenId;
}

// Helper functions to reduce stack usage
function _getClaimHash(address claimer, uint256 blessings, uint256 nonce) internal view returns (bytes32) {
    bytes32 hash = keccak256(abi.encodePacked(claimer, blessings, nonce, address(this)));
    return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
}

function _getBadgeIndex(uint256 blessings) internal view returns (uint256) {
    uint256 badgeCount = 0;
    for (uint256 i = 0; i < thresholds.length; i++) {
        badgeCount += (blessings >= thresholds[i]) ? 1 : 0;
    }
    require(badgeCount > 0, "BadgeMinter: no badge for blessings count");
    return badgeCount - 1;
}

function _buildTokenURI(string memory name) internal view returns (string memory) {
    return bytes(_baseTokenURI).length == 0
        ? name
        : string(abi.encodePacked(_baseTokenURI, name));
}
}
