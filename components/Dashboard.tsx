
import React, { useMemo, useState } from 'react';
import {
  ShoppingCart,
  CreditCard,
  TrendingUp,
  Calendar,
  Plus,
  Search,
  Filter,
  Download,
  Edit2,
  Trash2,
  User,
  X,
  FileText
} from 'lucide-react';
import { Expense, DashboardStats, PayerType, SplitType } from '../types';
import StatCard from './StatCard';
import Avatar from './Avatar';

interface DashboardProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  onNew: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  expenses,
  onEdit,
  onDelete,
  selectedMonth,
  setSelectedMonth,
  onNew
}) => {
  const [filters, setFilters] = useState({
    estabelecimento: '',
    responsavel: '',
    tipoPagamento: '' as SplitType | ''
  });

  const [showFilters, setShowFilters] = useState(false);

  const stats = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);

    let totalComprado = 0;
    let faturaAtual = 0;
    let parteItalo = 0;
    let parteEdna = 0;
    let futureCommitments = 0;
    let biggestExpense: Expense | null = null;
    const establishmentMap = new Map<string, number>();

    expenses.forEach(exp => {
      if (exp.deleted) return;

      // Fix timezone issue by local splitting
      const [eYear, eMonth] = exp.data.split('-').map(Number);
      const expYear = eYear;
      const expMonth = eMonth;

      // Stats for the SELECTED month (Purchased in this month)
      if (expYear === year && expMonth === month) {
        totalComprado += exp.valorTotal;
        if (!biggestExpense || exp.valorTotal > (biggestExpense as Expense).valorTotal) {
          biggestExpense = exp;
        }
      }

      // Stats for the active BILL (Installments active in this month)
      const monthsSinceStart = (year - expYear) * 12 + (month - expMonth);
      if (monthsSinceStart >= 0 && monthsSinceStart < exp.parcelaTotal) {
        const valuePerInstallment = exp.valorTotal / exp.parcelaTotal;
        faturaAtual += valuePerInstallment;

        if (exp.tipoPagamento === 'dividido') {
          parteItalo += valuePerInstallment / 2;
          parteEdna += valuePerInstallment / 2;
        } else if (exp.tipoPagamento === 'italo_full') {
          parteItalo += valuePerInstallment;
        } else if (exp.tipoPagamento === 'edna_full') {
          parteEdna += valuePerInstallment;
        }

        // Add to establishment map
        const currentEstabVal = establishmentMap.get(exp.estabelecimento) || 0;
        establishmentMap.set(exp.estabelecimento, currentEstabVal + valuePerInstallment);
      }

      // Future Commitments (Remaining installments after this month)
      const remainingInstallments = exp.parcelaTotal - (monthsSinceStart + 1);
      if (remainingInstallments > 0) {
        const val = (exp.valorTotal / exp.parcelaTotal) * remainingInstallments;
        futureCommitments += val;
      }
    });

    const totalFatura = parteItalo + parteEdna || 1;

    // Process Top Establishments
    const topEstablishments = Array.from(establishmentMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      totalComprado,
      faturaAtual,
      parteItalo,
      parteEdna,
      percentualItalo: Math.round((parteItalo / totalFatura) * 100),
      percentualEdna: Math.round((parteEdna / totalFatura) * 100),
      futureCommitments,
      biggestExpense,
      topEstablishments
    };
  }, [expenses, selectedMonth]);

  const monthName = useMemo(() => {
    const d = new Date(`${selectedMonth}-02`);
    return d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  }, [selectedMonth]);

  const [searchTerm, setSearchTerm] = useState('');

  // Logic to show all installments active in the selected month
  const tableData = useMemo(() => {
    if (!selectedMonth) return [];

    const parts = selectedMonth.split('-').map(Number);
    if (parts.length !== 2) return [];

    const [year, month] = parts;

    return expenses.flatMap(exp => {
      // Guard against missing or invalid data
      if (!exp.data || typeof exp.data !== 'string' || exp.deleted) return [];

      const dateParts = exp.data.split('-').map(Number);
      if (dateParts.length < 2) return [];

      const [eYear, eMonth] = dateParts;

      // Calculate month difference: (TargetYear - ExpenseYear)*12 + (TargetMonth - ExpenseMonth)
      // This gives the index of the month relative to the start date (0 = first month)
      const monthsSinceStart = (year - eYear) * 12 + (month - eMonth);

      // Verify the installment is valid (0 to total-1)
      if (monthsSinceStart >= 0 && monthsSinceStart < exp.parcelaTotal) {
        return [{
          ...exp,
          currentInstallment: monthsSinceStart + 1,
          monthlyValue: exp.valorTotal / (exp.parcelaTotal || 1)
        }];
      }
      return [];
    })
      .filter(item => {
        // Safe access helper
        const safeStr = (str: any) => (str || '').toString().toLowerCase();

        // Calculate derived fields for search
        const itemMonth = new Date(item.data).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');

        const matchesEstab = safeStr(item.estabelecimento).includes(safeStr(filters.estabelecimento));
        const matchesResp = filters.responsavel ? safeStr(item.responsavel) === safeStr(filters.responsavel) : true;
        const matchesType = filters.tipoPagamento ? item.tipoPagamento === filters.tipoPagamento : true;

        const matchesSearch = searchTerm
          ? (safeStr(item.estabelecimento).includes(safeStr(searchTerm)) ||
            safeStr(item.produto).includes(safeStr(searchTerm)) ||
            safeStr(item.responsavel).includes(safeStr(searchTerm)) ||
            safeStr(itemMonth).includes(safeStr(searchTerm)))
          : true;

        return matchesEstab && matchesResp && matchesType && matchesSearch;
      })
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()); // Sort by date ascending
  }, [expenses, selectedMonth, filters, searchTerm]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const clearFilters = () => {
    setFilters({ estabelecimento: '', responsavel: '', tipoPagamento: '' });
  };

  const handleExport = () => {
    const headers = ['Data', 'Mês', 'Comprador', 'Estabelecimento', 'Produto', 'Parc. Pagas', 'Parc. Totais', 'Vlr Total', 'Vlr Parcela', 'Italo', 'Edna'];
    const csvContent = [
      headers.join(','),
      ...tableData.map(item => {
        const itemMonth = new Date(item.data).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
        const isDividido = item.tipoPagamento === 'dividido';
        const isItalo = item.tipoPagamento === 'italo_full';
        const isEdna = item.tipoPagamento === 'edna_full';
        const italoValue = isDividido ? item.monthlyValue / 2 : (isItalo ? item.monthlyValue : 0);
        const ednaValue = isDividido ? item.monthlyValue / 2 : (isEdna ? item.monthlyValue : 0);

        return [
          item.data,
          itemMonth,
          item.responsavel,
          `"${item.estabelecimento}"`,
          `"${item.produto}"`,
          item.currentInstallment,
          item.parcelaTotal,
          item.valorTotal.toFixed(2),
          item.monthlyValue.toFixed(2),
          italoValue.toFixed(2),
          ednaValue.toFixed(2)
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'detalhamento_despesas.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 font-sans text-slate-800">
      {/* Header & Main Filters - New Layout */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-[#111318] tracking-tight text-[32px] font-extrabold leading-tight">Dashboard Financeiro</h1>
          <p className="text-[#64748b] text-sm mt-1">Visão geral das finanças de Italo e Edna</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <div className="relative group">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-10 px-4 rounded-xl bg-gray-50 border-transparent hover:bg-gray-100 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-all outline-none"
            />
          </div>
          <div className="h-6 w-px bg-gray-200"></div>

          <select
            value={filters.responsavel}
            onChange={(e) => setFilters({ ...filters, responsavel: e.target.value as any })}
            className="h-10 px-3 rounded-xl bg-gray-50 border-transparent hover:bg-gray-100 text-sm font-medium text-gray-600 focus:outline-none cursor-pointer"
          >
            <option value="">Responsável: Todos</option>
            {Array.from(new Set(expenses.filter(e => !e.deleted).map(e => e.responsavel))).map(resp => (
              <option key={resp} value={resp}>{resp}</option>
            ))}
          </select>

          <select
            value={filters.estabelecimento}
            onChange={(e) => setFilters({ ...filters, estabelecimento: e.target.value })}
            className="h-10 px-3 rounded-xl bg-gray-50 border-transparent hover:bg-gray-100 text-sm font-medium text-gray-600 focus:outline-none cursor-pointer max-w-[150px]"
          >
            <option value="">Local: Todos</option>
            {Array.from(new Set(expenses.filter(e => !e.deleted).map(e => e.estabelecimento))).map(est => (
              <option key={est} value={est}>{est}</option>
            ))}
          </select>

          <button onClick={onNew} className="h-10 px-4 bg-primary hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all flex items-center gap-2 ml-2">
            <Plus size={16} />
            Nova Despesa
          </button>
        </div>
      </div>



      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ShoppingCart}
          iconBgClass="bg-blue-50"
          iconColorClass="text-primary"
          title="TOTAL COMPRADO"
          value={formatCurrency(stats.totalComprado)}
          subtitle={stats.totalComprado > 0 ? "+12% vs mês anterior" : "Sem dados anteriores"} // Placeholder logic
        />
        <StatCard
          icon={CreditCard}
          iconBgClass="bg-orange-50"
          iconColorClass="text-orange-600"
          title="FATURA ATUAL"
          value={formatCurrency(stats.faturaAtual)}
          subtitle={`Vence em 10 de ${monthName.split(' ')[0]}`}
        />
        <StatCard
          icon={User}
          iconBgClass=""
          iconColorClass=""
          title="PARTE ITALO"
          value={formatCurrency(stats.parteItalo)}
          user="italo"
          subtitle={`${stats.percentualItalo}% do total`}
        />
        <StatCard
          icon={User}
          iconBgClass=""
          iconColorClass=""
          title="PARTE EDNA"
          value={formatCurrency(stats.parteEdna)}
          user="edna"
          subtitle={`${stats.percentualEdna}% do total`}
        />
      </div>

      {/* Middle Section: Split, Future, Biggest Expense */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Divisão de Gastos */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#f0f1f4]">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="text-lg font-bold text-[#111318]">Divisão de Gastos</h3>
              <p className="text-xs text-gray-500 font-medium">Proporção do mês atual</p>
            </div>
            <div className="flex gap-2 text-xl font-black">
              <span className="text-primary">{stats.percentualItalo}%</span>
              <span className="text-gray-300">/</span>
              <span className="text-purple-400">{stats.percentualEdna}%</span>
            </div>
          </div>

          <div className="h-4 flex rounded-full overflow-hidden bg-gray-100 mb-4">
            <div style={{ width: `${stats.percentualItalo}%` }} className="bg-primary transition-all duration-1000"></div>
            <div style={{ width: `${stats.percentualEdna}%` }} className="bg-purple-200 transition-all duration-1000"></div>
          </div>

          <div className="flex justify-between text-sm font-bold">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-primary"></div>
              <span>Italo</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Edna</span>
              <div className="size-2 rounded-full bg-purple-200"></div>
            </div>
          </div>
        </div>

        {/* Compromisso Futuro */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#f0f1f4] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Calendar size={100} />
          </div>
          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-lg mb-4">Próx. Meses</span>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Compromisso Futuro</p>
          <h3 className="text-3xl font-black text-[#111318] mb-1">{formatCurrency(stats.futureCommitments)}</h3>
          <p className="text-xs text-gray-400 font-medium">Parcelas já agendadas</p>
        </div>

        {/* Maior Despesa */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#f0f1f4] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10 text-red-500">
            <TrendingUp size={100} />
          </div>
          <span className="inline-block px-3 py-1 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider rounded-lg mb-4">Top 1</span>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Maior Despesa ({monthName.split(' ')[0]})</p>
          <h3 className="text-2xl font-black text-[#111318] mb-1 truncate" title={stats.biggestExpense?.estabelecimento}>
            {stats.biggestExpense?.estabelecimento || 'Nenhuma'}
          </h3>
          <p className="text-xs text-gray-400 font-medium">
            {stats.biggestExpense ? formatCurrency(stats.biggestExpense.valorTotal) : 'R$ 0,00'} em {stats.biggestExpense ? new Date(stats.biggestExpense.data + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
          </p>
        </div>
      </div>

      {/* Bottom Section: Charts & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Estabelecimentos */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#f0f1f4]">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="text-blue-600" size={24} />
            <h3 className="text-lg font-bold text-[#111318]">Top 5 Estabelecimentos</h3>
          </div>
          <div className="space-y-6">
            {stats.topEstablishments.map((item, idx) => (
              <div key={item.name}>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-gray-700">{item.name}</span>
                  <span className="text-[#111318]">{formatCurrency(item.value)}</span>
                </div>
                <div className="h-2.5 bg-gray-50 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${(item.value / (stats.faturaAtual || 1)) * 100}%` }}
                    className={`h-full rounded-full ${idx === 0 ? 'bg-primary' : 'bg-blue-300'}`}
                  ></div>
                </div>
              </div>
            ))}
            {stats.topEstablishments.length === 0 && <p className="text-gray-400 italic text-sm">Sem dados para exibir.</p>}
          </div>
        </div>

        {/* Próximos Pagamentos (Visual List) */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#f0f1f4]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Calendar className="text-blue-600" size={24} />
              <h3 className="text-lg font-bold text-[#111318]">Próximos Pagamentos</h3>
            </div>
            <button className="text-sm font-bold text-primary hover:underline">Ver todos</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="pb-3">Vencimento</th>
                  <th className="pb-3">Descrição</th>
                  <th className="pb-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tableData.slice(0, 5).map((item) => (
                  <tr key={`${item.id}-${item.currentInstallment}`} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 text-xs font-bold text-gray-600">
                      {/* Mocking due date as 10th for design match, or using purchase date + month */}
                      10 {monthName.substring(0, 3)}
                    </td>
                    <td className="py-4">
                      <p className="text-sm font-bold text-gray-800">{item.estabelecimento}</p>
                      <p className="text-[11px] text-gray-400 font-medium">{item.produto || 'Parcela ' + item.currentInstallment + '/' + item.parcelaTotal}</p>
                    </td>
                    <td className="py-4 text-right text-sm font-black text-gray-800">
                      {formatCurrency(item.monthlyValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tableData.length === 0 && <p className="text-gray-400 italic text-sm mt-4">Nenhum pagamento previsto.</p>}
          </div>
        </div>
      </div>

      {/* Detailed Table Section */}
      <div className="bg-white rounded-t-3xl shadow-sm border border-[#f0f1f4] overflow-hidden">
        <div className="p-6 bg-blue-600 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <FileText size={24} />
            <h3 className="text-xl font-bold">Detalhamento de Despesas</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Filtrar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 pl-9 pr-3 rounded-lg text-sm font-medium text-gray-800 bg-blue-500/30 border border-blue-400/30 placeholder-blue-100 focus:bg-white focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white transition-all w-40 focus:w-60"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-100 pointer-events-none" size={14} />
            </div>
            <button
              onClick={handleExport}
              className="h-9 px-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-bold text-white shadow-sm flex items-center gap-2 transition-all"
              title="Exportar dados carregados"
            >
              <Download size={14} /> Exportar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f8f9fa] border-b border-[#f0f1f4]">
              <tr>
                <th className="px-4 py-4 text-[11px] font-black text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-4 py-4 text-[11px] font-black text-gray-500 uppercase tracking-wider">Mês</th>
                <th className="px-4 py-4 text-[11px] font-black text-gray-500 uppercase tracking-wider">Comprador</th>
                <th className="px-4 py-4 text-[11px] font-black text-gray-500 uppercase tracking-wider">Estabelecimento</th>
                <th className="px-4 py-4 text-[11px] font-black text-gray-500 uppercase tracking-wider">Produto</th>
                <th className="px-4 py-4 text-[11px] font-black text-gray-500 uppercase tracking-wider text-center">Parc. Pagas</th>
                <th className="px-4 py-4 text-[11px] font-black text-gray-500 uppercase tracking-wider text-center">Parc. Totais</th>
                <th className="px-4 py-4 text-[11px] font-black text-gray-500 uppercase tracking-wider text-right">Vlr Total</th>
                <th className="px-4 py-4 text-[11px] font-black text-gray-500 uppercase tracking-wider text-right">Vlr Parcela</th>
                <th className="px-4 py-4 text-[11px] font-black text-blue-600 uppercase tracking-wider text-right">Italo</th>
                <th className="px-4 py-4 text-[11px] font-black text-purple-600 uppercase tracking-wider text-right">Edna</th>
                <th className="px-4 py-4 text-[11px] font-black text-gray-500 uppercase tracking-wider text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f1f4]">
              {tableData.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-6 py-16 text-center text-gray-400 italic">
                    Nenhum lançamento encontrado.
                  </td>
                </tr>
              ) : (
                tableData.map((item) => {
                  const itemMonth = new Date(item.data + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
                  const isDividido = item.tipoPagamento === 'dividido';
                  const isItalo = item.tipoPagamento === 'italo_full';
                  const isEdna = item.tipoPagamento === 'edna_full';

                  const italoValue = isDividido ? item.monthlyValue / 2 : (isItalo ? item.monthlyValue : 0);
                  const ednaValue = isDividido ? item.monthlyValue / 2 : (isEdna ? item.monthlyValue : 0);

                  return (
                    <tr key={`${item.id}-${item.currentInstallment}`} className="hover:bg-blue-50/20 transition-colors group">
                      <td className="px-4 py-4 text-xs font-bold text-gray-600">
                        {new Date(item.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-gray-600">
                        {itemMonth}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-100 text-purple-600 uppercase tracking-wide">
                          {item.responsavel}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-[#111318] uppercase">
                        {item.estabelecimento}
                      </td>
                      <td className="px-4 py-4 text-xs font-medium text-gray-500 truncate max-w-[150px]">
                        {item.produto || '-'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-[10px] font-bold ${item.currentInstallment === item.parcelaTotal ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                          {item.currentInstallment}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600">
                          {item.parcelaTotal}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs font-black text-[#111318] text-right">
                        {formatCurrency(item.valorTotal)}
                      </td>
                      <td className="px-4 py-4 text-xs font-medium text-gray-500 text-right">
                        {formatCurrency(item.monthlyValue)}
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-blue-600 text-right">
                        {formatCurrency(italoValue)}
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-purple-600 text-right">
                        {formatCurrency(ednaValue)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => onEdit(item)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Editar">
                            <FileText size={16} />
                          </button>
                          <button onClick={() => onDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Excluir">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div >
  );
};

export default Dashboard;
