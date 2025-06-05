// SPDX-License-Identifier: MIT
// Δηλώνουμε την έκδοση του Solidity που χρησιμοποιούμε
pragma solidity ^0.8.20;

// Εισάγουμε το συμβόλαιο ασφαλείας για αποτροπή επαναεισόδου (ReentrancyGuard)
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Crowdfunding is ReentrancyGuard {
// Διεύθυνση του ιδιοκτήτη του συμβολαίου
    address public owner;
    address public pendingOwner;
    bool public contractDestroyed = false;
    bool public destructionConfirmed = false;

    uint public constant CAMPAIGN_FEE = 0.02 ether;
    uint public constant COMPLETION_FEE_PERCENTAGE = 20;
    uint public constant MAX_PLEDGES_PER_CAMPAIGN = 1000000;
    uint public constant MAX_SHARES_PER_PLEDGE = 1000;
    uint public constant MAX_TITLE_LENGTH = 100;
    uint public constant MAX_PLEDGES_NEEDED = 1000000;
    uint public constant MAX_PLEDGE_COST = 100 ether;

    uint public nextCampaignId = 1;
    uint public totalCampaignFeesCollected;
    uint public totalCommissionsAvailable;
    uint public totalOwnerWithdrawn;
function getFeesCollected() public view returns (uint) {
    return totalCampaignFeesCollected;
}

    constructor() {
        owner = msg.sender;
    }

// Η βασική δομή καμπάνιας που περιέχει όλα τα δεδομένα κάθε καμπάνιας
    struct Campaign {
        uint campaignId;
        address entrepreneur;
        string title;
        uint pledgeCost;
        uint pledgesNeeded;
        uint pledgesCount;
        bool fulfilled;
        bool cancelled;
        address[] backers;
        mapping(address => uint) sharesPerBacker;
        mapping(address => bool) refunded;
    }

// Αντιστοίχιση μοναδικών ID με τις καμπάνιες
    mapping(uint => Campaign) public campaigns;
    mapping(address => mapping(string => bool)) public entrepreneurTitles;
    mapping(uint => mapping(address => bool)) public hasBacked;

    uint[] public activeCampaigns;
    uint[] public completedCampaigns;
    uint[] public cancelledCampaigns;

    mapping(address => bool) public bannedList;
    address[] public bannedAddresses;

// Επιτρέπει την εκτέλεση μόνο από τον ιδιοκτήτη
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier notOwner() {
        require(msg.sender != owner, "Owner cannot perform this action");
        _;
    }

    modifier notBanned() {
        require(!bannedList[msg.sender], "Address is banned");
        _;
    }

    modifier campaignExists(uint _id) {
        require(_id > 0 && _id < nextCampaignId, "Campaign doesn't exist");
        _;
    }

    modifier campaignActive(uint _id) {
        require(!campaigns[_id].cancelled, "Cancelled campaign");
        require(!campaigns[_id].fulfilled, "Already fulfilled");
        _;
    }

    modifier onlyEntrepreneurOrOwner(uint _id) {
        require(
            msg.sender == campaigns[_id].entrepreneur || msg.sender == owner,
            "Not authorized"
        );
        _;
    }

    modifier notDestroyed() {
        require(!contractDestroyed, "Contract inactive");
        _;
    }

    modifier validShares(uint _shares) {
        require(_shares > 0 && _shares <= MAX_SHARES_PER_PLEDGE, "Invalid shares amount");
        _;
    }

    function isValidCampaignTitle(string memory _title) internal pure returns (bool) {
        bytes memory b = bytes(_title);
        return (b.length > 0 && b.length <= MAX_TITLE_LENGTH);
    }

    event CampaignCreated(uint campaignId, address entrepreneur, string title);
    event PledgeMade(uint campaignId, address backer, uint shares);
    event CampaignCancelled(uint campaignId);
    event CampaignFulfilled(uint campaignId, uint totalRaised);
    event RefundClaimed(address backer, uint amount);
    event EntrepreneurBanned(address indexed entrepreneur);
    event OwnerChanged(address newOwner);
    event ContractDestroyed();
    event DestructionConfirmed();
    event OwnerWithdrawn(uint amount);

// Συνάρτηση για δημιουργία νέας καμπάνιας από επιχειρηματία
    function createCampaign(string memory _title, uint _pledgeCost, uint _pledgesNeeded)
        public
        payable
        notOwner
        notBanned
        notDestroyed
    {
        require(msg.value == CAMPAIGN_FEE, "Fee is 0.02 ETH");
        require(isValidCampaignTitle(_title), "Invalid title length");
        require(_pledgeCost > 0 && _pledgeCost <= MAX_PLEDGE_COST, "Invalid pledge cost");
        require(_pledgesNeeded > 0 && _pledgesNeeded <= MAX_PLEDGES_NEEDED, "Invalid pledge target");
        require(!entrepreneurTitles[msg.sender][_title], "Title reused");

        entrepreneurTitles[msg.sender][_title] = true;

        uint id = nextCampaignId++;
        Campaign storage c = campaigns[id];
        c.campaignId = id;
        c.entrepreneur = msg.sender;
        c.title = _title;
        c.pledgeCost = _pledgeCost;
        c.pledgesNeeded = _pledgesNeeded;

        activeCampaigns.push(id);
        totalCampaignFeesCollected += msg.value;

        emit CampaignCreated(id, msg.sender, _title);
    }

// Επιτρέπει σε επενδυτές να επενδύσουν αγοράζοντας μετοχές
    function pledgeCampaign(uint _id, uint _shares)
        public
        payable
        campaignExists(_id)
        campaignActive(_id)
        notDestroyed
        nonReentrant
        validShares(_shares)
    {
        Campaign storage c = campaigns[_id];
        require(c.pledgesCount + _shares <= MAX_PLEDGES_PER_CAMPAIGN, "Exceeds max pledges");
        uint cost = _shares * c.pledgeCost;
        require(msg.value == cost, "Incorrect amount");

        if (!hasBacked[_id][msg.sender]) {
            c.backers.push(msg.sender);
            hasBacked[_id][msg.sender] = true;
        }

        c.sharesPerBacker[msg.sender] += _shares;
        c.pledgesCount += _shares;

        emit PledgeMade(_id, msg.sender, _shares);
    }

// Ολοκλήρωση καμπάνιας και μεταφορά κεφαλαίων στον επιχειρηματία
    function completeCampaign(uint _id)
        public
        campaignExists(_id)
        campaignActive(_id)
        onlyEntrepreneurOrOwner(_id)
        notDestroyed
        nonReentrant
    {
        Campaign storage c = campaigns[_id];
        require(c.pledgesCount >= c.pledgesNeeded, "Goal not reached");

        c.fulfilled = true;
        completedCampaigns.push(_id);
        _removeFromActive(_id);

        uint total = c.pledgesCount * c.pledgeCost;
        uint entrepreneurShare = (total * (100 - COMPLETION_FEE_PERCENTAGE)) / 100;
        uint commission = total - entrepreneurShare;

        payable(c.entrepreneur).transfer(entrepreneurShare);
        totalCommissionsAvailable += commission;

        emit CampaignFulfilled(_id, total);
    }

// Ακύρωση καμπάνιας από τον επιχειρηματία ή τον ιδιοκτήτη
    function cancelCampaign(uint _id)
        public
        campaignExists(_id)
        campaignActive(_id)
        onlyEntrepreneurOrOwner(_id)
        notDestroyed
    {
        campaigns[_id].cancelled = true;
        cancelledCampaigns.push(_id);
        _removeFromActive(_id);
        emit CampaignCancelled(_id);
    }

// Επιστροφή χρημάτων σε επενδυτές από ακυρωμένες καμπάνιες
    function claimRefund(uint _id)
        public
        campaignExists(_id)
        nonReentrant
    {
        Campaign storage c = campaigns[_id];
        require(c.cancelled, "Not cancelled");
        require(!c.refunded[msg.sender], "Already refunded");
        require(c.sharesPerBacker[msg.sender] > 0, "No shares");

        uint amount = c.sharesPerBacker[msg.sender] * c.pledgeCost;
        c.refunded[msg.sender] = true;
        payable(msg.sender).transfer(amount);

        emit RefundClaimed(msg.sender, amount);
    }

// Ο ιδιοκτήτης κάνει ανάληψη των fees και κρατήσεων
    function withdrawOwnerFunds() public onlyOwner nonReentrant {
        uint available = totalCampaignFeesCollected + totalCommissionsAvailable - totalOwnerWithdrawn;
        require(available > 0, "No owner funds available");
        totalOwnerWithdrawn += available;
        payable(owner).transfer(available);
        emit OwnerWithdrawn(available);
    }

    function proposeOwner(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid address");
        pendingOwner = newOwner;
    }

    function acceptOwnership() public {
        require(pendingOwner != address(0), "No owner proposed");
        require(msg.sender == pendingOwner, "Only proposed owner");
        owner = pendingOwner;
        pendingOwner = address(0);
        emit OwnerChanged(owner);
    }

    function confirmDestruction() public onlyOwner {
        destructionConfirmed = true;
        emit DestructionConfirmed();
    }

// Καταστροφή συμβολαίου (αδρανοποίηση λειτουργιών εκτός αποζημίωσης)
    function destroyContract() public onlyOwner {
        require(destructionConfirmed, "Call confirmDestruction first");
        contractDestroyed = true;
        destructionConfirmed = false;
        emit ContractDestroyed();
    }

    function banEntrepreneur(address _addr) public onlyOwner {
        require(!bannedList[_addr], "Already banned");
        bannedList[_addr] = true;
        bannedAddresses.push(_addr);
        emit EntrepreneurBanned(_addr);
    }

    function _removeFromActive(uint _id) internal {
        uint len = activeCampaigns.length;
        for (uint i = 0; i < len; i++) {
            if (activeCampaigns[i] == _id) {
                if (i != len - 1) {
                    activeCampaigns[i] = activeCampaigns[len - 1];
                }
                activeCampaigns.pop();
                break;
            }
        }
    }

// Επιστρέφει το υπόλοιπο του συμβολαίου
    function getContractBalance() public view returns (uint) {
        return address(this).balance;
    }

    function getActiveCampaigns() public view returns (uint[] memory) {
        return activeCampaigns;
    }

    function getCompletedCampaigns() public view returns (uint[] memory) {
        return completedCampaigns;
    }

    function getCancelledCampaigns() public view returns (uint[] memory) {
        return cancelledCampaigns;
    }

    function getCampaignBackers(uint _id) public view campaignExists(_id) returns (address[] memory) {
        return campaigns[_id].backers;
    }

    function getBackerShares(uint _id, address backer) public view campaignExists(_id) returns (uint) {
        return campaigns[_id].sharesPerBacker[backer];
    }

    function getBannedEntrepreneurs() public view returns (address[] memory) {
        return bannedAddresses;
    }
}
