
import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  FileText,
  PieChart,
  Plus,
  Settings,
  Bell,
  Search,
  ChevronDown,
  TrendingUp,
  Receipt,
  ShoppingCart,
  Calendar,
  CreditCard,
  Edit2,
  Trash2,
  Filter,
  Download,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Expense, ExpenseFormState, PayerType, SplitType } from './types';
import { storage } from './utils/storage';
import ExpenseForm from './components/ExpenseForm';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import Reports from './components/Reports';

import { Notification } from './components/NotificationDropdown';
import { supabase } from './lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import AuthScreen from './components/AuthScreen';

// ... (imports remain the same)

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'lancamento' | 'relatorios'>('dashboard');

  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Initialize default month using LOCAL time to avoid timezone offsets causing "next month" default
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    }).catch((error) => {
      console.error("Auth init error:", error);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      loadExpenses();
    }
  }, [session]);

  const loadExpenses = async () => {
    try {
      const result = await storage.get('expense-tracker-data');
      if (result && Array.isArray(result)) {
        setExpenses(result);
      }
    } catch (error) {
      console.error("Erro ao carregar despesas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveExpenses = async (newExpenses: Expense[]) => {
    try {
      await storage.set('expense-tracker-data', newExpenses);
      setExpenses(newExpenses);
    } catch (error) {
      console.error("Erro ao salvar despesas:", error);
    }
  };

  const addNotification = (message: string) => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleMarkAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleAddExpense = (formData: ExpenseFormState) => {
    console.log("Receiving Form Data:", formData);

    // Clean currency string: remove dots, replace comma with dot, trim whitespace
    const cleanCurrency = (val: string) => {
      // Robust parsing: convert to string first, then keep only digits and commas
      const strVal = String(val);
      // Remove everything that is NOT a digit or a comma (removes dots, R$, spaces)
      const onlyNumbersAndComma = strVal.replace(/[^0-9,]/g, '');
      // Replace comma with dot for JS parseFloat
      const standardValue = onlyNumbersAndComma.replace(',', '.');
      return parseFloat(standardValue) || 0;
    };

    const newExpense: Expense = {
      id: editingExpense?.id || Math.random().toString(36).substr(2, 9),
      data: formData.data,
      estabelecimento: formData.estabelecimento,
      produto: formData.produto,
      parcelaTotal: parseInt(formData.parcelaTotal) || 1,
      parcelasPagas: parseInt(formData.parcelasPagas) || 0,
      valorTotal: cleanCurrency(formData.valorTotal),
      responsavel: formData.responsavel,
      tipoPagamento: formData.tipoPagamento,
      categoria: 'Geral' // Default category
    };

    console.log("Processed New Expense:", newExpense);

    let updatedExpenses;
    if (editingExpense) {
      updatedExpenses = expenses.map(e => e.id === editingExpense.id ? newExpense : e);
      setEditingExpense(null);
      addNotification(`Despesa atualizada: ${newExpense.estabelecimento}`);
    } else {
      updatedExpenses = [...expenses, newExpense];
      addNotification(`Nova despesa: ${newExpense.estabelecimento} - R$ ${newExpense.valorTotal.toFixed(2)}`);
    }

    console.log("Saving Updated Expenses List:", updatedExpenses);

    saveExpenses(updatedExpenses);
    setCurrentPage('dashboard');
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm("Deseja realmente excluir esta despesa?")) {
      const updatedExpenses = expenses.map(e =>
        e.id === id ? { ...e, deleted: true } : e
      );
      saveExpenses(updatedExpenses);
      addNotification("Despesa removida com sucesso.");
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setCurrentPage('lancamento');
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f6f6f8]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="text-gray-500 font-medium tracking-wide animate-pulse">Carregando FinTrack...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f6f8]">
      {/* Top Header */}
      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onResetEdit={() => setEditingExpense(null)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onClearNotifications={handleClearNotifications}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-gray-500 font-medium">Carregando seus dados...</p>
          </div>
        ) : (
          <>
            {currentPage === 'dashboard' && (
              <Dashboard
                expenses={expenses}
                onEdit={handleEditExpense}
                onDelete={handleDeleteExpense}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                onNew={() => {
                  setEditingExpense(null);
                  setCurrentPage('lancamento');
                }}
              />
            )}
            {currentPage === 'lancamento' && (
              <ExpenseForm
                onSave={handleAddExpense}
                onCancel={() => {
                  setEditingExpense(null);
                  setCurrentPage('dashboard');
                }}
                editingExpense={editingExpense}
              />
            )}
            {currentPage === 'relatorios' && (
              <Reports expenses={expenses} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
