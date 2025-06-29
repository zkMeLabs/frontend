/* eslint-disable */

import React from 'react';
import { useMemo , useEffect} from 'react';
import { Box, Flex, Button , Portal, Text } from '@chakra-ui/react';
import { Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import useAccount from 'lib/web3/useAccount';


const CustomMenuItem = (props: any) => {
    const { children, onClick , disabled , _hover,  ...rest } = props;
    return (
        <MenuItem
            {...rest}
            onClick={(e: any) => {
                e.stopPropagation();
                if (disabled) {
                    return;
                }
                onClick && onClick(e);
            }}
            zIndex={ 1999 }   
            _hover={ disabled ? {} : _hover || { backgroundColor: '#FFCBEC', opacity: 0.9 }}
            cursor={ disabled ? 'not-allowed' : 'pointer'}
            opacity={ disabled ? 0.6 : 1}
        >
            {children}
        </MenuItem>
    );
}

const no_op = () => {};

const ChevronDownIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="12" viewBox="0 0 13 12" fill="none">
            <path d="M3.5 4.5L6.5 7.5L9.5 4.5" stroke="black" strokeOpacity="0.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

const PlainButton = ({text,  onClick,  disabled = false , width = '72px'}: {
    text: string,
    onClick?: () => void,
    disabled?: boolean
    width?: string,
}) => {
    return (
        <Button
            onClick={ () => {
                if (disabled) {
                    return;
                }
                onClick && onClick();
            }}
            py = "4px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            _hover={{ backgroundColor: "#FFCBEC" , opacity: 0.9 }}
            width={ width }
            height={ '22px' }
            variant='solid'
            flexShrink={ 0 }
            padding = { '0 20px' }
            backgroundColor = { disabled ? '#FFCBEC' : '#FF57B7' }
            cursor={ disabled ? 'not-allowed' : 'pointer' }
            borderRadius={9999}
        >
            <Text 
                fontSize="12px"
                fontWeight="400"
                lineHeight="normal"
                color = {'white' }
                fontFamily="HarmonyOS Sans"
            >{ text }</Text>
        </Button>
    );
}

const dropIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="12" viewBox="0 0 13 12" fill="none">
        <path d="M3.5 4.5L6.5 7.5L9.5 4.5" stroke="black" strokeOpacity="0.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
)

