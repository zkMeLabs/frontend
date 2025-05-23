/* eslint-disable */
import useAccount from 'lib/web3/useAccount';
import { Box, Grid, Flex, Button,  Text } from '@chakra-ui/react';
import StakingModal from './StakingModal';
import ValidatorItemBar from 'ui/staking/ValidatorItemBar';
import StakingModalNumberInput from 'ui/staking/StakingModalNumberInput';
import SuccessfulContent from 'ui/stakingModal/SuccessfulContent';
import EarnInfoBox from 'ui/staking/EarnInfoBox';
import ReadOnlyInput from 'ui/stakingModal/ReadOnlyInput';
import ModalFooterBtnGroup from 'ui/staking/ModalFooterBtnGroup';
import HeadsUpInfo from 'ui/staking/HeadsUpInfo';
import StakingValidatorSelect from 'ui/staking/StakingValidatorSelect';
import WithTextWrapper from 'ui/staking/WithTextWrapper';
import FromAndToSelect from 'ui/staking/FromAndToSelect';
import { useStakeLoginContextValue } from 'lib/contexts/stakeLogin';
import React ,  { useCallback, useEffect } from 'react';
import axios from 'axios';
import styles from 'ui/staking/spinner.module.css';


const formatNumberWithCommas  = (input: string) => {
  if (!input) return "";

  // 移除现有逗号
  let value = input.replace(/,/g, '');

  // 校验是否为合法数字格式（可为空、小数点结尾等）
  if (!/^[-]?\d*\.?\d*$/.test(value)) return "";

  // 拆分整数和小数部分
  let [integerPart, decimalPart = ""] = value.split(".");

  // 去除整数前的多余0（保留单独的0）
  if (integerPart) {
    const isNegative = integerPart.startsWith("-");
    integerPart = integerPart.replace(/^-?0+(?=\d)/, isNegative ? "-" : "");
  }

  // 限制小数部分最多 4 位
  decimalPart = decimalPart.slice(0, 4);

  // 添加千位分隔符
  const isNegative = integerPart.startsWith("-");
  const absInt = isNegative ? integerPart.slice(1) : integerPart;
  const formattedInt = absInt.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const result = isNegative ? `-${formattedInt}` : formattedInt;
  return decimalPart ? `${result}.${decimalPart}` : result;
}


type txType = 'Withdraw' | 'Claim' | 'Stake' | 'MoveStake' | 'ClaimAll' | 'ChooseStake' | 'Compound-Claim' | 'Compound-Stake'

