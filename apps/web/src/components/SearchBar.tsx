import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className,
}: SearchBarProps) {
  return (
    <div className={className}>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <i className="bi bi-search"></i>
        </InputLeftElement>

        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </InputGroup>
    </div>
  );
}

export default SearchBar;
