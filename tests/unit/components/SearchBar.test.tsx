import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchBar from '../../../src/components/SearchBar';

describe('SearchBar', () => {
  it('dispara onSearch com o termo ao enviar', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByLabelText('Buscar cidade'), '  Curitiba ');
    await user.keyboard('{Enter}');

    expect(onSearch).toHaveBeenCalledWith('Curitiba');
  });

  it('não dispara onSearch com campo vazio ou só espaços', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByLabelText('Buscar cidade'), '   ');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('expõe o formulário como busca', () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(screen.getByRole('search')).toBeInTheDocument();
  });

  it('mantém o campo habilitado durante o carregamento e desabilita só o botão', () => {
    render(<SearchBar onSearch={vi.fn()} disabled />);

    expect(screen.getByLabelText('Buscar cidade')).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
  });

  it('não dispara onSearch enquanto estiver desabilitado', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} disabled />);

    await user.type(screen.getByLabelText('Buscar cidade'), 'Curitiba{Enter}');

    expect(onSearch).not.toHaveBeenCalled();
  });
});
