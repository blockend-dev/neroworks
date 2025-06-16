// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./Storage.sol";

contract Proxy {
    address public implementation;

    constructor(address _implementation, bytes memory _initData) {
        implementation = _implementation;
        (bool success, bytes memory data) = _implementation.delegatecall(_initData);
        if (!success) {
            assembly {
                revert(add(data, 32), mload(data))
            }
        }

    }

    fallback() external payable {
        address impl = implementation;
        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch result
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }

    receive() external payable {}
}
