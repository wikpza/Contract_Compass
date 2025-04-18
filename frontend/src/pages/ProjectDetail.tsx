import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  projects, 
  productContracts, 
  serviceContracts,
  applicants,
  purchasers,
  companies
} from '@/data/mockData';
import { formatDate, formatCurrency, getPaymentPercentage, getDeliveryPercentage, calculateRemainingBalance, calculateRemainingQuantity } from '@/utils/helpers';
import { FileText, DownloadCloud, ExternalLink, AlertCircle, DollarSign, Clock, ShoppingBag, Percent } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { StatCard } from '@/components/StatCard';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  const project = projects.find(p => p.id === id);
  
  const projectProductContracts = productContracts.filter(
    contract => contract.projectId === id
  );
  
  const projectServiceContracts = serviceContracts.filter(
    contract => contract.projectId === id
  );

  const allContracts = [...projectProductContracts, ...projectServiceContracts];
  
  const projectCompletion = useMemo(() => {
    if (allContracts.length === 0) return 0;
    
    const totalCompletionSum = allContracts.reduce((sum, contract) => {
      return sum + getPaymentPercentage(contract.totalAmount, contract.paidAmount);
    }, 0);
    
    return Math.round(totalCompletionSum / allContracts.length);
  }, [allContracts]);

  const financialData = useMemo(() => {
    const totalContractValue = allContracts.reduce(
      (sum, contract) => sum + contract.totalAmount, 0
    );
    
    const totalSpent = allContracts.reduce(
      (sum, contract) => sum + contract.paidAmount, 0
    );
    
    return { totalContractValue, totalSpent };
  }, [allContracts]);

  const deliveryStats = useMemo(() => {
    const totalProducts = projectProductContracts.flatMap(c => c.contractProducts);
    
    const totalOrderedQuantity = totalProducts.reduce(
      (sum, item) => sum + item.quantity, 0
    );
    
    const totalDeliveredQuantity = totalProducts.reduce(
      (sum, item) => sum + item.deliveredQuantity, 0
    );
    
    const deliveryPercentage = totalOrderedQuantity > 0 
      ? Math.round((totalDeliveredQuantity / totalOrderedQuantity) * 100) 
      : 0;
    
    return { totalOrderedQuantity, totalDeliveredQuantity, deliveryPercentage };
  }, [projectProductContracts]);
  
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <AlertCircle className="h-16 w-16 text-business-300 mb-4" />
        <h2 className="text-2xl font-bold">Project Not Found</h2>
        <p className="text-muted-foreground mt-2 mb-6">The project you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/projects">Back to Projects</Link>
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'draft':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const contractColumns = [
    {
      header: 'Type',
      accessor: 'type',
      render: (type: string) => (
        type === 'product' ? 'Product Contract' : 'Service Contract'
      ),
    },
    {
      header: 'Applicant',
      accessor: 'applicantId',
      render: (applicantId: string) => {
        const applicant = applicants.find(a => a.id === applicantId);
        return applicant?.name || 'Unknown';
      },
    },
    {
      header: 'Purchaser',
      accessor: 'purchaserId',
      render: (purchaserId: string) => {
        const purchaser = purchasers.find(p => p.id === purchaserId);
        return purchaser?.name || 'Unknown';
      },
    },
    {
      header: 'Company/Firm',
      accessor: 'companyId',
      render: (companyId: string) => {
        const company = companies.find(c => c.id === companyId);
        return company?.name || 'Unknown';
      },
    },
    {
      header: 'Total Amount',
      accessor: 'totalAmount',
      render: (amount: number, row: any) => formatCurrency(amount, row.currency),
    },
    {
      header: 'Payment Status',
      accessor: 'paidAmount',
      render: (paidAmount: number, row: any) => {
        const percentage = getPaymentPercentage(row.totalAmount, paidAmount);
        return (
          <div className="w-full">
            <div className="flex justify-between text-xs mb-1">
              <span>{formatCurrency(paidAmount, row.currency)}</span>
              <span>{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
        );
      },
    },
    {
      header: 'Signing Date',
      accessor: 'signingDate',
      render: (date: Date) => formatDate(date),
    },
    {
      header: 'Expiration Date',
      accessor: 'expirationDate',
      render: (date: Date) => formatDate(date),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (status: string | undefined) => {
        if (!status) return 'N/A';
        return (
          <Badge className={getStatusColor(status)} variant="outline">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      header: 'Finished Date',
      accessor: 'realFinishedDate',
      render: (date: Date | null | undefined) => {
        return date ? formatDate(date) : 'Not finished';
      },
    },
    {
      header: 'Overdue',
      accessor: 'overdueDays',
      render: (days: number | undefined) => {
        if (days === undefined || days === 0) return 'On time';
        return (
          <span className="text-red-600 font-medium">
            {days} {days === 1 ? 'day' : 'days'}
          </span>
        );
      },
    },
  ];

  const productContractColumns = [
    ...contractColumns,
    {
      header: 'Delivery Status',
      accessor: 'contractProducts',
      render: (products: any[]) => {
        if (!products || products.length === 0) return 'N/A';
        
        const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
        const deliveredQuantity = products.reduce((sum, p) => sum + p.deliveredQuantity, 0);
        const percentage = getDeliveryPercentage(totalQuantity, deliveredQuantity);
        
        return (
          <div className="w-full">
            <div className="flex justify-between text-xs mb-1">
              <span>{deliveredQuantity}/{totalQuantity} units</span>
              <span>{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
        );
      }
    }
  ];

  return (
    <>
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-business-800">
              {project.name}
            </h1>
            <Badge className={getStatusColor(project.status)} variant="outline">
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Badge>
          </div>
          <p className="text-business-500 mt-1">{project.description}</p>
        </div>
        <Button asChild>
          <Link to={`/projects/${id}/contracts/new`}>
            <FileText className="h-4 w-4 mr-2" />
            Add Contract
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <StatCard
          title="Project Completion"
          value={`${projectCompletion}%`}
          icon={<Percent className="h-5 w-5" />}
          description="Based on contract completion percentage"
          progress={projectCompletion}
        />
        
        <StatCard
          title="Total Contract Value"
          value={formatCurrency(financialData.totalContractValue)}
          icon={<DollarSign className="h-5 w-5" />}
          description={`${allContracts.length} contract${allContracts.length !== 1 ? 's' : ''} total`}
        />
        
        <StatCard
          title="Total Spent"
          value={formatCurrency(financialData.totalSpent)}
          icon={<DollarSign className="h-5 w-5" />}
          description={`${formatCurrency(financialData.totalContractValue - financialData.totalSpent)} remaining`}
          progress={getPaymentPercentage(financialData.totalContractValue, financialData.totalSpent)}
        />
        
        <StatCard
          title="Project Timeline"
          value={formatDate(project.endDate)}
          icon={<Clock className="h-5 w-5" />}
          description={`Started ${formatDate(project.startDate)}`}
        />
      </div>

      {projectProductContracts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <StatCard
            title="Product Delivery"
            value={`${deliveryStats.deliveryPercentage}%`}
            icon={<ShoppingBag className="h-5 w-5" />}
            description={`${deliveryStats.totalDeliveredQuantity} of ${deliveryStats.totalOrderedQuantity} units delivered`}
            progress={deliveryStats.deliveryPercentage}
            progressColor="bg-green-600"
          />
          
          <StatCard
            title="Product Contracts"
            value={projectProductContracts.length}
            icon={<FileText className="h-5 w-5" />}
            description={`${projectServiceContracts.length} service contract${projectServiceContracts.length !== 1 ? 's' : ''}`}
          />
        </div>
      )}
      
      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Contracts ({projectProductContracts.length + projectServiceContracts.length})</TabsTrigger>
          <TabsTrigger value="product">Product Contracts ({projectProductContracts.length})</TabsTrigger>
          <TabsTrigger value="service">Service Contracts ({projectServiceContracts.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <div className="rounded-md border bg-white">
            <DataTable
              columns={contractColumns}
              data={[...projectProductContracts, ...projectServiceContracts]}
              viewPath={`/projects/${id}/contracts`}
              editPath={`/projects/${id}/contracts/edit`}
              addPath={`/projects/${id}/contracts/new`}
              addLabel="Add New Contract"
            />
          </div>
        </TabsContent>
        <TabsContent value="product" className="mt-4">
          <div className="rounded-md border bg-white">
            <DataTable
              columns={productContractColumns}
              data={projectProductContracts}
              viewPath={`/projects/${id}/contracts`}
              editPath={`/projects/${id}/contracts/edit`}
              addPath={`/projects/${id}/contracts/new`}
              addLabel="Add New Product Contract"
            />
          </div>
        </TabsContent>
        <TabsContent value="service" className="mt-4">
          <div className="rounded-md border bg-white">
            <DataTable
              columns={contractColumns}
              data={projectServiceContracts}
              viewPath={`/projects/${id}/contracts`}
              editPath={`/projects/${id}/contracts/edit`}
              addPath={`/projects/${id}/contracts/new`}
              addLabel="Add New Service Contract"
            />
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default ProjectDetail;
