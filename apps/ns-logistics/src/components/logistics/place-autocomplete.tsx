"use client";

type PlaceAutocompleteProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
};

/** Free-text place field with datalist suggestions (type anything). */
export function PlaceAutocomplete({
  id,
  label,
  value,
  onChange,
  suggestions,
  placeholder,
}: PlaceAutocompleteProps) {
  const listId = `${id}-list`;

  return (
    <label className="block text-sm" htmlFor={id}>
      <span className="mb-1 block font-medium text-[var(--ns-ink)]">{label}</span>
      <input
        id={id}
        list={listId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="field-input"
      />
      <datalist id={listId}>
        {suggestions.map((place) => (
          <option key={place} value={place} />
        ))}
      </datalist>
    </label>
  );
}
