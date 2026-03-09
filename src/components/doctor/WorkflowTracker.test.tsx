import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { WorkflowTracker } from './WorkflowTracker';

describe('WorkflowTracker', () => {
  it('renders all 6 steps in full mode', () => {
    const { getByText } = render(<WorkflowTracker currentStep={1} />);
    expect(getByText('Envio das Informações')).toBeInTheDocument();
    expect(getByText('Aceite da Empresa')).toBeInTheDocument();
    expect(getByText('Documentos Assinados')).toBeInTheDocument();
    expect(getByText('Validação do Documento')).toBeInTheDocument();
    expect(getByText('Plantão Aprovado')).toBeInTheDocument();
    expect(getByText('Envio da NF')).toBeInTheDocument();
  });

  it('renders compact mode without labels', () => {
    const { queryByText } = render(<WorkflowTracker currentStep={3} compact />);
    expect(queryByText('Envio das Informações')).not.toBeInTheDocument();
  });

  it('renders title in full mode', () => {
    const { getByText } = render(<WorkflowTracker currentStep={1} />);
    expect(getByText('Fluxo de Aceite de Vaga')).toBeInTheDocument();
  });
});
