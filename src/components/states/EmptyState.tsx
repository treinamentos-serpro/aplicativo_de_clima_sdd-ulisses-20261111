interface EmptyStateProps {
  title?: string;
  hint?: string;
  /** Anuncia o estado para leitores de tela (ex.: busca sem resultados). */
  announce?: boolean;
}

export default function EmptyState({
  title = 'Busque uma cidade',
  hint = 'Digite o nome de uma cidade no campo de busca para ver o clima atual e a previsão.',
  announce = false,
}: EmptyStateProps) {
  return (
    <div
      role={announce ? 'status' : undefined}
      aria-live={announce ? 'polite' : undefined}
      className="flex flex-col items-center gap-2 rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md"
    >
      <h2 className="text-lg font-medium text-white">{title}</h2>
      <p className="max-w-md text-white/70">{hint}</p>
    </div>
  );
}
