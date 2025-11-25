import { Home, Plus, Compass, LogOut, Wallet } from 'lucide-react';

interface SidebarProps {
  currentView: 'dashboard' | 'register' | 'detail' | 'explore';
  onNavigate: (view: 'dashboard' | 'register' | 'detail' | 'explore') => void;
  walletAddress: string;
  onDisconnect: () => void;
}

export default function Sidebar({ currentView, onNavigate, walletAddress, onDisconnect }: SidebarProps) {
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const navItems = [
    { id: 'dashboard' as const, label: 'My Assets', icon: Home },
    { id: 'register' as const, label: 'Register Asset', icon: Plus },
    { id: 'explore' as const, label: 'Explore', icon: Compass },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white">DA</span>
          </div>
          <div>
            <h2 className="text-gray-900">Asset Registry</h2>
            <p className="text-xs text-gray-500">Blockchain DApp</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Wallet Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-xl p-4 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-600">Connected Wallet</span>
          </div>
          <p className="text-sm text-gray-900 font-mono">{truncateAddress(walletAddress)}</p>
        </div>
        
        <button
          onClick={() => {
            console.log('🔵 SIDEBAR: Disconnect button clicked!');
            onDisconnect();
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </button>
      </div>
    </aside>
  );
}
