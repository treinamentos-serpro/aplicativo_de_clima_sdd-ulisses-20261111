import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import EmptyState from '../../../../src/components/states/EmptyState';
import ErrorState from '../../../../src/components/states/ErrorState';
import LoadingState from '../../../../src/components/states/LoadingState';

describe('ErrorState', () => {
  it('anuncia a mensagem de erro com role alert', () => {
    render(<ErrorState message="Sem conexão com a internet." onRetry={() => {}} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Sem conexão com a internet.');
  });

  it('chama onRetry ao acionar "Tentar novamente"', async () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);

    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('associa o botão "Tentar novamente" à mensagem de erro', () => {
    render(<ErrorState message="Sem conexão com a internet." onRetry={() => {}} />);

    const message = screen.getByText('Sem conexão com a internet.');
    const button = screen.getByRole('button', { name: 'Tentar novamente' });

    expect(button).toHaveAttribute('aria-describedby', message.id);
  });
});

describe('EmptyState', () => {
  it('não é anunciado por padrão', () => {
    render(<EmptyState />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('anuncia o resultado vazio em região viva educada quando announce é true', () => {
    render(<EmptyState title="Nenhuma cidade encontrada" announce />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent('Nenhuma cidade encontrada');
  });
});

describe('LoadingState', () => {
  it('anuncia o carregamento em região viva educada', () => {
    render(<LoadingState message="Buscando clima…" />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent('Buscando clima…');
  });
});
