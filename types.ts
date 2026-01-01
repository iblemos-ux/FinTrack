
export type PayerType = 'italo' | 'edna';
export type SplitType = 'dividido' | 'italo_full' | 'edna_full';

export interface Expense {
  id: string;
  data: string;
  estabelecimento: string;
  produto: string;
  parcelaTotal: number;
  parcelasPagas: number;
  valorTotal: number;
  responsavel: string;
  tipoPagamento: SplitType;
  categoria?: string;
  deleted?: boolean;
}

export interface ExpenseFormState {
  data: string;
  estabelecimento: string;
  produto: string;
  parcelaTotal: string;
  parcelasPagas: string;
  valorTotal: string;
  responsavel: string;
  tipoPagamento: SplitType;
}

export interface DashboardStats {
  totalComprado: number;
  faturaAtual: number;
  parteItalo: number;
  parteEdna: number;
  percentualItalo: number;
  percentualEdna: number;
}
