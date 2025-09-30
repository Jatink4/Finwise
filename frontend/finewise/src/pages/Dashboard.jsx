import { useEffect, useState } from "react";
import api from "../utils/api";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [holdings, setHoldings] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const t = await api.get("/api/transactions");
        setTransactions(t.data);
      } catch {}
      try {
        const p = await api.get("/api/portfolio");
        setHoldings(p.data);
      } catch {}
    };
    fetch();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">FinWise Dashboard</h1>

      <section className="mb-6">
        <h2 className="text-lg">Holdings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {holdings.map((h) => (
            <div key={h.id} className="p-4 border rounded">
              <div className="font-medium">{h.ticker}</div>
              <div>Qty: {h.quantity} @ {h.buyPrice}</div>
              <div>Current: {h.currentPrice ?? "n/a"}</div>
              <div>PnL: {h.pnl ?? "n/a"}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg">Recent Transactions</h2>
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div
              key={tx._id}
              className={`p-3 border rounded ${tx.flagged ? "border-red-400 bg-red-50" : ""}`}
            >
              <div>{tx.type} — {tx.amount}</div>
              <div className="text-sm text-gray-600">
                {tx.category} • {new Date(tx.date).toLocaleString()}
              </div>
              {tx.flagged && (
                <div className="text-xs text-red-600">
                  Flagged: {tx.meta?.fraudReason}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
