
import React from 'react';
import { Info } from 'lucide-react';
import { ExpenseFormState } from '../types';
import Avatar from './Avatar';

interface ExpenseSummaryProps {
    form: ExpenseFormState;
    installmentValue: number;
    totalValueNum: number;
}

const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({ form, installmentValue, totalValueNum }) => {
    return (
        <aside className="lg:col-span-4 sticky top-28 space-y-6">
            <div className="bg-primary rounded-3xl p-8 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-black/10 rounded-full blur-3xl"></div>

                <h3 className="text-white/80 text-xs font-bold uppercase tracking-widest mb-8 relative z-10">Resumo da Parcela</h3>

                <div className="space-y-8 relative z-10">
                    <div className="flex flex-col gap-1">
                        <span className="text-white/70 text-sm font-medium">Valor Mensal ({form.parcelaTotal}x)</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black tracking-tighter">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(installmentValue)}
                            </span>
                        </div>
                        <span className="text-xs text-white/50 font-bold mt-1 uppercase">Total da compra: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValueNum)}</span>
                    </div>

                    <div className="h-px bg-white/15 w-full"></div>

                    <div className="space-y-5">
                        {/* Italo Split */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="size-10">
                                    <Avatar user="italo" size="100%" className="border-2 border-white/30" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-extrabold leading-none">Italo</span>
                                    <span className="text-[10px] text-white/60 font-bold uppercase mt-1">
                                        {form.responsavel === 'italo' ? 'Pagante' : 'Participante'}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block font-black text-lg">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(form.tipoPagamento === 'dividido' ? installmentValue / 2 : (form.tipoPagamento === 'italo_full' ? installmentValue : 0))}
                                </span>
                                <span className="text-[10px] text-white/60 font-bold">{form.tipoPagamento === 'dividido' ? '50%' : (form.tipoPagamento === 'italo_full' ? '100%' : '0%')}</span>
                            </div>
                        </div>

                        {/* Edna Split */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="size-10">
                                    <Avatar user="edna" size="100%" className="border-2 border-white/30" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-extrabold leading-none">Edna</span>
                                    <span className="text-[10px] text-white/60 font-bold uppercase mt-1">
                                        {form.responsavel === 'edna' ? 'Pagante' : 'Participante'}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block font-black text-lg">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(form.tipoPagamento === 'dividido' ? installmentValue / 2 : (form.tipoPagamento === 'edna_full' ? installmentValue : 0))}
                                </span>
                                <span className="text-[10px] text-white/60 font-bold">{form.tipoPagamento === 'dividido' ? '50%' : (form.tipoPagamento === 'edna_full' ? '100%' : '0%')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#f0f1f4] shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-50 text-primary rounded-lg">
                        <Info size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-[#111318] mb-2 uppercase tracking-wide">Dica Rápida</p>
                        <p className="text-sm text-[#616b89] font-medium leading-relaxed">
                            Lançamentos parcelados são distribuídos automaticamente nos meses futuros. Você pode gerenciar parcelas individuais visualizando os filtros no Dashboard.
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default ExpenseSummary;
