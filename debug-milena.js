
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

        log(`Expense: ${exp.produto} (${exp.data})`);
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

// Scenario: Milena Movéis 10/05/2025, 10x
// Testing with 0 paid (standard) and assumed values
const expenseMilena = {
    id: 'milena',
    data: '2025-05-10',
    produto: 'Milena Movéis',
    parcelaTotal: 10,
    parcelasPagas: 0,
    valorTotal: 1999,
    responsavel: 'italo',
    tipoPagamento: 'dividido'
};

const expenses = [expenseMilena];
const logs = calculateStats(expenses, '2026-01');

fs.writeFileSync('debug_milena.json', JSON.stringify(logs, null, 2));
console.log('Done.');
