import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorkflowTracker } from './WorkflowTracker';

describe('WorkflowTracker', () => {
  it('renders all 6 steps in full mode', () => {
    render(<WorkflowTracker currentStep={1} />);
    expect(screen.getByText('Envio das Informações')).toBeInTheDocument();
    expect(screen.getByText('Aceite da Empresa')).toBeInTheDocument();
    expect(screen.getByText('Documentos Assinados')).toBeInTheDocument();
    expect(screen.getByText('Validação do Documento')).toBeInTheDocument();
    expect(screen.getByText('Plantão Aprovado')).toBeInTheDocument();
    expect(screen.getByText('Envio da NF')).toBeInTheDocument();
  });

  it('renders compact mode without labels', () => {
    render(<WorkflowTracker currentStep={3} compact />);
    expect(screen.queryByText('Envio das Informações')).not.toBeInTheDocument();
  });

  it('renders title in full mode', () => {
    render(<WorkflowTracker currentStep={1} />);
    expect(screen.getByText('Fluxo de Aceite de Vaga')).toBeInTheDocument();
  });
});
