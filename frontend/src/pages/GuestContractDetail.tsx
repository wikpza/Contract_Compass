
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { 
  productContracts, 
  serviceContracts,
  applicants,
  purchasers,
  companies,
  products,
  units
} from '@/data/mockData';
import { formatDate, formatCurrency, getPaymentPercentage, getDeliveryPercentage } from '@/utils/helpers';
import { ContractPaymentHistory } from '@/components/ContractPaymentHistory';
import GuestLayout from '@/components/GuestLayout';

const GuestContractDetail = () => {
  const { projectId, contractId } = useParams<{ projectId: string; contractId: string }>();
  const navigate = useNavigate();
  
  // Find the contract from either product or service contracts
  const productContract = productContracts.find(c => c.id === contractId);
  const serviceContract = serviceContracts.find(c => c.id === contractId);
  const contract = productContract || serviceContract;
  
  if (!contract) {
    return (
      <GuestLayout>
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <AlertCircle className="h-16 w-16 text-business-300 mb-4" />
          <h2 className="text-2xl font-bold">Contract Not Found</h2>
          <p className="text-muted-foreground mt-2 mb-6">The contract you're looking for doesn't exist or has been removed.</p>
          <Button asChild variant="outline">
            <Link to={`/guest/projects/${projectId}`}>Back to Project</Link>
          </Button>
        </div>
      </GuestLayout>
    );
  }

  const isProductContract = contract.type === 'product';
  const applicant = applicants.find(a => a.id === contract.applicantId);
  const purchaser = purchasers.find(p => p.id === contract.purchaserId);
  const company = companies.find(c => c.id === contract.companyId);
  
  const paymentPercentage = getPaymentPercentage(contract.totalAmount, contract.paidAmount);
  
  let deliveryPercentage = 0;
  if (isProductContract && productContract?.contractProducts) {
    const totalQuantity = productContract.contractProducts.reduce(
      (sum, p) => sum + p.quantity, 0
    );
    
    const deliveredQuantity = productContract.contractProducts.reduce(
      (sum, p) => sum + p.deliveredQuantity, 0
    );
    
    deliveryPercentage = getDeliveryPercentage(totalQuantity, deliveredQuantity);
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
        <Button 
          variant="outline" 
          className="mb-4"
          onClick={() => navigate(`/guest/projects/${projectId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Project
        </Button>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-business-800">
              {contract.type === 'product' ? 'Product Contract' : 'Service Contract'}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted-foreground">Contract ID: {contract.id}</span>
              {contract.status && (
                <Badge className={getStatusColor(contract.status)} variant="outline">
                  {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Contract Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(contract.paidAmount, contract.currency)} 
              <span className="text-muted-foreground text-sm font-normal ml-1">
                of {formatCurrency(contract.totalAmount, contract.currency)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1 mt-3">
              <span>Paid</span>
              <span>{paymentPercentage}%</span>
            </div>
            <Progress value={paymentPercentage} className="h-2" />
          </CardContent>
        </Card>
        
        {isProductContract && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Delivery Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {deliveryPercentage}%
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1 mt-3">
                <span>Delivered</span>
                <span>{deliveryPercentage}%</span>
              </div>
              <Progress value={deliveryPercentage} className="h-2" indicatorClassName="bg-green-600" />
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Contract Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDate(contract.expirationDate)}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Signed on {formatDate(contract.signingDate)}
            </p>
            {contract.realFinishedDate && (
              <p className="text-xs text-green-600 mt-1">
                Completed on {formatDate(contract.realFinishedDate)}
              </p>
            )}
            {contract.overdueDays && contract.overdueDays > 0 && (
              <p className="text-xs text-red-600 mt-1">
                Overdue by {contract.overdueDays} {contract.overdueDays === 1 ? 'day' : 'days'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Contract Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Contract Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-sm text-gray-500">Applicant</h3>
              <p>{applicant?.name || 'Unknown'}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Purchaser</h3>
              <p>{purchaser?.name || 'Unknown'}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Company/Firm</h3>
              <p>{company?.name || 'Unknown'}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Total Amount</h3>
              <p>{formatCurrency(contract.totalAmount, contract.currency)}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Paid Amount</h3>
              <p>{formatCurrency(contract.paidAmount, contract.currency)}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Remaining Amount</h3>
              <p>{formatCurrency(contract.totalAmount - contract.paidAmount, contract.currency)}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Signing Date</h3>
              <p>{formatDate(contract.signingDate)}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Expiration Date</h3>
              <p>{formatDate(contract.expirationDate)}</p>
            </div>
            {contract.realFinishedDate && (
              <div>
                <h3 className="font-medium text-sm text-gray-500">Finished Date</h3>
                <p>{formatDate(contract.realFinishedDate)}</p>
              </div>
            )}
            {contract.overdueDays !== undefined && (
              <div>
                <h3 className="font-medium text-sm text-gray-500">Overdue</h3>
                {contract.overdueDays > 0 ? (
                  <p className="text-red-600">
                    {contract.overdueDays} {contract.overdueDays === 1 ? 'day' : 'days'}
                  </p>
                ) : (
                  <p>On time</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Products Table for Product Contracts */}
      {isProductContract && productContract?.contractProducts && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Delivered</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productContract.contractProducts.map((item, index) => {
                    const product = products.find(p => p.id === item.productId);
                    const unit = units.find(u => u.id === product?.unitId);
                    const deliveryPercentage = getDeliveryPercentage(item.quantity, item.deliveredQuantity);
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{product?.name || 'Unknown Product'}</TableCell>
                        <TableCell>{unit?.abbreviation || 'N/A'}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          <div className="w-full">
                            <div className="flex justify-between text-xs mb-1">
                              <span>{item.deliveredQuantity}/{item.quantity}</span>
                              <span>{deliveryPercentage}%</span>
                            </div>
                            <Progress value={deliveryPercentage} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(item.price, contract.currency)}</TableCell>
                        <TableCell>{formatCurrency(item.price * item.quantity, contract.currency)}</TableCell>
                        <TableCell>
                          {item.deliveredQuantity >= item.quantity ? (
                            <Badge className="bg-green-100 text-green-800" variant="outline">
                              Completed
                            </Badge>
                          ) : item.deliveredQuantity > 0 ? (
                            <Badge className="bg-yellow-100 text-yellow-800" variant="outline">
                              Partial
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800" variant="outline">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Payments History */}
      <Tabs defaultValue="payments" className="mb-6">
        <TabsList>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>
        <TabsContent value="payments" className="mt-4">
          <ContractPaymentHistory payments={contract.payments || []} contractCurrency={contract.currency} />
        </TabsContent>
      </Tabs>
    </GuestLayout>
  );
};

export default GuestContractDetail;