const ActionButtonGroup = ({
    validatorAddress = '',
    showClaim = false,
    showStake = false,
    disableClaim = false,
    disableStake = false,
    currentRecord = {},
    setAvailableAmount = no_op,
    handleWithdraw = no_op,
    handleMoveStake = no_op,
    handleStake = no_op,
    handleClaim = no_op,
    setCurrentAddress = no_op,
}: {
    showClaim?: boolean,
    showStake?: boolean,
    disableClaim?: boolean,
    disableStake?: boolean,
    validatorAddress?: string,
    currentRecord?: any,
    handleWithdraw?: (address: string, record?: any) => void,
    handleMoveStake?: (address: string, record?: any) => void,
    handleStake?: (address: string, record?: any) => void,
    handleClaim?: (address: string, record?: any) => void,
    setCurrentAddress?: (address: string) => void,
    setAvailableAmount?: (value: string) => void,
}) => {
    const { isConnected: WalletConnected } = useAccount();

    const isValidatorJailed = useMemo(() => {
        if (!currentRecord || !currentRecord?.status) {
            return false;
        }
        return currentRecord?.status === "Jailed";
    } , [currentRecord]);


    const _disableStake = useMemo(() => {
        if (!currentRecord || !currentRecord?.claimable) {
            return true;
        } else if (currentRecord?.status === "Unbonding" || currentRecord?.status === "Inactive") {
            return true;
        }
        return false;
    } , [currentRecord]);


    const isWalletNotConnected = useMemo(() => {
        return !WalletConnected;
    }, [WalletConnected]);

    const _disableClaim = useMemo(() => {
        if (!currentRecord || !currentRecord?.claimable) {
            return true;
        } else if (isNaN(Number(currentRecord?.claimable))) {
            return true;
        } else if (Number(currentRecord?.claimable) < 0.0001) {
            return true;
        }
        return false;
    }, [currentRecord]);

    const _disableWithdrawAndMove = useMemo(() => {
        if (!currentRecord || !currentRecord?.myStake) {
            return true;
        } else if (isNaN(Number(currentRecord?.myStake))) {
            return true;
        } else if (Number(currentRecord?.myStake) < 0.00000001 ) {
            return true;
        }
        return false;
    }, [currentRecord]);


    return (
        <Flex
            width="100%"
            height="auto"
            padding = { '0' }
            alignItems="center"
            justifyContent="center"
            position="relative"
        >
            <Flex
                width="100%"
                height="auto"
                alignItems="center"
                flexShrink={ 0 }
                justifyContent="center"
                gap={ '10px' }
            >
                { showClaim && 
                    <PlainButton
                        text={ 'Claim' }
                        onClick={ () => {
                            setCurrentAddress(validatorAddress);
                            handleClaim(validatorAddress, currentRecord);
                            // setAvailableAmount(currentRecord?.availableAmount || '0');
                            setCurrentAddress(validatorAddress);
                        }}
                        disabled={ disableClaim || isWalletNotConnected || _disableClaim}
                    />
                }
                { showStake && 
                    <PlainButton
                        text={ 'Stake' }
                        onClick={ () => {
                            if (!disableStake) {
                                handleStake(validatorAddress, currentRecord);
                                setCurrentAddress(validatorAddress);
                                // setAvailableAmount(currentRecord?.availableAmount || '0');
                            }
                        }}
                        disabled={ disableStake || isWalletNotConnected || isValidatorJailed || _disableStake}
                    />
                }
                <Menu placement="bottom-end">
                    <div style={{ width: "72px" }} >
                        <MenuButton 
                            display="flex"
                            flexDirection="row"
                            alignItems="center"
                            justifyContent="center"
                            _hover={{ opacity: 0.9 }}
                            _active={{ opacity: 0.9 }}
                            width={ '100%' }
                            height={ '22px' }
                            paddingInlineEnd={ "8px" }
                            variant='solid'
                            backgroundColor = { 'rgba(0, 0, 0, 0.10)'}
                            cursor={'pointer'  }
                            borderRadius={9999}
                            as={Button} rightIcon={<ChevronDownIcon />}>
                            <Text 
                                fontSize="12px"
                                fontWeight="400"
                                lineHeight="22px"
                                as={'span'}
                                paddingBottom={ "2px" }
                                color = {'rgba(0, 0, 0, 0.60)' }
                                fontFamily="HarmonyOS Sans"
                            >More</Text>
                        </MenuButton>
                    </div>
                    <Portal>
                        <MenuList width='110px' minWidth='110px' zIndex={ 1999 }
                            fontSize="14px"
                            fontWeight="500"
                            lineHeight="22px"
                            color ="#000"
                            padding={ '4px' }
                            fontFamily="HarmonyOS Sans"
                        >
                            <CustomMenuItem
                                onClick={(e: any) => {
                                    e.stopPropagation();
                                    setCurrentAddress(validatorAddress);
                                    handleWithdraw(validatorAddress, currentRecord);
                                }}
                                borderRadius={"8px"}
                                disabled={ isWalletNotConnected || _disableWithdrawAndMove  }
                                _hover={{ backgroundColor: "#FEF1F9" , color: '#FF57B7' }}
                                _active={{ backgroundColor: "#FEF1F9" , color: '#FF57B7' }}
                                >Withdraw</CustomMenuItem>
                            <CustomMenuItem
                                onClick={(e: any) => {
                                    e.stopPropagation();
                                    handleMoveStake(validatorAddress, currentRecord);
                                    setCurrentAddress(validatorAddress);
                                }}
                                borderRadius={"8px"}
                                disabled={ isWalletNotConnected || _disableWithdrawAndMove }
                                _hover={{ backgroundColor: "#FEF1F9" , color: '#FF57B7' }}
                                _active={{ backgroundColor: "#FEF1F9" , color: '#FF57B7' }}
                                >Move Stake</CustomMenuItem>
                        </MenuList>
                    </Portal>
                </Menu>
            </Flex>
        </Flex>
    );
}


export default ActionButtonGroup;