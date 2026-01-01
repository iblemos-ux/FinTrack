
import React, { useMemo } from 'react';
import {
    BarChart3,
    Download,
    TrendingUp,
    Wallet,
    ArrowUpRight
} from 'lucide-react';
import { Expense } from '../types';

interface ReportsProps {
    expenses: Expense[];
}

const Reports: React.FC<ReportsProps> = ({ expenses }) => {
    const stats = useMemo(() => {
        const activeExpenses = expenses.filter(e => !e.deleted);
        const totalExpenses = activeExpenses.length;
        const totalValue = activeExpenses.reduce((acc, curr) => acc + curr.valorTotal, 0);
        const averageValue = totalExpenses > 0 ? totalValue / totalExpenses : 0;

        // Dynamic Payer Stats
        const payerMap = new Map<string, number>();
        activeExpenses.forEach(e => {
            const name = e.responsavel || 'Desconhecido';
            // Normalize Name for aggregation if needed, but display as is? 
            // Let's use the exact string to respect user input casing, or Capitalize first letter?
            // Simple approach: Use as is.
            const current = payerMap.get(name) || 0;
            payerMap.set(name, current + e.valorTotal);
        });

        const payerStats = Array.from(payerMap.entries())
            .map(([name, value]) => ({
                name,
                value,
                percent: totalValue > 0 ? (value / totalValue) * 100 : 0
            }))
            .sort((a, b) => b.value - a.value); // Sort by highest payer

        const largestExpense = [...activeExpenses].sort((a, b) => b.valorTotal - a.valorTotal)[0];
        const topExpenses = [...activeExpenses]
            .sort((a, b) => b.valorTotal - a.valorTotal)
            .slice(0, 5);

        return {
            totalValue,
            averageValue,
            payerStats,
            largestExpense,
            topExpenses
        };
    }, [expenses]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const handleExportCSV = () => {
        const headers = ['Data', 'Estabelecimento', 'Produto', 'Valor Total', 'Parcelas', 'Responsável', 'Tipo Pagamento'];
        const csvContent = [
            headers.join(','),
            ...expenses.map(e => [
                e.data,
                `"${e.estabelecimento}"`,
                `"${e.produto}"`,
                e.valorTotal.toFixed(2),
                `"${e.parcelasPagas}/${e.parcelaTotal}"`,
                e.responsavel,
                e.tipoPagamento
            ].join(','))
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'relatorio_despesas.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Color palette for dynamic bars
    const colors = [
        { bg: 'bg-blue-100', text: 'text-blue-600', bar: 'bg-blue-600', container: 'bg-blue-50' },
        { bg: 'bg-purple-100', text: 'text-purple-600', bar: 'bg-purple-500', container: 'bg-purple-50' },
        { bg: 'bg-green-100', text: 'text-green-600', bar: 'bg-green-500', container: 'bg-green-50' },
        { bg: 'bg-orange-100', text: 'text-orange-600', bar: 'bg-orange-500', container: 'bg-orange-50' },
        { bg: 'bg-pink-100', text: 'text-pink-600', bar: 'bg-pink-500', container: 'bg-pink-50' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-[#111318] tracking-tight text-[32px] font-extrabold leading-tight">Relatórios</h1>
                    <p className="text-[#64748b] text-sm mt-1">Análise detalhada do seu histórico financeiro</p>
                </div>
                <button
                    onClick={handleExportCSV}
                    className="h-11 px-5 bg-white border border-[#dbdee6] hover:bg-gray-50 text-[#111318] text-sm font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
                >
                    <Download size={18} />
                    Exportar CSV
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-[#f0f1f4] shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Wallet size={20} />
                        </div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Acumulado</h3>
                    </div>
                    <p className="text-3xl font-black text-[#111318]">{formatCurrency(stats.totalValue)}</p>
                    <p className="text-xs text-gray-400 font-medium mt-1">Soma de todas as despesas lançadas</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-[#f0f1f4] shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <TrendingUp size={20} />
                        </div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Média por Compra</h3>
                    </div>
                    <p className="text-3xl font-black text-[#111318]">{formatCurrency(stats.averageValue)}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-[#f0f1f4] shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                            <ArrowUpRight size={20} />
                        </div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Maior Compra</h3>
                    </div>
                    <p className="text-3xl font-black text-[#111318]">{stats.largestExpense ? formatCurrency(stats.largestExpense.valorTotal) : 'R$ 0,00'}</p>
                    <p className="text-xs text-gray-400 font-medium mt-1 truncate">{stats.largestExpense?.estabelecimento || '-'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Payer Split */}
                <div className="bg-white p-8 rounded-2xl border border-[#f0f1f4] shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-black text-[#111318]">Divisão por Pagador</h3>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Geral</span>
                    </div>

                    <div className="space-y-6">
                        {stats.payerStats.map((payer, idx) => {
                            const color = colors[idx % colors.length];
                            return (
                                <div key={payer.name} className="relative pt-2">
                                    <div className="flex mb-2 items-center justify-between">
                                        <div>
                                            <span className={`text-xs font-bold inline-block py-1 px-2 uppercase rounded-full ${color.text} ${color.bg} uppercase last:mr-0 mr-1`}>
                                                {payer.name}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs font-bold inline-block ${color.text}`}>
                                                {payer.percent.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`overflow-hidden h-3 mb-4 text-xs flex rounded-full ${color.container}`}>
                                        <div style={{ width: `${payer.percent}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${color.bar} transition-all duration-500`}></div>
                                    </div>
                                    <p className="text-right text-sm font-black text-[#111318]">{formatCurrency(payer.value)}</p>
                                </div>
                            );
                        })}
                        {stats.payerStats.length === 0 && (
                            <p className="text-center text-gray-400 text-sm">Nenhum dado disponível.</p>
                        )}
                    </div>
                </div>

                {/* Top 5 Expenses */}
                <div className="bg-white p-6 rounded-2xl border border-[#f0f1f4] shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black text-[#111318]">Top 5 Maiores Despesas</h3>
                        <BarChart3 className="text-gray-300" size={20} />
                    </div>

                    <div className="space-y-4">
                        {stats.topExpenses.map((exp, idx) => (
                            <div key={exp.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center justify-center size-8 rounded-full bg-gray-100 text-xs font-black text-gray-500">{idx + 1}</span>
                                    <div>
                                        <p className="text-sm font-bold text-[#111318]">{exp.estabelecimento}</p>
                                        <p className="text-[11px] text-gray-500 font-medium">{exp.produto || 'Sem descrição'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-[#111318]">{formatCurrency(exp.valorTotal)}</p>
                                    <p className="text-[10px] text-gray-400 font-bold">{new Date(exp.data + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                                </div>
                            </div>
                        ))}
                        {stats.topExpenses.length === 0 && (
                            <p className="text-center text-gray-400 py-8 text-sm italic">Nenhuma despesa registrada.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
