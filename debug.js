
import fs from 'fs';

// Logic extracted from Dashboard.tsx
function calculateStats(expenses, selectedMonth) {
    const [year, month] = selectedMonth.split('-').map(Number);
    const logs = [];
    const log = (msg) => logs.push(msg);

    let totalComprado = 0;
    let faturaAtual = 0;
    let biggestExpense = null;

    expenses.forEach(exp => {
        if (exp.deleted) return;

        // Fix timezone issue by local splitting
        const [eYear, eMonth] = exp.data.split('-').map(Number);
        const expYear = eYear;
        const expMonth = eMonth;

        log(`Checking Expense: ${exp.produto} (${exp.data})`);
        log(`  Target: ${year}-${month}, Expense: ${expYear}-${expMonth}`);

        // Stats for the SELECTED month (Purchased in this month)
        if (expYear === year && expMonth === month) {
            log(`  -> MATCHED for Total Comprado`);
            totalComprado += exp.valorTotal;
            if (!biggestExpense || exp.valorTotal > biggestExpense.valorTotal) {
                biggestExpense = exp;
            }
        } else {
            log(`  -> NO MATCH for Total Comprado`);
        }

        // Stats for the active BILL (Installments active in this month)
        const monthsSinceStart = (year - expYear) * 12 + (month - expMonth);
        // Logic fix: Add manually paid installments to the calculated month index
        const effectiveIndex = monthsSinceStart + (exp.parcelasPagas || 0);

        log(`  MonthsSinceStart: ${monthsSinceStart}, Paid: ${exp.parcelasPagas}, EffectiveIndex: ${effectiveIndex}`);

        if (effectiveIndex >= 0 && effectiveIndex < exp.parcelaTotal) {
            log(`  -> ACTIVE in Fatura Atual`);
            const valuePerInstallment = exp.valorTotal / exp.parcelaTotal;
            faturaAtual += valuePerInstallment;
        } else {
            log(`  -> NOT ACTIVE in Fatura Atual`);
        }
    });

    return { totalComprado, faturaAtual, biggestExpense, logs };
}

// Test Case
const testExpense = {
    id: '1',
    data: '2025-02-07',
    estabelecimento: 'Test Store',
    produto: 'Test Product 2025',
    parcelaTotal: 10,
    parcelasPagas: 10,
    valorTotal: 1000,
    responsavel: 'italo',
    tipoPagamento: 'dividido'
};

const expenses = [testExpense];

const results = {
    test2026: calculateStats(expenses, '2026-02'),
    test2025: calculateStats(expenses, '2025-02')
};

fs.writeFileSync('debug_results.json', JSON.stringify(results, null, 2));
console.log("Done writing to debug_results.json");
