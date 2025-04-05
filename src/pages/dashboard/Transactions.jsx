import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  HiOutlineRefresh, HiOutlineSearch, HiOutlineAdjustments, 
  HiOutlineCurrencyDollar, HiOutlineCalendar
} from 'react-icons/hi';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching user transactions...');
      
      // First try with the correct endpoint
      const response = await api.get('/user/transactions').catch(async (error) => {
        console.warn('Error with /user/transactions endpoint, trying fallback:', error);
        
        // Fallback: try to get bookings directly
        const gymResponse = await api.get('/bookings/user');
        return { data: gymResponse.data }; // Format to match expected response
      });
      
      console.log('Transactions response:', response.data);
      
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transaction history');
      toast.error('Could not load your transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    // Apply type filter
    if (filter !== 'all' && transaction.type !== filter) {
      return false;
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        transaction.description?.toLowerCase().includes(query) ||
        transaction.type?.toLowerCase().includes(query) ||
        transaction.paymentStatus?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Get transaction status badge
  const getStatusBadge = (status) => {
    const statusClasses = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ToastContainer />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Transaction History</h1>
        <p className="text-gray-600">View your payment history and booking transactions</p>
      </div>
      
      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-auto flex-grow">
            <div className="relative">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <HiOutlineSearch className="absolute left-3 top-2.5 text-gray-500" />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center">
              <HiOutlineAdjustments className="text-gray-500 mr-2" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="gym">Gym Sessions</option>
                <option value="trainer">Trainer Sessions</option>
              </select>
            </div>
            
            <button
              onClick={fetchTransactions}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
            >
              <HiOutlineRefresh className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Transactions list */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <HiOutlineCurrencyDollar className="h-16 w-16 mx-auto text-gray-400" />
            <p className="mt-4 text-gray-600 text-lg">No transactions found</p>
            <p className="mt-2 text-gray-500">
              {searchQuery || filter !== 'all' ? 'Try adjusting your filters' : "You haven't made any bookings yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction, index) => (
                  <tr key={transaction._id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xl">{transaction.icon || '💰'}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{transaction.description || 'Transaction'}</div>
                          <div className="text-sm text-gray-500">{transaction.type?.charAt(0).toUpperCase() + transaction.type?.slice(1) || 'Unknown'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <HiOutlineCalendar className="mr-2 text-gray-500" />
                        <div className="text-sm text-gray-900">
                          {transaction.date ? new Date(transaction.date).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{transaction.amount?.toFixed(2) || '0.00'}</div>
                      <div className="text-xs text-gray-500">
                        {transaction.payment?.method || transaction.paymentMethod || 'Cash'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(transaction.payment?.status || transaction.paymentStatus || transaction.status || 'pending')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
