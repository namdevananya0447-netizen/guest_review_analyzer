/**
 * Input Component
 *
 * @param {Object} props
 * @param {string} props.label - Label text shown above the input
 * @param {string} props.placeholder - Placeholder text
 * @param {'text' | 'email' | 'password' | 'number'} props.type - Input type
 * @param {string} props.value - Controlled value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.error - Error message shown below input (optional)
 */
export default function Input({
  label,
  placeholder = '',
  type = 'text',
  value,
  onChange,
  error,
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider text-eco-muted">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 rounded-xl text-sm font-sans text-eco-dark bg-eco-bg/30 border transition-all focus:outline-none focus:ring-2 focus:ring-eco-primary/20 focus:border-eco-primary placeholder-eco-muted/60
          ${error ? 'border-red-400 focus:ring-red-300/20' : 'border-eco-border'}`}
      />
      {error && (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}
