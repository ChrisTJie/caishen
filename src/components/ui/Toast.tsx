interface ToastProps {
  message: string;
}

export function Toast({ message }: ToastProps) {
  return (
    <p className="animate-fade-in mt-2 text-center text-sm font-bold text-yellow-200" role="status">
      {message}
    </p>
  );
}
