import * as React from 'react';

interface ICounterProps extends React.Props<any> {
  counter: number;
  increment: () => void;
  decrement: () => void;
};

export default function Counter({
  counter,
  increment,
  decrement
}: ICounterProps) {
  return (
    <div className="flex">
      <input type="button" value="-" />

      <div>
        {counter}
      </div>
    </div>
  );
}
