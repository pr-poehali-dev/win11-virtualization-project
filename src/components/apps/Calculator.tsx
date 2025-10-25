import { useState } from 'react';
import { Button } from '@/components/ui/button';

const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleDecimal = () => {
    if (newNumber) {
      setDisplay('0.');
      setNewNumber(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperation = (op: string) => {
    const current = parseFloat(display);
    
    if (previousValue === null) {
      setPreviousValue(current);
    } else if (operation) {
      const result = calculate(previousValue, current, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    }
    
    setOperation(op);
    setNewNumber(true);
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return a / b;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (operation && previousValue !== null) {
      const current = parseFloat(display);
      const result = calculate(previousValue, current, operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setNewNumber(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
      setNewNumber(true);
    }
  };

  const handlePercent = () => {
    const current = parseFloat(display);
    setDisplay(String(current / 100));
  };

  const handleNegate = () => {
    const current = parseFloat(display);
    setDisplay(String(-current));
  };

  return (
    <div className="h-full bg-background flex flex-col p-4">
      <div className="bg-card rounded-lg border border-border p-6 mb-4">
        <div className="text-right mb-2 text-sm text-muted-foreground h-6">
          {previousValue !== null && operation ? `${previousValue} ${operation}` : ''}
        </div>
        <div className="text-right text-4xl font-semibold mb-1 break-all">
          {display}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 flex-1">
        <Button
          variant="secondary"
          className="h-full text-lg font-medium"
          onClick={handlePercent}
        >
          %
        </Button>
        <Button
          variant="secondary"
          className="h-full text-lg font-medium"
          onClick={handleClear}
        >
          CE
        </Button>
        <Button
          variant="secondary"
          className="h-full text-lg font-medium"
          onClick={handleClear}
        >
          C
        </Button>
        <Button
          variant="secondary"
          className="h-full text-lg font-medium"
          onClick={handleBackspace}
        >
          ⌫
        </Button>

        <Button
          variant="secondary"
          className="h-full text-lg font-medium"
          onClick={() => handleNumber('7')}
        >
          7
        </Button>
        <Button
          variant="secondary"
          className="h-full text-lg font-medium"
          onClick={() => handleNumber('8')}
        >
          8
        </Button>
        <Button
          variant="secondary"
          className="h-full text-lg font-medium"
          onClick={() => handleNumber('9')}
        >
          9
        </Button>
        <Button
          variant="outline"
          className="h-full text-lg font-medium bg-accent/30 hover:bg-accent/50"
          onClick={() => handleOperation('÷')}
        >
          ÷
        </Button>

        <Button
          variant="secondary"
          className="h-full text-lg font-medium"
          onClick={() => handleNumber('4')}
        >
          4
        </Button>
        <Button
          variant="secondary"
          className="h-full text-lg font-medium"
          onClick={() => handleNumber('5')}
        >
          5
        </Button>
        <Button
          variant="secondary"
          className="h-full text-lg font-medium"
          onClick={() => handleNumber('6')}
        >
          6
        </Button>
        <Button
          variant="outline"
          className="h-full text-lg font-medium bg-accent/30 hover:bg-accent/50"
          onClick={() => handleOperation('×')}
        >
          ×
        </Button>

        <Button
          variant="secondary"
          className="h-full text-lg font-medium"
          onClick={() => handleNumber('1')}
        >
          1
        </Button>
        <Button
          variant="secondary"
          className="h-full text-lg font-medium"
          onClick={() => handleNumber('2')}
        >
          2
        </Button>
        <Button
          variant="secondary"
          className="h-full text-lg font-medium"
          onClick={() => handleNumber('3')}
        >
          3
        </Button>
        <Button
          variant="outline"
          className="h-full text-lg font-medium bg-accent/30 hover:bg-accent/50"
          onClick={() => handleOperation('-')}
        >
          −
        </Button>

        <Button
          variant="secondary"
          className="h-full text-lg font-medium"
          onClick={handleNegate}
        >
          +/−
        </Button>
        <Button
          variant="secondary"
          className="h-full text-lg font-medium"
          onClick={() => handleNumber('0')}
        >
          0
        </Button>
        <Button
          variant="secondary"
          className="h-full text-lg font-medium"
          onClick={handleDecimal}
        >
          .
        </Button>
        <Button
          variant="outline"
          className="h-full text-lg font-medium bg-accent/30 hover:bg-accent/50"
          onClick={() => handleOperation('+')}
        >
          +
        </Button>

        <Button
          variant="default"
          className="col-span-4 h-full text-lg font-medium bg-primary hover:bg-primary/90"
          onClick={handleEquals}
        >
          =
        </Button>
      </div>
    </div>
  );
};

export default Calculator;
