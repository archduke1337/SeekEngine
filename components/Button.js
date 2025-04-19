// components/Button.js
const Button = ({ children, onClick, disabled, isLoading }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`btn text-white px-6 py-2 rounded-md transition disabled:opacity-50 
                  ${isLoading ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'}`}
    >
      {isLoading ? 'Processing...' : children}
    </button>
  );
};

export default Button;
