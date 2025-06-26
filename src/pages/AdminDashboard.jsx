import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { approveTransaction } from "../redux/txnSlice";
import { updateBalance, logout } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";
const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { transactions } = useSelector((state) => state.txn);
  const { users, currentUser } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState("pending");

  const pendingTxns = transactions.filter((txn) => txn.status === "pending");
  const approvedTxns = transactions.filter((txn) => txn.status === "approved");

  // Calculate total commission earned
  const totalCommission = approvedTxns.reduce((sum, txn) => sum + (txn.commission || 0), 0);

  // Calculate today's transactions
  const today = new Date().toDateString();
  const todayTxns = transactions.filter((txn) => new Date(txn.timestamp).toDateString() === today);

  // Calculate monthly stats
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyTxns = transactions.filter((txn) => {
    const txnDate = new Date(txn.timestamp);
    return txnDate.getMonth() === currentMonth && txnDate.getFullYear() === currentYear;
  });

  const getUserName = (id) => {
    if (id === "external") return "External Account";
    const user = users.find((u) => u.id === id);
    return user ? `${user.name} (${id})` : id;
  };

  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;
  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  const handleApprove = (txn) => {
    dispatch(approveTransaction(txn.id));

    // Handle balance updates
    if (txn.type === "deposit") {
      dispatch(updateBalance({ userId: txn.toId, amount: txn.amount }));
    } else if (txn.type === "withdraw") {
      dispatch(updateBalance({ userId: txn.fromId, amount: -txn.amount }));
    } else if (txn.type === "transfer") {
      // Deduct from sender
      dispatch(updateBalance({ userId: txn.fromId, amount: -txn.amount }));

      // Credit to receiver (excluding commission)
      const netAmount = txn.amount - txn.commission;
      dispatch(updateBalance({ userId: txn.toId, amount: netAmount }));

      // Add commission to admin (find admin user)
      const adminUser = users.find((u) => u.isAdmin);
      if (adminUser && txn.commission > 0) {
        dispatch(updateBalance({ userId: adminUser.id, amount: txn.commission }));
      }
    }
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case "deposit":
        return "bg-green-100 text-green-800";
      case "withdraw":
        return "bg-red-100 text-red-800";
      case "transfer":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    return status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Welcome, {currentUser?.name}</p>
                <p className="text-sm text-gray-500">Administrator</p>
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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900">{pendingTxns.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">✓</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">$</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Commission</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCommission)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{todayTxns.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {["pending", "history", "users", "analytics"].map((tab) => (
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

        {/* Pending Transactions Tab */}
        {activeTab === "pending" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Pending Transactions ({pendingTxns.length})</h2>
              <p className="text-sm text-gray-600 mt-1">Review and approve pending transactions below</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      From
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingTxns.length > 0 ? (
                    pendingTxns.map((txn) => (
                      <tr key={txn.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransactionTypeColor(
                              txn.type
                            )}`}
                          >
                            {txn.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getUserName(txn.fromId)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getUserName(txn.toId)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(txn.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(txn.commission || 0)}
                          {txn.isInternational && <span className="ml-1 text-xs text-blue-600">(International)</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(txn.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleApprove(txn)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
                          >
                            Approve
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <span className="text-4xl mb-2">✨</span>
                          <p>No pending transactions</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transaction History Tab */}
        {activeTab === "history" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Transaction History</h2>
              <p className="text-sm text-gray-600 mt-1">All approved transactions ({approvedTxns.length} total)</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      From
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {approvedTxns.slice(0, 20).map((txn) => (
                    <tr key={txn.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransactionTypeColor(
                            txn.type
                          )}`}
                        >
                          {txn.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getUserName(txn.fromId)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getUserName(txn.toId)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(txn.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(txn.commission || 0)}
                        {txn.isInternational && <span className="ml-1 text-xs text-blue-600">(Int'l)</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(txn.timestamp)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            txn.status
                          )}`}
                        >
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Management Tab */}
        {activeTab === "users" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">User Management</h2>
              <p className="text-sm text-gray-600 mt-1">Overview of all users and their balances</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transactions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => {
                    const userTxns = transactions.filter((txn) => txn.fromId === user.id || txn.toId === user.id);
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">{user.name.charAt(0)}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.balance !== undefined ? formatCurrency(user.balance) : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.isAdmin ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                            }`}
                          >
                            {user.isAdmin ? "Admin" : "User"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{userTxns.length}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Commission Breakdown */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Commission Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Domestic Transfers (2%)</span>
                    <span className="font-medium">
                      {formatCurrency(
                        approvedTxns
                          .filter((txn) => txn.type === "transfer" && !txn.isInternational)
                          .reduce((sum, txn) => sum + (txn.commission || 0), 0)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">International Transfers (10%)</span>
                    <span className="font-medium">
                      {formatCurrency(
                        approvedTxns
                          .filter((txn) => txn.type === "transfer" && txn.isInternational)
                          .reduce((sum, txn) => sum + (txn.commission || 0), 0)
                      )}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-800">Total Commission</span>
                      <span className="font-bold text-lg text-green-600">{formatCurrency(totalCommission)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Summary */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">This Month's Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Transactions</span>
                    <span className="font-medium">{monthlyTxns.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Deposits</span>
                    <span className="font-medium">{monthlyTxns.filter((txn) => txn.type === "deposit").length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Withdrawals</span>
                    <span className="font-medium">{monthlyTxns.filter((txn) => txn.type === "withdraw").length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Transfers</span>
                    <span className="font-medium">{monthlyTxns.filter((txn) => txn.type === "transfer").length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Volume Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Transaction Types Distribution</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">💰</span>
                  </div>
                  <p className="text-sm text-gray-600">Deposits</p>
                  <p className="text-lg font-bold text-green-600">
                    {transactions.filter((txn) => txn.type === "deposit").length}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">💸</span>
                  </div>
                  <p className="text-sm text-gray-600">Transfers</p>
                  <p className="text-lg font-bold text-blue-600">
                    {transactions.filter((txn) => txn.type === "transfer").length}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">🏦</span>
                  </div>
                  <p className="text-sm text-gray-600">Withdrawals</p>
                  <p className="text-lg font-bold text-red-600">
                    {transactions.filter((txn) => txn.type === "withdraw").length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
