

interface TextMoneyProps {
  money: number;
  currency?: string;
}

const TextMoney = ({money, currency = 'PEN'}: TextMoneyProps) => {
  return (
    <>
      {(money / 100).toFixed(2)} {currency}
    </>
  );
};

export default TextMoney;
