/* eslint-disable */
import { Flex, Text, Box } from '@chakra-ui/react';
import LinkInternal from 'ui/shared/links/LinkInternal';
import WithTipsText from 'ui/staking/WithTipsText';
import truncateTokenAmountWithComma from 'ui/staking/truncateTokenAmountWithComma';


const EarningFormat = (value: number ) => {
    if ( value === 0) {
        return "0.00";
    } else if ( value < 0.01 ) {
        return "<0.01";
    } else  {
        return value.toFixed(2);
    }
}

const LabelAndValue = (props: {
    label: string | number | React.ReactNode;
    value: string | number | React.ReactNode;
}) => {
    return (
        <Flex
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
        >
            <Text
                fontSize="12px"
                fontWeight="500"
                color="rgba(0, 0, 0, 0.60)"
                textAlign="center"
                fontStyle="normal"
                lineHeight="140%"
                fontFamily="HarmonyOS Sans"
            >
                { props.label }
            </Text>
            <Text
                fontSize="12px"
                fontWeight="500"
                color="#000"
                textAlign="center"
                fontStyle="normal"
                lineHeight="140%"
                fontFamily="HarmonyOS Sans"
            >
                { props.value + " " }MOCA
            </Text>
        </Flex>
    );
}


const EarnInfoBox = (props: {
    apr: number | string;
    amount?: number | string;
}) => {

    const { apr , amount = "0.00" } = props;
    const yearlyEarnings = ( Number(apr) * Number(amount));
    const monthlyEarnings = ( yearlyEarnings / 12 );
    const dailyEarnings = ( yearlyEarnings / 360 );
    

    return (
        <Box 
            width="100%"
            padding="16px"
            borderRadius="16px" 
            border ="1px solid rgba(0, 46, 51, 0.10)" 
            backgroundColor="#fff"
            backdropFilter ="blur(5px)"
        >
            <Flex
                flexDirection="row"
                justifyContent="flex-start"
                alignItems="center"
                width="100%"
            >
                <WithTipsText
                    label={
                        <Text
                            fontSize="14px"
                            fontWeight="500"
                            width="auto"
                            display="inline"
                            color="#000"
                            fontStyle="normal"
                            lineHeight="140%"
                            fontFamily="HarmonyOS Sans"
                        >
                            Estimate Rewards
                        </Text>
                    }
                    tips={
                        <Text fontSize="14px" color="rgba(0, 0, 0, 0.4)">
                            Your earnings are calculated based on the current staking amount and the average annual yield.
                        </Text>
                    }
                />
            </Flex>
            <Flex
                flexDirection="column"
                justifyContent="flex-start"
                alignItems="center"
                width="100%"
                gap="8px"
                marginTop="12px"
            >
                <LabelAndValue label="Yearly Earnings" value={ truncateTokenAmountWithComma(yearlyEarnings) } />
                <LabelAndValue label="Monthly Earnings" value={  truncateTokenAmountWithComma(monthlyEarnings) } />
                <LabelAndValue label="Daily Earnings" value={  truncateTokenAmountWithComma(dailyEarnings) } />
            </Flex>
        </Box>
    );
}


export default EarnInfoBox;