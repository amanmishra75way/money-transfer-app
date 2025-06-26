import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/userSlice";
import { requestTransaction } from "../redux/txnSlice";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser, users } = useSelector((state) => state.user);
  const { transactions } = useSelector((state) => state.txn);

  const [activeTab, setActiveTab] = useState("overview");
  const [transferForm, setTransferForm] = useState({
    recipientId: "",
    amount: "",
    isInternational: false,
  });
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // Get current user data from users array (to get updated balance)
  const currentUserData = users.find((u) => u.id === currentUser?.id) || currentUser;

  // Get user's transactions
  const userTransactions = transactions.filter(
    (txn) => txn.fromId === currentUserData?.id || txn.toId === currentUserData?.id
  );

  const handleTransfer = (e) => {
    e.preventDefault();
    const amount = parseFloat(transferForm.amount);

    if (amount <= 0) {
      alert("Please enter a valid amount!");
      return;
    }

    const commission = transferForm.isInternational ? amount * 0.1 : amount * 0.02;
    const totalAmount = amount + commission;

    if (totalAmount > currentUserData.balance) {
      alert(
        `Insufficient balance! You need $${totalAmount.toFixed(2)} (Amount: $${amount.toFixed(
          2
        )} + Commission: $${commission.toFixed(2)})`
      );
      return;
    }

    const recipient = users.find((u) => u.id === transferForm.recipientId);
    if (!recipient) {
      alert("Invalid recipient selected!");
      return;
    }

    dispatch(
      requestTransaction({
        fromId: currentUserData.id,
        toId: transferForm.recipientId,
        amount,
        type: "transfer",
        isInternational: transferForm.isInternational,
      })
    );

    setTransferForm({ recipientId: "", amount: "", isInternational: false });
    alert("Transfer request submitted for admin approval!");
  };

  const handleDeposit = (e) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);

    if (amount <= 0) {
      alert("Please enter a valid amount!");
      return;
    }

    dispatch(
      requestTransaction({
        fromId: "external",
        toId: currentUserData.id,
        amount,
        type: "deposit",
        isInternational: false,
      })
    );

    setDepositAmount("");
    alert("Deposit request submitted for admin approval!");
  };

  const handleWithdraw = (e) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);

    if (amount <= 0) {
      alert("Please enter a valid amount!");
      return;
    }

    if (amount > currentUserData.balance) {
      alert("Insufficient balance!");
      return;
    }

    dispatch(
      requestTransaction({
        fromId: currentUserData.id,
        toId: "external",
        amount,
        type: "withdraw",
        isInternational: false,
      })
    );

    setWithdrawAmount("");
    alert("Withdrawal request submitted for admin approval!");
  };

  const getRecipientName = (recipientId) => {
    if (recipientId === "external") return "External Account";
    const recipient = users.find((u) => u.id === recipientId);
    return recipient ? recipient.name : recipientId;
  };

  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  // Calculate stats
  const approvedTransactions = userTransactions.filter((txn) => txn.status === "approved");
  const pendingTransactions = userTransactions.filter((txn) => txn.status === "pending");
  const thisMonthTransactions = userTransactions.filter(
    (txn) =>
      new Date(txn.timestamp).getMonth() === new Date().getMonth() &&
      new Date(txn.timestamp).getFullYear() === new Date().getFullYear()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MT</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">MoneyTransfer</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Welcome, {currentUserData?.name}</p>
                <p className="text-sm text-gray-500">Balance: {formatCurrency(currentUserData?.balance || 0)}</p>
              </div>
              <button
                onClick={() => {
                  dispatch(logout());
                  navigate("/");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {["overview", "transfer", "deposit", "withdraw", "history"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Balance Card */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
              <h2 className="text-lg font-medium mb-2">Current Balance</h2>
              <p className="text-3xl font-bold">{formatCurrency(currentUserData?.balance || 0)}</p>
              <p className="text-blue-100 mt-2">Available for transfer</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Total Transactions</h3>
                <p className="text-2xl font-bold text-blue-600">{userTransactions.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Pending Approval</h3>
                <p className="text-2xl font-bold text-yellow-600">{pendingTransactions.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">This Month</h3>
                <p className="text-2xl font-bold text-green-600">{thisMonthTransactions.length}</p>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {userTransactions.slice(0, 5).map((txn) => (
                  <div key={txn.id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          txn.type === "deposit"
                            ? "bg-green-500"
                            : txn.type === "withdraw"
                            ? "bg-red-500"
                            : "bg-blue-500"
                        }`}
                      >
                        {txn.type === "deposit" ? "↓" : txn.type === "withdraw" ? "↑" : "→"}
                      </div>
                      <div>
                        <p className="font-medium">
                          {txn.type === "deposit"
                            ? "Deposit"
                            : txn.type === "withdraw"
                            ? "Withdrawal"
                            : txn.fromId === currentUserData.id
                            ? `To ${getRecipientName(txn.toId)}`
                            : `From ${getRecipientName(txn.fromId)}`}
                        </p>
                        <p className="text-sm text-gray-500">{formatDate(txn.timestamp)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-medium ${
                          txn.fromId === currentUserData.id && txn.type !== "deposit"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {txn.fromId === currentUserData.id && txn.type !== "deposit" ? "-" : "+"}
                        {formatCurrency(txn.amount)}
                      </p>
                      <p className={`text-xs ${txn.status === "pending" ? "text-yellow-600" : "text-green-600"}`}>
                        {txn.status}
                      </p>
                    </div>
                  </div>
                ))}
                {userTransactions.length === 0 && (
                  <div className="p-6 text-center text-gray-500">No transactions yet</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Transfer Tab */}
        {activeTab === "transfer" && (
          <div className="max-w-md mx-auto">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-6">Send Money</h2>
              <form onSubmit={handleTransfer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipient</label>
                  <select
                    value={transferForm.recipientId}
                    onChange={(e) => setTransferForm({ ...transferForm, recipientId: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select recipient</option>
                    {users
                      .filter((u) => u.id !== currentUserData?.id && !u.isAdmin)
                      .map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.id})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={transferForm.amount}
                    onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                    placeholder="0.00"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="international"
                    checked={transferForm.isInternational}
                    onChange={(e) => setTransferForm({ ...transferForm, isInternational: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="international" className="text-sm text-gray-700">
                    International Transfer (10% commission)
                  </label>
                </div>
                {transferForm.amount && (
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">
                      Commission ({transferForm.isInternational ? "10%" : "2%"}):{" "}
                      {formatCurrency(
                        parseFloat(transferForm.amount || 0) * (transferForm.isInternational ? 0.1 : 0.02)
                      )}
                    </p>
                    <p className="text-sm font-medium">
                      Total:{" "}
                      {formatCurrency(
                        parseFloat(transferForm.amount || 0) * (1 + (transferForm.isInternational ? 0.1 : 0.02))
                      )}
                    </p>
                  </div>
                )}
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm text-blue-700">
                    Available Balance: {formatCurrency(currentUserData?.balance || 0)}
                  </p>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-200"
                >
                  Send Money
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Deposit Tab */}
        {activeTab === "deposit" && (
          <div className="max-w-md mx-auto">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-6">Add Funds</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  💡 Deposit requests require admin approval before funds are added to your account.
                </p>
              </div>
              <form onSubmit={handleDeposit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition duration-200"
                >
                  Request Deposit
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Withdraw Tab */}
        {activeTab === "withdraw" && (
          <div className="max-w-md mx-auto">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-6">Withdraw Funds</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  💡 Withdrawal requests require admin approval before funds are deducted from your account.
                </p>
              </div>
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={currentUserData?.balance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Available balance: {formatCurrency(currentUserData?.balance || 0)}
                </p>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition duration-200"
                >
                  Request Withdrawal
                </button>
              </form>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Transaction History</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {userTransactions.length > 0 ? (
                userTransactions.map((txn) => (
                  <div key={txn.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                            txn.type === "deposit"
                              ? "bg-green-500"
                              : txn.type === "withdraw"
                              ? "bg-red-500"
                              : "bg-blue-500"
                          }`}
                        >
                          {txn.type === "deposit" ? "↓" : txn.type === "withdraw" ? "↑" : "→"}
                        </div>
                        <div>
                          <h3 className="font-medium">
                            {txn.type === "deposit"
                              ? "Deposit"
                              : txn.type === "withdraw"
                              ? "Withdrawal"
                              : txn.fromId === currentUserData.id
                              ? `Transfer to ${getRecipientName(txn.toId)}`
                              : `Transfer from ${getRecipientName(txn.fromId)}`}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(txn.timestamp)} • {txn.isInternational ? "International" : "Domestic"}
                          </p>
                          {txn.commission > 0 && (
                            <p className="text-xs text-gray-400">Commission: {formatCurrency(txn.commission)}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-lg font-semibold ${
                            txn.fromId === currentUserData.id && txn.type !== "deposit"
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {txn.fromId === currentUserData.id && txn.type !== "deposit" ? "-" : "+"}
                          {formatCurrency(txn.amount)}
                        </p>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            txn.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {txn.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">No transactions found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
