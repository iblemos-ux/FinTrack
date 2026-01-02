
import fs from 'fs';

function calculateStats(expenses, selectedMonth) {
    const [year, month] = selectedMonth.split('-').map(Number);
    const logs = [];
    const log = (msg) => logs.push(msg);

    let foundInTable = 0;

    expenses.forEach(exp => {
        const [eYear, eMonth] = exp.data.split('-').map(Number);
        const monthsSinceStart = (year - eYear) * 12 + (month - eMonth);
        const effectiveIndex = monthsSinceStart + (exp.parcelasPagas || 0);

        const isActive = effectiveIndex >= 0 && effectiveIndex < exp.parcelaTotal;
        const isPurchaseMonth = monthsSinceStart === 0;

        log(`Expense: ${exp.produto}, Date: ${exp.data}`);
        log(`  Target: ${year}-${month}, MonthsSinceStart: ${monthsSinceStart}`);
        log(`  Paid: ${exp.parcelasPagas}, EffectiveIndex: ${effectiveIndex}, Total: ${exp.parcelaTotal}`);
        log(`  isActive: ${isActive}, isPurchaseMonth: ${isPurchaseMonth}`);

        if (isActive || isPurchaseMonth) {
            log(`  -> VISIBLE in Table`);
            foundInTable++;
        } else {
            log(`  -> HIDDEN from Table`);
        }
    });
    return logs;
}

// Scenario: Expense bought Nov 2025, 12 installments. Should be visible in Jan 2026 (Installment 3).
const expenseNov2025 = {
    id: '2',
    data: '2025-11-15',
    produto: 'Nov 2025 Purchase',
    parcelaTotal: 12,
    parcelasPagas: 0,
    valorTotal: 1200,
    responsavel: 'italo',
    tipoPagamento: 'dividido'
};

const expenses = [expenseNov2025];
const logs = calculateStats(expenses, '2026-01');

fs.writeFileSync('debug_jan2026.json', JSON.stringify(logs, null, 2));
console.log('Done.');
