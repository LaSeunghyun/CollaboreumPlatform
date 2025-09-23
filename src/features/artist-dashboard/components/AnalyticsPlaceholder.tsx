interface AnalyticsPlaceholderProps {
  message: string;
}

export const AnalyticsPlaceholder = ({
  message,
}: AnalyticsPlaceholderProps) => {
  return (
    <div className='py-12 text-center'>
      <p className='text-gray-500'>{message}</p>
    </div>
  );
};
