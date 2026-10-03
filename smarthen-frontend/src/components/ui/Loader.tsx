interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-3',
  lg: 'h-12 w-12 border-4',
};

export const Loader = ({ size = 'md', className = '' }: LoaderProps) => {
  return (
    <div
      className={`${sizeMap[size]} animate-spin rounded-full border-primary-500 border-t-transparent ${className}`}
    />
  );
};
