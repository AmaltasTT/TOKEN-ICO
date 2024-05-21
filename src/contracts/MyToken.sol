// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract InfinityCoin is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ERC20Permit {
    bool isPaused;
    uint256 public maxSupply;
    constructor()
        ERC20("InfinityCoin", "IC")
        Ownable(msg.sender)
        ERC20Permit("InfinityCoin")
    {   
        isPaused = false;
        _mint(msg.sender, 100000 * 10**decimals());
        maxSupply = totalSupply();
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    // The following functions are overrides required by Solidity.

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._update(from, to, value);
    }
}
