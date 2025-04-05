// components/Loader.jsx
const Loader = ({ size = 'medium' }) => {
    const sizes = {
      small: 'w-5 h-5',
      medium: 'w-8 h-8',
      large: 'w-12 h-12'
    };
  
    return (
      <div className={`${sizes[size]} animate-spin rounded-full border-4 border-solid border-current border-r-transparent`}>
        <span className="sr-only">Loading...</span>
      </div>
    );
  };
  
  export default Loader;