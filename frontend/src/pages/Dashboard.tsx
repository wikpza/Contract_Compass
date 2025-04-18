
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/StatCard';
import { PageHeader } from '@/components/PageHeader';
import { 
  Users, 
  Building2, 
  ShoppingBasket, 
  Briefcase,
  FileText 
} from 'lucide-react';
import { 
  applicants,
  purchasers,
  companies,
  products,
  projects,
  productContracts,
  serviceContracts
} from '@/data/mockData';
import { formatCurrency } from '@/utils/helpers';

const Dashboard = () => {
  const totalContracts = productContracts.length + serviceContracts.length;
  
  const activeProjects = projects.filter(p => p.status === 'active').length;
  
  const totalContractValue = [...productContracts, ...serviceContracts]
    .reduce((sum, contract) => sum + contract.totalAmount, 0);
    
  const totalPaidAmount = [...productContracts, ...serviceContracts]
    .reduce((sum, contract) => sum + contract.paidAmount, 0);
    
  const remainingAmount = totalContractValue - totalPaidAmount;

  // Data for charts
  const contractData = [
    { name: 'Jan', product: 5, service: 3 },
    { name: 'Feb', product: 7, service: 4 },
    { name: 'Mar', product: 10, service: 6 },
    { name: 'Apr', product: 8, service: 9 },
    { name: 'May', product: 12, service: 8 },
    { name: 'Jun', product: 15, service: 10 }
  ];

  return (
    <>
      <PageHeader 
        title="Dashboard" 
        description="Overview of your business operations"
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Total Projects"
          value={projects.length}
          description={`${activeProjects} active`}
          icon={<Briefcase className="h-4 w-4" />}
        />
        <StatCard
          title="Total Contracts"
          value={totalContracts}
          description={`${productContracts.length} product, ${serviceContracts.length} service`}
          icon={<FileText className="h-4 w-4" />}
        />
        <StatCard
          title="Total Contract Value"
          value={formatCurrency(totalContractValue)}
          description={`${formatCurrency(remainingAmount)} remaining`}
          icon={<ShoppingBasket className="h-4 w-4" />}
        />
        <StatCard
          title="Business Partners"
          value={companies.length + purchasers.length}
          description={`${companies.length} companies, ${purchasers.length} purchasers`}
          icon={<Building2 className="h-4 w-4" />}
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Contract Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={contractData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="product" name="Product Contracts" fill="#4A6FA5" />
                <Bar dataKey="service" name="Service Contracts" fill="#718096" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...productContracts, ...serviceContracts]
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .slice(0, 5)
                .map(contract => {
                  const project = projects.find(p => p.id === contract.projectId);
                  return (
                    <div key={contract.id} className="flex justify-between items-start border-b pb-2">
                      <div>
                        <h4 className="font-medium">{project?.name}</h4>
                        <p className="text-sm text-business-500">
                          {contract.type === 'product' ? 'Product Contract' : 'Service Contract'} • {formatCurrency(contract.totalAmount)}
                        </p>
                      </div>
                      <div className="text-sm text-business-500">
                        {contract.signingDate.toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Dashboard;
