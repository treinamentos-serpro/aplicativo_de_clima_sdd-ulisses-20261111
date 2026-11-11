import { useId } from 'react';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export default function ErrorState({
  message = 'Não foi possível carregar os dados. Verifique sua conexão e tente novamente.',
  onRetry,
}: ErrorStateProps) {
  const messageId = useId();

  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-4 rounded-3xl border border-red-400/40 bg-red-500/10 p-8 text-center backdrop-blur-md"
    >
      <p id={messageId} className="text-white/90">
        {message}
      </p>
      <button
        type="button"
        aria-describedby={messageId}
        onClick={onRetry}
        className="min-h-11 rounded-xl bg-accent-600 px-5 font-medium text-white hover:bg-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900"
      >
        Tentar novamente
      </button>
    </div>
  );
}
