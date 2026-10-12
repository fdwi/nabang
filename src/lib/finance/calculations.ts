import type { Database } from "@/types/database";

type Account = Database["public"]["Tables"]["accounts"]["Row"];
type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

export function calculateAccountBalance(
  account: Pick<Account, "id" | "opening_balance">,
  transactions: Pick<
    Transaction,
    "account_id" | "destination_account_id" | "amount" | "type"
  >[]
): number {
  let balance = Number(account.opening_balance) || 0;

  for (const tx of transactions) {
    const amount = Number(tx.amount) || 0;

    if (tx.type === "income" && tx.account_id === account.id) {
      balance += amount;
    } else if (tx.type === "expense" && tx.account_id === account.id) {
      balance -= amount;
    } else if (tx.type === "transfer") {
      if (tx.account_id === account.id) {
        balance -= amount;
      }
      if (tx.destination_account_id === account.id) {
        balance += amount;
      }
    }
  }

  return balance;
}

export function calculateTotalBalance(
  accounts: Pick<Account, "id" | "opening_balance" | "is_active">[],
  transactions: Pick<
    Transaction,
    "account_id" | "destination_account_id" | "amount" | "type"
  >[]
): number {
  const activeAccounts = accounts.filter((a) => a.is_active);
  return activeAccounts.reduce((total, acc) => {
    return total + calculateAccountBalance(acc, transactions);
  }, 0);
}

export function calculatePeriodIncome(
  transactions: Pick<Transaction, "amount" | "type">[]
): number {
  return transactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
}

export function calculatePeriodExpense(
  transactions: Pick<Transaction, "amount" | "type">[]
): number {
  return transactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
}

export function calculateCashFlow(
  transactions: Pick<Transaction, "amount" | "type">[]
): number {
  const income = calculatePeriodIncome(transactions);
  const expense = calculatePeriodExpense(transactions);
  return income - expense;
}
