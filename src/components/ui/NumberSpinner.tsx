import { Minus, Plus } from 'lucide-react';

interface NumberSpinnerProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  label?: string;
  required?: boolean;
}

export function NumberSpinner({ value, onChange, min = 1, label, required }: NumberSpinnerProps) {
  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  const handleIncrement = () => {
    onChange(value + 1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) {
      onChange(Math.max(min, val));
    }
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-textMain">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <div className="flex items-center w-full h-9 rounded-md border border-border bg-background overflow-hidden focus-within:ring-1 focus-within:ring-accentBlue focus-within:border-accentBlue">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className="h-full px-2 text-textMuted hover:bg-surfaceHover hover:text-textMain disabled:opacity-50 transition-colors"
        >
          <Minus size={16} />
        </button>
        <input
          type="number"
          min={min}
          value={value}
          onChange={handleChange}
          className="flex-1 w-full text-center bg-transparent border-none text-sm text-textMain focus:outline-none focus:ring-0 p-0 m-0 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={handleIncrement}
          className="h-full px-2 text-textMuted hover:bg-surfaceHover hover:text-textMain transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
