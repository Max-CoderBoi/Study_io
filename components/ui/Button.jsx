// components/ui/Button.jsx
export default function Button({ children, onClick, disabled, variant = "primary", className = "" }) {
  const baseStyles = "px-8 py-4 rounded-2xl font-bold transition-all duration-300";
  
  const variants = {
    primary: `bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:shadow-2xl hover:scale-110 shadow-xl transform ${
      disabled ? "opacity-50 cursor-not-allowed" : ""
    }`,
    secondary: "text-gray-300 hover:text-red-400 px-4 py-2 rounded-xl hover:bg-red-500/10 border border-white/10"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}