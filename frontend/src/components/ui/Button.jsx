/**
 * Button Component
 *
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'outline'} props.variant - Visual style
 * @param {'sm' | 'md' | 'lg'} props.size - Button size
 * @param {boolean} props.disabled - Disables the button
 * @param {Function} props.onClick - Click handler
 * @param {React.ReactNode} props.children - Button label / content
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children,
}) {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-[14px] transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variants = {
    primary: 'bg-eco-primary text-white hover:bg-eco-primary-hover shadow-xs',
    secondary: 'bg-eco-secondary text-eco-dark hover:bg-eco-secondary/80',
    outline:
      'border border-eco-primary text-eco-primary bg-transparent hover:bg-eco-primary/5',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </button>
  );
}
