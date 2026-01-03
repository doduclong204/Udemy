import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminTopbar } from '../components/AdminTopbar';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  // Admin is auto-authenticated, no redirect needed

  return (
    <div className="min-h-screen bg-admin-background admin-theme">
      <div className="flex min-h-screen">
        <AdminSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        {/* Main content area - add left margin on desktop to account for fixed sidebar */}
        <div className="flex-1 flex flex-col min-h-screen w-full lg:ml-64">
          <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
