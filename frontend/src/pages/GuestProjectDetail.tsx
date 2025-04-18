import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  projects, 
  productContracts, 
  serviceContracts,
  applicants,
  purchasers,
  companies
} from '@/data/mockData';
import { formatDate, formatCurrency, getPaymentPercentage, getDeliveryPercentage } from '@/utils/helpers';
import { AlertCircle, DollarSign, Clock, ShoppingBag, Percent, ExternalLink } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { StatCard } from '@/components/StatCard';
import GuestLayout from '@/components/GuestLayout';

const GuestProjectDetail = () => {
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
      <GuestLayout>
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <AlertCircle className="h-16 w-16 text-business-300 mb-4" />
          <h2 className="text-2xl font-bold">Project Not Found</h2>
          <p className="text-muted-foreground mt-2 mb-6">The project you're looking for doesn't exist or has been removed.</p>
        </div>
      </GuestLayout>
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

  return (
    <GuestLayout>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold tracking-tight text-business-800">
            {project.name}
          </h1>
          <Badge className={getStatusColor(project.status)} variant="outline">
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </Badge>
        </div>
        <p className="text-business-500">{project.description}</p>
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
            icon={<ShoppingBag className="h-5 w-5" />}
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
          <div className="rounded-md border overflow-hidden">
            <div className="bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Purchaser</TableHead>
                    <TableHead>Company/Firm</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Signing Date</TableHead>
                    <TableHead>Expiration Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Finished Date</TableHead>
                    <TableHead>Overdue</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allContracts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="h-24 text-center">
                        No contracts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    allContracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell>{contract.type === 'product' ? 'Product Contract' : 'Service Contract'}</TableCell>
                        <TableCell>{applicants.find(a => a.id === contract.applicantId)?.name || 'Unknown'}</TableCell>
                        <TableCell>{purchasers.find(p => p.id === contract.purchaserId)?.name || 'Unknown'}</TableCell>
                        <TableCell>{companies.find(c => c.id === contract.companyId)?.name || 'Unknown'}</TableCell>
                        <TableCell>{formatCurrency(contract.totalAmount, contract.currency)}</TableCell>
                        <TableCell>
                          <div className="w-full">
                            <div className="flex justify-between text-xs mb-1">
                              <span>{formatCurrency(contract.paidAmount, contract.currency)}</span>
                              <span>{getPaymentPercentage(contract.totalAmount, contract.paidAmount)}%</span>
                            </div>
                            <Progress value={getPaymentPercentage(contract.totalAmount, contract.paidAmount)} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(contract.signingDate)}</TableCell>
                        <TableCell>{formatDate(contract.expirationDate)}</TableCell>
                        <TableCell>
                          {contract.status && (
                            <Badge className={getStatusColor(contract.status)} variant="outline">
                              {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{contract.realFinishedDate ? formatDate(contract.realFinishedDate) : 'Not finished'}</TableCell>
                        <TableCell>
                          {contract.overdueDays ? (
                            <span className="text-red-600 font-medium">
                              {contract.overdueDays} {contract.overdueDays === 1 ? 'day' : 'days'}
                            </span>
                          ) : 'On time'}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/guest/projects/${id}/contracts/${contract.id}`}>
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View Details
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="product" className="mt-4">
          <div className="rounded-md border overflow-hidden">
            <div className="bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Purchaser</TableHead>
                    <TableHead>Company/Firm</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Delivery Status</TableHead>
                    <TableHead>Signing Date</TableHead>
                    <TableHead>Expiration Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Finished Date</TableHead>
                    <TableHead>Overdue</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectProductContracts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={13} className="h-24 text-center">
                        No product contracts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    projectProductContracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell>Product Contract</TableCell>
                        <TableCell>{applicants.find(a => a.id === contract.applicantId)?.name || 'Unknown'}</TableCell>
                        <TableCell>{purchasers.find(p => p.id === contract.purchaserId)?.name || 'Unknown'}</TableCell>
                        <TableCell>{companies.find(c => c.id === contract.companyId)?.name || 'Unknown'}</TableCell>
                        <TableCell>{formatCurrency(contract.totalAmount, contract.currency)}</TableCell>
                        <TableCell>
                          <div className="w-full">
                            <div className="flex justify-between text-xs mb-1">
                              <span>{formatCurrency(contract.paidAmount, contract.currency)}</span>
                              <span>{getPaymentPercentage(contract.totalAmount, contract.paidAmount)}%</span>
                            </div>
                            <Progress value={getPaymentPercentage(contract.totalAmount, contract.paidAmount)} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          {contract.contractProducts && (
                            <>
                              {(() => {
                                const totalQuantity = contract.contractProducts.reduce((sum, p) => sum + p.quantity, 0);
                                const deliveredQuantity = contract.contractProducts.reduce((sum, p) => sum + p.deliveredQuantity, 0);
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
                              })()}
                            </>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(contract.signingDate)}</TableCell>
                        <TableCell>{formatDate(contract.expirationDate)}</TableCell>
                        <TableCell>
                          {contract.status && (
                            <Badge className={getStatusColor(contract.status)} variant="outline">
                              {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{contract.realFinishedDate ? formatDate(contract.realFinishedDate) : 'Not finished'}</TableCell>
                        <TableCell>
                          {contract.overdueDays ? (
                            <span className="text-red-600 font-medium">
                              {contract.overdueDays} {contract.overdueDays === 1 ? 'day' : 'days'}
                            </span>
                          ) : 'On time'}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/guest/projects/${id}/contracts/${contract.id}`}>
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View Details
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="service" className="mt-4">
          <div className="rounded-md border overflow-hidden">
            <div className="bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Purchaser</TableHead>
                    <TableHead>Company/Firm</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Signing Date</TableHead>
                    <TableHead>Expiration Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Finished Date</TableHead>
                    <TableHead>Overdue</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectServiceContracts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="h-24 text-center">
                        No service contracts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    projectServiceContracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell>Service Contract</TableCell>
                        <TableCell>{applicants.find(a => a.id === contract.applicantId)?.name || 'Unknown'}</TableCell>
                        <TableCell>{purchasers.find(p => p.id === contract.purchaserId)?.name || 'Unknown'}</TableCell>
                        <TableCell>{companies.find(c => c.id === contract.companyId)?.name || 'Unknown'}</TableCell>
                        <TableCell>{formatCurrency(contract.totalAmount, contract.currency)}</TableCell>
                        <TableCell>
                          <div className="w-full">
                            <div className="flex justify-between text-xs mb-1">
                              <span>{formatCurrency(contract.paidAmount, contract.currency)}</span>
                              <span>{getPaymentPercentage(contract.totalAmount, contract.paidAmount)}%</span>
                            </div>
                            <Progress value={getPaymentPercentage(contract.totalAmount, contract.paidAmount)} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(contract.signingDate)}</TableCell>
                        <TableCell>{formatDate(contract.expirationDate)}</TableCell>
                        <TableCell>
                          {contract.status && (
                            <Badge className={getStatusColor(contract.status)} variant="outline">
                              {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{contract.realFinishedDate ? formatDate(contract.realFinishedDate) : 'Not finished'}</TableCell>
                        <TableCell>
                          {contract.overdueDays ? (
                            <span className="text-red-600 font-medium">
                              {contract.overdueDays} {contract.overdueDays === 1 ? 'day' : 'days'}
                            </span>
                          ) : 'On time'}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/guest/projects/${id}/contracts/${contract.id}`}>
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View Details
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-sm text-gray-500">Start Date</h3>
              <p>{formatDate(project.startDate)}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">End Date</h3>
              <p>{formatDate(project.endDate)}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Status</h3>
              <Badge className={getStatusColor(project.status)} variant="outline">
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </Badge>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Created</h3>
              <p>{formatDate(project.createdAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </GuestLayout>
  );
};

export default GuestProjectDetail;
