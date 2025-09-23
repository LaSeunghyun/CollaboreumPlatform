interface SettingsPlaceholderProps {
  message: string;
}

export const SettingsPlaceholder = ({ message }: SettingsPlaceholderProps) => {
  return (
    <div className='py-12 text-center'>
      <p className='text-gray-500'>{message}</p>
    </div>
  );
};