const CommonModal = ({
    isOpen,
    onClose,
    isSubmitting,
    title,
    onSubmit,
    onOpen,
    currentAmount,
    setCurrentAmount,
    currentTxType,
    availableAmount,
    setAvailableAmount,
    transactionStage,
    extraDescription = null,
    currentItem,
    currentApr,
    currentFromItem,
    currentAddress,
    currentFromAddress,
    setCurrentAddress,
    setCurrentFromAddress,
    setCurrentItem,
    callback,
    currentToItem,
    setCurrentToItem = () => {},
    setCurrentToAddress = () => {},
    txhash,
}: {
    isOpen: boolean;
    isSubmitting: boolean;
    onClose: () => void;
    title: string;
    onSubmit: (targetAddress: string, txType: string, amount: string, target?: string) => void;
    onOpen: () => void;
    currentAmount: string;
    transactionStage: string;
    setCurrentAmount: (value: string) => void;
    currentTxType: txType;
    availableAmount: string;
    setAvailableAmount: (value: string) => void;
    extraDescription?: string | null;
    currentAddress?: string;
    currentItem?: any;
    currentToItem?: any;
    currentApr?: string;
    currentFromItem?: any;
    currentFromAddress?: string;
    setCurrentAddress: (value: string) => void;
    setCurrentFromAddress: (value: string) => void;
    setCurrentFromItem: (value: any) => void;
    setCurrentItem: (value: any) => void;
    setCurrentToItem ?: (value: any) => void;
    callback ?: () => void;
    setCurrentToAddress ?: (value: string) => void;
    txhash?: string;
}) => {

    const [ loading, setLoading ] = React.useState<boolean>(false);

    const spinner = (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '180px',
            width: '100%', marginTop: '10px' }}>
            <span className ="modal-spinner"></span>
        </div>
    );

    const [ apr , setApr ] = React.useState<string | number>("0.00");

    const [ inputStr , setInputStr ] = React.useState<string>(currentAmount);

    const handleSetApr = (value: string | number) => {
        setApr(value);
    }

    React.useEffect(() => {
        if( currentApr ) {
            setApr(currentApr);
        }
    }, [ currentApr ]);

    const [ myValidatorsList, setMyValidatorsList ] = React.useState<any[]>([]);
    const [ allValidatorsList, setAllValidatorsList ] = React.useState<any[]>([]);

    const isSuccess = React.useMemo(() => {
        if (transactionStage === 'success') {
            return true;
        } else {
            return false;
        }
    }
    , [ transactionStage ]);

    const { serverUrl : url } = useStakeLoginContextValue();
    
    const selectable = React.useMemo(() => {
        if (currentTxType === 'ChooseStake' || currentTxType === 'MoveStake' || currentTxType === 'Compound-Stake') {
            return true;
        }
        return false;
    }, [ currentTxType ]);
    

    const { address: userAddr } = useAccount();

    const requestMyValidatorsList = React.useCallback(async() => {
        if ( !userAddr) {
            return;
        }
        try {
            setLoading(true);
            const param = new URLSearchParams();
            param.append('limit', '100');
            param.append('address', (userAddr || '').toLowerCase());
            const res = await axios.get(url + '/api/me/staking/delegations?' + param.toString(), {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            }).then((response) => {
                return response.data;
            }).catch((error) => {
                return null;
            });
            setLoading(false);
            if(res && res.code === 200) {
                const _temp = (res.data.validators || []).map((item: any) => {
                    return {
                        ...item,
                        validatorAddress: item.validatorAddress,
                        liveApr: item.liveAPR,
                    }
                });
                setMyValidatorsList(_temp);
            }
            setLoading(false);
        } catch (error: any) {
            setLoading(false);
        }
    }, [ url , userAddr]);

    const requestAlValidatorsList = React.useCallback(async() => {
        try {
            setLoading(true);
            const param = new URLSearchParams();
            param.append('limit', '100');
            // const res = await (await fetch(url + '/api/network/validators/list' + '?' + param.toString(), {
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            // })).json() as  any;
            const res = await axios.get(url + '/api/network/validators/list' + '?' + param.toString(), {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            }).then((response) => {
                return response.data;
            }).catch((error) => {
                return null;
            });
            if(res && res.code === 200) {
                const _temp = (res.data.validators || []).map((item: any) => {
                    return {
                        ...item,
                        liveApr: item.liveApr,
                        validatorAddress: item.validator,
                    }
                });
                setAllValidatorsList(_temp);
            }
        }
        catch (error: any) {
            setLoading(false);
        throw Error(error);
        }
    }
    , [ url ]);

    const handleCloseModal = () => {
        setCurrentAmount("0");
        setInputStr("0.00");
        onClose();
    }


    const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!currentAddress) {
            return;
        }
        if (currentTxType === 'ChooseStake') {
            if (!currentItem) {
                return;
            }
            onSubmit(currentAddress, currentTxType, currentAmount);
        }
        if (currentTxType === 'Stake' || currentTxType === 'Withdraw') {
            onSubmit(currentAddress, currentTxType, currentAmount);
        } else if (currentTxType === 'Claim' || currentTxType === 'ClaimAll' || currentTxType === 'Compound-Claim') {
            onSubmit(currentAddress, currentTxType, "0");
        } else if (currentTxType === 'MoveStake') { 
            onSubmit(currentAddress, currentTxType, currentAmount);
        }
    };


    React.useEffect(() => {
        if (isOpen) {
            requestMyValidatorsList();
            requestAlValidatorsList();
        }
    }, [ isOpen, requestMyValidatorsList, requestAlValidatorsList ]);


    const ConfirmBtnText = React.useMemo(() => {
        switch (currentTxType) {
            case 'Stake':
                return 'Stake';
            case 'ChooseStake':
                return 'Stake';
            case 'Withdraw':
                return 'Withdraw';
            case 'Claim':
                return 'Claim';
            case 'ClaimAll':
                return 'Claim All';
            case 'MoveStake':
                return 'Move Stake';
            case 'Compound-Claim':
                return 'Claim';
            case 'Compound-Stake':
                return 'Stake';
            default:
                return '';
        }
    }, [ currentTxType ]);


    const [ isPopOverOpen, setIsPopOverOpen ] = React.useState(false);
    
    const handlePopOverOpen = () => {
        setIsPopOverOpen(true);
    }
    const handlePopOverClose = () => {
        setIsPopOverOpen(false);
    }
    const handlePopOverToggle = () => {
        setIsPopOverOpen((prev) => !prev);
    }

    const isOverAmount = React.useMemo(() => {
        if (currentTxType === 'Claim' || currentTxType === 'ClaimAll' || currentTxType === 'Compound-Claim') {
            return false;
        }
        const _ca = Number(currentAmount);
        const _va = Number(availableAmount);
        if( isNaN(_ca) || isNaN(_va)) {
            return false;
        }
        if ( _ca > _va ) {
            return true;
        }
        return false;
    }, [ currentAmount, availableAmount, currentTxType ]);


    const isInputAmountValid = React.useMemo(() => {
        if (!currentAmount) {
            return false;
        }
        if (!currentTxType.includes('Claim') ) {
            if (Number(currentAmount) > Number(availableAmount)) {
                return false;
            }
        }
        if (Number(currentAmount) <= 0) {
            return false;
        }
        return true;
    } , [ currentAmount, availableAmount, currentTxType ]);


    useEffect(() => {
        console.log('currentToItem', currentToItem);
        console.log('currentFromItem', currentFromItem);
    }, [ currentToItem, currentFromItem ]);

    const isSelectedValidatorValid = React.useMemo(() => {
        if (currentTxType === 'ChooseStake' || currentTxType === 'MoveStake' || currentTxType === 'Compound-Stake') {

            if(!currentItem || !currentItem.validatorAddress) {
                return false;
            }
            if(currentTxType === 'MoveStake' && (
                currentToItem.validatorAddress === currentFromItem.validatorAddress ||
                !currentToItem.validatorAddress)
            ) {
                return false;
            }
        }

        return true;
    }, [ currentItem, currentTxType , currentFromItem , currentToItem ]);


    const handleCloseDialog = useCallback(() => {
        handleCloseModal();
        if ( transactionStage === 'success' ) {
            callback && callback();
        }
    }, [ transactionStage, callback ]);

    return (
        <StakingModal 
            isOpen={ isOpen }
            onClose={ handleCloseModal }
            onOpen={ onOpen }
            title={ isSuccess ? " " : title }
            isSuccess={ isSuccess }
            extraDescription={ extraDescription }
        >
            { transactionStage === 'success' && (
                <SuccessfulContent 
                    text='Transaction Success'
                    txhash = { txhash || '' }
                    onClose={ () => {
                        handleCloseDialog();
                    }}
                />
            )}

            { transactionStage === 'comfirming' && ( spinner ) }
            { (transactionStage !== 'success' && transactionStage !== 'comfirming') && (
                <>
                    <div style={{ maxHeight: '590px', marginBottom: '80px', overflowY: 'auto' }}>
                        {
                            (currentTxType === 'Claim' || currentTxType === 'ClaimAll' || currentTxType === 'Compound-Claim') ? (
                                <Box width="100%" height="auto">
                                    <ReadOnlyInput 
                                        amount = { currentAmount }
                                        price = { currentAmount }
                                    />
                                </Box>
                            ): (
                                <>
                                    { 
                                        selectable ? (
                                            ( currentTxType === 'MoveStake' ) ? (
                                                    <FromAndToSelect
                                                        FromItem = { currentItem }
                                                        currentToItem = { currentToItem }
                                                        setCurrentToItem = { setCurrentToItem }
                                                        setApr = { handleSetApr }
                                                        setCurrentFromAddress = { setCurrentFromAddress }
                                                        setCurrentToAddress = { setCurrentToAddress }
                                                        myValidatorsList = { myValidatorsList }
                                                        setCurrentAddress = { setCurrentAddress }
                                                        allValidatorsList = { allValidatorsList }
                                                    /> 
                                                ) : ( 
                                                    <WithTextWrapper text="Validators">
                                                        <StakingValidatorSelect 
                                                            isOpen={ isPopOverOpen }
                                                            onToggle={ handlePopOverToggle }
                                                            onClose={ handlePopOverClose }
                                                            setApr = { handleSetApr }
                                                            setCurrentAddress = { setCurrentAddress }
                                                            myValidatorsList={ myValidatorsList }
                                                            allValidatorsList={ allValidatorsList }
                                                            selectedValidator={ currentItem }
                                                            setSelectedValidator={ (validator: any) => setCurrentItem(validator) }
                                                        />
                                                    </WithTextWrapper>
                                            )
                                        ) : (
                                            <ValidatorItemBar
                                                showArrow={false}
                                                liveApr={ (Number(currentItem?.liveApr  || 0) * 100).toFixed(1) + '%' }
                                                validatorName = {currentItem?.validatorAddress || ''}
                                                validatorAvatar={null}
                                                onClick={() => {} }
                                            />
                                        )
                                    }

                                    <Flex
                                        flexDirection="column"
                                        justifyContent="flex-start"
                                        alignItems="flex-start"
                                        width="100%"
                                        gap="16px"
                                        marginTop="16px"
                                    >
                                        <Box width="100%" height="auto">
                                            <StakingModalNumberInput 
                                                value = { currentAmount }
                                                handleMaxClick = { () => {
                                                    setCurrentAmount(availableAmount);
                                                    setInputStr(formatNumberWithCommas(availableAmount));
                                                }}
                                                isOverAmount = { isOverAmount }
                                                setValue = { setCurrentAmount }
                                                inputStr = { inputStr }
                                                setInputStr = { setInputStr }
                                                availableAmount = { availableAmount }
                                            />
                                        </Box>
                                        {
                                            currentTxType !== 'Withdraw' && (
                                                <Box width="100%" height="auto">
                                                    <EarnInfoBox 
                                                        amount = { currentAmount }
                                                        apr = { apr }
                                                    />
                                                </Box>
                                            )
                                        }

                                        {
                                            currentTxType === 'Withdraw' && (
                                                <Box width="100%" height="auto">
                                                    <HeadsUpInfo
                                                        label="Heads Up"
                                                        value="It takes 1 days to receive MOCA after you withdraw."
                                                    />
                                                </Box>
                                            )
                                        }
                                    </Flex>
                                </>
                            )
                        }
                    </div>
                    <ModalFooterBtnGroup
                        onCancel={ handleCloseDialog }
                        onConfirm={ (e) => {
                            handleSubmit(e);
                        }}
                        cancelText="Cancel"
                        confirmText= { ConfirmBtnText }
                        isSubmitting={ isSubmitting }
                        isDisabled={ !(isInputAmountValid && isSelectedValidatorValid) || loading }
                    />
                </>
                )
            }   
        </StakingModal>
    )
}

export default CommonModal;
