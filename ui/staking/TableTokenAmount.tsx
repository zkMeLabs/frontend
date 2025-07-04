/* eslint-disable */
import Decimal from 'decimal.js';


const formatTokenAmountTruncated = (
  num: number | string | null | undefined,
  decimalPlaces: number = 2
): string => {
  if (num === null || num === undefined || num === '') return '-';

  const _num = typeof num === 'number' ? num : Number(num);
  if (isNaN(_num)) return '-';

  if (_num === 0) return '0';


    const factor = new Decimal(10).pow(decimalPlaces);
    const sum = new Decimal(num).mul(factor).toNumber(); 
    const truncated = new Decimal( Math.trunc(sum) ).div(factor).toNumber();
  // 小于最小可展示值时（例如 0.01）
  if (truncated === 0 && _num > 0 && _num < 1 / factor.toNumber()) {
    return `<${(1 / factor.toNumber()).toFixed(decimalPlaces)}`;
  }

  const [intPart, decPart = ''] = truncated.toString().split('.');

  // 整数部分加千分位逗号
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // 截取指定小数位数，去除末尾 0
  const cleanedDec = decPart.slice(0, decimalPlaces).replace(/0+$/, '');

  return cleanedDec ? `${formattedInt}.${cleanedDec}` : formattedInt;
};


const TableTokenAmount = ({ 
    amount,
    symbol = 'MOCA',
    decimals = 2
}: { amount: number | string ; symbol: string ,  decimals?: number }) => {

    return (
    <span 
        style={{ 
            color: '#A80C53',
            fontFamily: "HarmonyOS Sans",
            fontSize: '12px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: 'normal',
            width: '100%',
                
            textAlign: 'center',
        }}
    >
        <span>{ formatTokenAmountTruncated(amount || 0, decimals) }</span>
        <span style={{ color: '#000', marginLeft: '4px' }}>{ symbol }</span>
    </span>
    );
}

export default TableTokenAmount;