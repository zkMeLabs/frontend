import {
  Link,
  chakra,
  PopoverTrigger,
  Portal,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  useColorModeValue,
  DarkMode,
  ListItem,
  OrderedList,
  Box,
} from '@chakra-ui/react';
import React from 'react';

import type { FormFields } from '../types';
import type { SmartContractVerificationMethod, SmartContractVerificationConfig } from 'types/client/contract';

import useIsMobile from 'lib/hooks/useIsMobile';
import Popover from 'ui/shared/chakra/Popover';
import FormFieldFancySelect from 'ui/shared/forms/fields/FormFieldFancySelect';
import IconSvg from 'ui/shared/IconSvg';

import { METHOD_LABELS } from '../utils';

interface Props {
  methods: SmartContractVerificationConfig['verification_options'];
}

const ContractVerificationFieldMethod = ({ methods }: Props) => {
  const tooltipBg = useColorModeValue('gray.700', 'gray.900');
  const isMobile = useIsMobile();

  const options = React.useMemo(() => methods.map((method) => ({
    value: method,
    label: METHOD_LABELS[method],
  })), [ methods ]);

  const renderPopoverListItem = React.useCallback((method: SmartContractVerificationMethod) => {
    switch (method) {
      case 'flattened-code':
        return <ListItem key={ method }>Verification through a single file.</ListItem>;
      case 'multi-part':
        return <ListItem key={ method }>Verification of multi-part Solidity files.</ListItem>;
      case 'sourcify':
        return <ListItem key={ method }>Verification through <Link href="https://sourcify.dev/" target="_blank">Sourcify</Link>.</ListItem>;
      case 'standard-input':
        return (
          <ListItem key={ method }>
            <span>Verification using </span>
            <Link
              href="https://docs.soliditylang.org/en/latest/using-the-compiler.html#input-description"
              target="_blank"
            >
              Standard input JSON
            </Link>
            <span> file.</span>
          </ListItem>
        );
      case 'vyper-code':
        return <ListItem key={ method }>Verification of Vyper contract.</ListItem>;
      case 'vyper-multi-part':
        return <ListItem key={ method }>Verification of multi-part Vyper files.</ListItem>;
      case 'vyper-standard-input':
        return (
          <ListItem key={ method }>
            <span>Verification of Vyper contract using </span>
            <Link
              href="https://docs.vyperlang.org/en/stable/compiling-a-contract.html#compiler-input-and-output-json-description"
              target="_blank"
            >
              Standard input JSON
            </Link>
            <span> file.</span>
          </ListItem>
        );
      case 'solidity-hardhat':
        return <ListItem key={ method }>Verification through Hardhat plugin.</ListItem>;
      case 'solidity-foundry':
        return <ListItem key={ method }>Verification through Foundry.</ListItem>;
      case 'stylus-github-repository':
        return <ListItem key={ method }>Verification of Stylus contract via GitHub repository.</ListItem>;
    }
  }, []);

  return (
    <>
      <Box mt={{ base: 10, lg: 6 }} gridColumn={{ lg: '1 / 3' }}>
        <chakra.span fontWeight={ 500 } fontSize="lg" fontFamily="heading">
          Currently, Moca Chain supports { methods.length } contract verification methods
        </chakra.span>
        <Popover trigger="hover" isLazy placement={ isMobile ? 'bottom-end' : 'right-start' } offset={ [ -8, 8 ] }>
          <PopoverTrigger>
            <chakra.span display="inline-block" ml={ 1 } cursor="pointer" verticalAlign="middle" h="22px">
              <IconSvg name="info" boxSize={ 5 } color="icon_info" _hover={{ color: 'link_hovered' }}/>
            </chakra.span>
          </PopoverTrigger>
          <Portal>
            <PopoverContent bgColor={ tooltipBg } w={{ base: '300px', lg: '380px' }}>
              <PopoverArrow bgColor={ tooltipBg }/>
              <PopoverBody color="white">
                <DarkMode>
                  <span>Currently, Moca Chain supports { methods.length } methods:</span>
                  <OrderedList>
                    { methods.map(renderPopoverListItem) }
                  </OrderedList>
                </DarkMode>
              </PopoverBody>
            </PopoverContent>
          </Portal>
        </Popover>
      </Box>
      <FormFieldFancySelect<FormFields, 'method'>
        name="method"
        placeholder="Verification method (compiler type)"
        options={ options }
        isRequired
        isAsync={ false }
        isReadOnly={ options.length === 1 }
      />
    </>
  );
};

export default React.memo(ContractVerificationFieldMethod);
