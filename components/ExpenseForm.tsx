
import React, { useState, useEffect } from 'react';
import {
  History,
  Receipt,
  DollarSign,
  PlusCircle,
} from 'lucide-react';
import { Expense, ExpenseFormState } from '../types';

import ExpenseSummary from './ExpenseSummary';

interface ExpenseFormProps {
  onSave: (data: ExpenseFormState) => void;
  onCancel: () => void;
  editingExpense: Expense | null;
  existingExpenses?: Expense[];
}


const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSave, onCancel, editingExpense, existingExpenses = [] }) => {
  const [form, setForm] = useState<ExpenseFormState>({
    data: new Date().toISOString().split('T')[0],
    estabelecimento: '',
    produto: '',
    parcelaTotal: '1',
    parcelasPagas: '0',
    valorTotal: '',
    responsavel: 'italo',
    tipoPagamento: 'dividido'
  });

  // Verificação de duplicidade
  const [isDuplicate, setIsDuplicate] = useState(false);

  useEffect(() => {
    if (!form.estabelecimento || !form.valorTotal || !form.responsavel) {
      setIsDuplicate(false);
      return;
    }
    const valorNum = parseCurrency(form.valorTotal);
    const found = existingExpenses.some(e =>
      (!editingExpense || e.id !== editingExpense.id) &&
      e.estabelecimento.trim().toLowerCase() === form.estabelecimento.trim().toLowerCase() &&
      e.responsavel.trim().toLowerCase() === form.responsavel.trim().toLowerCase() &&
      e.produto.trim().toLowerCase() === form.produto.trim().toLowerCase() &&
      Math.abs(Number(e.valorTotal) - valorNum) < 0.01 &&
      e.data === form.data
    );
    setIsDuplicate(found);
  }, [form, existingExpenses, editingExpense]);

  useEffect(() => {
    if (editingExpense) {
      setForm({
        data: editingExpense.data,
        estabelecimento: editingExpense.estabelecimento,
        produto: editingExpense.produto,
        parcelaTotal: editingExpense.parcelaTotal.toString(),
        parcelasPagas: editingExpense.parcelasPagas.toString(),
        valorTotal: editingExpense.valorTotal.toString().replace('.', ','),
        responsavel: editingExpense.responsavel,
        tipoPagamento: editingExpense.tipoPagamento
      });
    }
  }, [editingExpense]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log(`Input Change: [${name}] = ${value}`);
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const parseCurrency = (value: string) => {
    // Robust parsing: convert to string first, then keep only digits and commas
    const strVal = String(value);
    // Remove everything that is NOT a digit or a comma (removes dots, R$, spaces)
    const onlyNumbersAndComma = strVal.replace(/[^0-9,]/g, '');
    // Replace comma with dot for JS parseFloat
    const standardValue = onlyNumbersAndComma.replace(',', '.');
    return parseFloat(standardValue) || 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting Form Data:", form);
    if (!form.estabelecimento || !form.valorTotal || !form.responsavel) {
      console.warn("Form validation failed: Missing required fields", form);
      alert("Por favor preencha os campos obrigatórios (Estabelecimento, Valor e Quem Pagou).");
      return;
    }
    if (isDuplicate) {
      alert("Despesa semelhante já lançada! Verifique para evitar duplicidade.");
      return;
    }
    onSave(form);
  };

  const calculateInstallmentValue = () => {
    const total = parseCurrency(form.valorTotal);
    const installments = parseInt(form.parcelaTotal) || 1;
    return total / installments;
  };

  const installmentValue = calculateInstallmentValue();
  const totalValueNum = parseCurrency(form.valorTotal);

  return (
    <div className="max-w-7xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#111318]">
            {editingExpense ? 'Editar Despesa' : 'Lançamento de Despesa'}
          </h1>
          <p className="text-[#616b89] text-base mt-2">Adicione os detalhes da compra para dividir os custos.</p>
        </div>
        <button onClick={onCancel} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#616b89] bg-white border border-[#dbdee6] rounded-lg hover:bg-gray-50 transition-colors">
          <History size={18} /> Histórico / Cancelar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {isDuplicate && (
          <div className="lg:col-span-8 mb-4">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-xl font-bold">
              Atenção: Uma despesa semelhante já foi lançada para esta data, valor, pagador e estabelecimento/produto. Verifique antes de confirmar!
            </div>
          </div>
        )}
        {/* Form Container */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-8 bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-[#f0f1f4]">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="text-primary" size={24} />
              <h3 className="text-lg font-bold text-[#111318]">Detalhes da Compra</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#111318]">Data da Compra</label>
                <input
                  type="date"
                  name="data"
                  value={form.data}
                  onChange={handleInputChange}
                  className="h-12 px-4 rounded-xl border border-[#dbdee6] focus:ring-2 focus:ring-primary focus:outline-none font-medium"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#111318]">Quem pagou?</label>
                <input
                  type="text"
                  name="responsavel"
                  value={form.responsavel}
                  onChange={handleInputChange}
                  placeholder="Ex: Italo"
                  className="h-12 px-4 rounded-xl border border-[#dbdee6] focus:ring-2 focus:ring-primary focus:outline-none font-medium"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#111318]">Estabelecimento</label>
                <input
                  type="text"
                  name="estabelecimento"
                  value={form.estabelecimento}
                  onChange={handleInputChange}
                  placeholder="Ex: Supermercado Extra"
                  className="h-12 px-4 rounded-xl border border-[#dbdee6] focus:ring-2 focus:ring-primary focus:outline-none font-medium"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#111318]">Descrição do Produto</label>
                <input
                  type="text"
                  name="produto"
                  value={form.produto}
                  onChange={handleInputChange}
                  placeholder="Ex: Compras do Mês"
                  className="h-12 px-4 rounded-xl border border-[#dbdee6] focus:ring-2 focus:ring-primary focus:outline-none font-medium"
                />
              </div>
            </div>
          </div>

          <hr className="border-[#f0f1f4]" />

          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="text-primary" size={24} />
              <h3 className="text-lg font-bold text-[#111318]">Valores e Divisão</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-bold text-[#111318]">Valor Total (R$)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">R$</span>
                  <input
                    type="text"
                    name="valorTotal"
                    value={form.valorTotal}
                    onChange={handleInputChange}
                    placeholder="0,00"
                    className="w-full h-16 pl-12 pr-4 text-3xl font-black tracking-tight rounded-2xl border border-[#dbdee6] focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#111318]">Como dividir?</label>
                <select
                  name="tipoPagamento"
                  value={form.tipoPagamento}
                  onChange={handleInputChange}
                  className="h-12 px-4 rounded-xl border border-[#dbdee6] focus:ring-2 focus:ring-primary focus:outline-none font-medium appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
                >
                  <option value="dividido">Dividido (Meio a Meio)</option>
                  <option value="italo_full">Só Italo paga</option>
                  <option value="edna_full">Só Edna paga</option>
                </select>
              </div>

              <div className="flex gap-4 w-full">
                <div className="flex flex-col gap-2" style={{flex:1,minWidth:0}}>
                  <label className="text-sm font-bold text-[#111318]">Parcelas</label>
                  <input
                    type="number"
                    name="parcelaTotal"
                    value={form.parcelaTotal}
                    onChange={handleInputChange}
                    min="1"
                    className="h-12 px-4 rounded-xl border border-[#dbdee6] focus:ring-2 focus:ring-primary focus:outline-none font-bold w-full"
                    style={{boxSizing:'border-box'}}
                  />
                </div>
                <div className="flex flex-col gap-2" style={{flex:1,minWidth:0}}>
                  <label className="text-sm font-bold text-[#111318]">Já Pagas</label>
                  <input
                    type="number"
                    name="parcelasPagas"
                    value={form.parcelasPagas}
                    onChange={handleInputChange}
                    min="0"
                    className="h-12 px-4 rounded-xl border border-[#dbdee6] focus:ring-2 focus:ring-primary focus:outline-none font-bold w-full"
                    style={{boxSizing:'border-box'}}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-[#f0f1f4]">
            <button type="submit" className="flex-1 bg-primary hover:bg-blue-700 text-white h-14 rounded-xl font-extrabold text-lg transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2">
              <PlusCircle size={22} />
              {editingExpense ? 'Atualizar Despesa' : 'Adicionar Despesa'}
            </button>
            <button type="button" onClick={onCancel} className="px-8 h-14 border border-[#dbdee6] rounded-xl font-bold text-[#616b89] hover:bg-gray-50 transition-all">
              Cancelar
            </button>
          </div>
        </form>

        <div className="lg:col-span-4">
          <ExpenseSummary
            form={form}
            installmentValue={installmentValue}
            totalValueNum={totalValueNum}
          />
          {isDuplicate && (
            <div className="w-full flex justify-center mt-2">
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-2 rounded-xl font-bold text-center shadow text-xs max-w-[90%]">
                Atenção: Despesa semelhante já lançada!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;
