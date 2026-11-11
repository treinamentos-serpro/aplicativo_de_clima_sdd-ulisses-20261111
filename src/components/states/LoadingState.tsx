interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Carregando previsão…' }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md"
    >
      <span
        aria-hidden="true"
        className="h-8 w-8 animate-spin motion-reduce:animate-none rounded-full border-4 border-white/20 border-t-accent-400"
      />
      <p className="text-white/90">{message}</p>
    </div>
  );
}
