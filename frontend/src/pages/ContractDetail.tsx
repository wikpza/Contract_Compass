import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  productContracts, serviceContracts, projects, applicants, 
  purchasers, companies, units, contractPayments
} from '@/data/mockData';
import { ProductDelivery, Payment } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ProductDeliveryForm } from '@/components/ProductDeliveryForm';
import { ProductDeliveryHistory } from '@/components/ProductDeliveryHistory';
import { ContractPaymentForm } from '@/components/ContractPaymentForm';
import { ContractPaymentHistory } from '@/components/ContractPaymentHistory';
import { 
  FileText, 
  DownloadCloud, 
  ExternalLink, 
  AlertCircle, 
  ArrowLeftCircle,
  FileUp,
  Link as LinkIcon,
  Upload,
  Edit,
  Trash,
  Package,
  CheckCircle,
  XCircle,
  DollarSign,
  History
} from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { Checkbox } from '@/components/ui/checkbox';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { formatDate, formatCurrency, calculateRemainingBalance, getPaymentPercentage, getDeliveryPercentage } from '@/utils/helpers';

const ContractDetail = () => {
  const { projectId, contractId } = useParams<{ projectId: string; contractId: string }>();
  const { toast } = useToast();
  
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [documentLink, setDocumentLink] = useState<string | null>(null);
  const [description, setDescription] = useState<string>('');
  const [isEditingDescription, setIsEditingDescription] = useState<boolean>(false);
  const [showCancelDialog, setShowCancelDialog] = useState<boolean>(false);
  
  const [productDeliveries, setProductDeliveries] = useState<{[key: string]: ProductDelivery[]}>({});
  
  const [payments, setPayments] = useState<Payment[]>([]);
  
  const project = projects.find(p => p.id === projectId);
  
  const productContract = productContracts.find(c => c.id === contractId && c.projectId === projectId);
  const serviceContract = serviceContracts.find(c => c.id === contractId && c.projectId === projectId);
  
  const contract = productContract || serviceContract;
  
  const applicant = contract ? applicants.find(a => a.id === contract.applicantId) : null;
  const purchaser = contract ? purchasers.find(p => p.id === contract.purchaserId) : null;
  const company = contract ? companies.find(c => c.id === contract.companyId) : null;
  
  useEffect(() => {
    if (contract) {
      const contractPaymentsList = contractPayments.filter(p => p.contractId === contract.id);
      setPayments(contractPaymentsList);
    }
  }, [contract]);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const mockUrl = URL.createObjectURL(file);
      setDocumentUrl(mockUrl);
      toast({
        title: "Document Uploaded",
        description: `${file.name} has been uploaded successfully.`
      });
    }
  };
  
  const handleUpdateLink = (newLink: string) => {
    setDocumentLink(newLink);
    toast({
      title: "Document Link Updated",
      description: "The document link has been updated successfully."
    });
  };

  const handleSaveDescription = () => {
    setIsEditingDescription(false);
    toast({
      title: "Description Updated",
      description: "The contract description has been updated successfully."
    });
  };
  
  const handleCancelContract = () => {
    toast({
      title: "Contract Canceled",
      description: "The contract has been canceled successfully.",
      variant: "destructive",
    });
    
    window.location.href = `/projects/${projectId}`;
  };

  const handlePaymentAdded = (payment: Payment) => {
    setPayments(prev => [...prev, payment]);
    
    if (payment.type === 'payment') {
      if (contract) {
        contract.paidAmount += payment.amount;
      }
    } else if (payment.type === 'refund') {
      if (contract) {
        contract.paidAmount = Math.max(0, contract.paidAmount - payment.amount);
      }
    }
  };

  const handleDeliveryAdded = (contractProductId: string, delivery: ProductDelivery) => {
    setProductDeliveries(prev => {
      const existingDeliveries = prev[contractProductId] || [];
      return {
        ...prev,
        [contractProductId]: [...existingDeliveries, delivery]
      };
    });
  };

  const getUnitById = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    return unit ? unit.abbreviation : '';
  };
  
  if (!project || !contract) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <AlertCircle className="h-16 w-16 text-business-300 mb-4" />
        <h2 className="text-2xl font-bold">Contract Not Found</h2>
        <p className="text-muted-foreground mt-2 mb-6">The contract you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to={`/projects/${projectId}`}>Back to Project</Link>
        </Button>
      </div>
    );
  }
  
  const remainingBalance = calculateRemainingBalance(contract.totalAmount, contract.paidAmount);
  const paymentPercentage = getPaymentPercentage(contract.totalAmount, contract.paidAmount);

  useEffect(() => {
    if (contract.type === 'service' && serviceContract) {
      setDescription(serviceContract.description);
    } else if (contract.type === 'product' && productContract) {
      setDescription(description || 'No description available');
    }
  }, [contract, serviceContract, productContract, description]);
  
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" asChild className="mr-4">
            <Link to={`/projects/${projectId}`}>
              <ArrowLeftCircle className="h-4 w-4 mr-2" />
              Back to Project
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-business-800">
            {contract.type === 'product' ? 'Product Contract' : 'Service Contract'}
          </h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link to={`/projects/${projectId}/contracts/edit/${contractId}`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Contract
            </Link>
          </Button>
          <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash className="h-4 w-4 mr-2" />
                Cancel Contract
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel Contract</DialogTitle>
                <DialogDescription>
                  Are you sure you want to cancel this contract? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                  No, Keep Contract
                </Button>
                <Button variant="destructive" onClick={handleCancelContract}>
                  Yes, Cancel Contract
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-business-500">Project</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-semibold">{project.name}</h3>
            <p className="text-sm text-muted-foreground">{project.description}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-business-500">Contract Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(contract.totalAmount, contract.currency)}
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Paid: {formatCurrency(contract.paidAmount, contract.currency)}</span>
                <span>{paymentPercentage}%</span>
              </div>
              <Progress value={paymentPercentage} className="h-2" />
              <p className="text-sm mt-2">
                Remaining: <span className="font-medium">{formatCurrency(remainingBalance, contract.currency)}</span>
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-business-500">Contract Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-business-500">Signed</div>
                <div className="font-medium">{formatDate(contract.signingDate)}</div>
              </div>
              <div className="text-center border-r border-business-200 h-8"></div>
              <div>
                <div className="text-sm text-business-500">Expires</div>
                <div className="font-medium">{formatDate(contract.expirationDate)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Contract Description</CardTitle>
            <CardDescription>Overview of the contract purpose and terms</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsEditingDescription(!isEditingDescription)}>
            <Edit className="h-4 w-4 mr-2" />
            {isEditingDescription ? 'Cancel' : 'Edit'}
          </Button>
        </CardHeader>
        <CardContent>
          {isEditingDescription ? (
            <div className="space-y-4">
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px]"
                placeholder="Enter contract description..."
              />
              <Button onClick={handleSaveDescription}>Save Description</Button>
            </div>
          ) : (
            <div className="prose">
              {description || "No description provided for this contract."}
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-business-500">Applicant</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="font-medium">{applicant?.name}</h3>
            <p className="text-sm text-business-500">{applicant?.email}</p>
            <p className="text-sm text-business-500">{applicant?.phone}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-business-500">Purchaser</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="font-medium">{purchaser?.name}</h3>
            <p className="text-sm text-business-500">{purchaser?.email}</p>
            <p className="text-sm text-business-500">{purchaser?.phone}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-business-500">Company/Firm</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="font-medium">{company?.name}</h3>
            <p className="text-sm text-business-500">{company?.email}</p>
            <p className="text-sm text-business-500">{company?.phone}</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Contract Documents</CardTitle>
            <CardDescription>Upload or link to contract documents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-md p-4 flex justify-between items-center">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-business-600 mr-2" />
                <div>
                  <h4 className="text-sm font-medium">Contract Document</h4>
                  <p className="text-xs text-business-500">
                    {documentUrl ? 'Document uploaded' : 'No document uploaded yet'}
                  </p>
                </div>
              </div>
              <div>
                <Input 
                  id="document-upload" 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.doc,.docx" 
                  onChange={handleFileUpload}
                />
                <Button variant="outline" asChild>
                  <label htmlFor="document-upload" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </label>
                </Button>
              </div>
            </div>
            
            <div className="border rounded-md p-4 flex justify-between items-center">
              <div className="flex items-center">
                <LinkIcon className="h-5 w-5 text-business-600 mr-2" />
                <div>
                  <h4 className="text-sm font-medium">External Document Link</h4>
                  <p className="text-xs text-business-500 max-w-[250px] truncate">
                    {documentLink || contract.documentLink || 'No link provided'}
                  </p>
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Add Link
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Document Link</DialogTitle>
                    <DialogDescription>
                      Enter a URL to link to an external document.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="link">Document Link</Label>
                      <Input
                        id="link"
                        placeholder="https://example.com/document.pdf"
                        defaultValue={documentLink || contract.documentLink || ''}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => {
                        const linkInput = document.getElementById('link') as HTMLInputElement;
                        handleUpdateLink(linkInput.value);
                      }}
                    >
                      Save Link
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Financial Details</CardTitle>
            <CardDescription>Currency and payment information</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Currency</TableCell>
                  <TableCell>{contract.currency}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Exchange Rate</TableCell>
                  <TableCell>{contract.exchangeRate}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Total Amount</TableCell>
                  <TableCell>{formatCurrency(contract.totalAmount, contract.currency)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Paid Amount</TableCell>
                  <TableCell>{formatCurrency(contract.paidAmount, contract.currency)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Balance</TableCell>
                  <TableCell>{formatCurrency(remainingBalance, contract.currency)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Payment Management</CardTitle>
          <CardDescription>View payment history and make new payments</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="history">
            <TabsList>
              <TabsTrigger value="history" className="flex items-center">
                <History className="h-4 w-4 mr-2" />
                Payment History
              </TabsTrigger>
              <TabsTrigger value="add" className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Make a Payment
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="history" className="pt-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Contract Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(contract.totalAmount, contract.currency)}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(contract.paidAmount, contract.currency)}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Remaining Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(remainingBalance, contract.currency)}
                      </div>
                      <div className="mt-2">
                        <Progress value={paymentPercentage} className="h-2" />
                        <div className="text-xs mt-1 text-right">
                          {paymentPercentage}% paid
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <ContractPaymentHistory payments={payments} contractCurrency={contract.currency} />
              </div>
            </TabsContent>
            
            <TabsContent value="add" className="pt-4">
              <div className="max-w-md mx-auto">
                <ContractPaymentForm
                  contractId={contract.id}
                  contractCurrency={contract.currency}
                  remainingAmount={remainingBalance}
                  onPaymentAdded={handlePaymentAdded}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {contract.type === 'product' && productContract && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Product Summary</CardTitle>
            <CardDescription>Overview of products in this contract</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-md flex items-center">
                <div className="bg-green-100 rounded-full p-3 mr-3">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-green-600">Total Products</p>
                  <p className="text-xl font-semibold">{productContract.contractProducts.length} types</p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md flex items-center">
                <div className="bg-blue-100 rounded-full p-3 mr-3">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-600">Total Quantity</p>
                  <p className="text-xl font-semibold">
                    {productContract.contractProducts.reduce((sum, product) => sum + product.quantity, 0)} units
                  </p>
                </div>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-md flex items-center">
                <div className="bg-amber-100 rounded-full p-3 mr-3">
                  <XCircle className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-amber-600">Remaining to Issue</p>
                  <p className="text-xl font-semibold">
                    {productContract.contractProducts.reduce((sum, product) => sum + (product.quantity - product.deliveredQuantity), 0)} units
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {contract.type === 'product' && productContract && (
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>Products included in this contract</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="products">
              <TabsList>
                <TabsTrigger value="products">Product List</TabsTrigger>
                <TabsTrigger value="delivery">Manage Deliveries</TabsTrigger>
              </TabsList>
              
              <TabsContent value="products" className="pt-4">
                <DataTable
                  columns={[
                    {
                      header: 'Product',
                      accessor: 'product',
                      render: (_, item) => (
                        <div>
                          <div className="font-medium">{item.product.name}</div>
                          <div className="text-sm text-business-500">{item.product.description}</div>
                        </div>
                      ),
                    },
                    {
                      header: 'Unit Price',
                      accessor: 'price',
                      render: (price) => formatCurrency(price, contract.currency),
                    },
                    {
                      header: 'Quantity',
                      accessor: 'quantity',
                      render: (quantity, item) => {
                        const unitAbbr = getUnitById(item.product.unitId);
                        return `${quantity} ${unitAbbr}`;
                      },
                    },
                    {
                      header: 'Total',
                      accessor: 'total',
                      render: (_, item) => formatCurrency(item.price * item.quantity, contract.currency),
                    },
                    {
                      header: 'Delivered',
                      accessor: 'deliveredQuantity',
                      render: (delivered, item) => `${delivered} ${item.product.unit}`,
                    },
                    {
                      header: 'Delivery Status',
                      accessor: 'deliveryStatus',
                      render: (_, item) => {
                        const deliveryPercentage = getDeliveryPercentage(item.quantity, item.deliveredQuantity);
                        return (
                          <div className="w-full">
                            <div className="flex justify-between text-xs mb-1">
                              <span>{deliveryPercentage}%</span>
                              <span>{item.deliveredQuantity}/{item.quantity}</span>
                            </div>
                            <Progress value={deliveryPercentage} className="h-2" />
                          </div>
                        );
                      },
                    },
                  ]}
                  data={productContract.contractProducts}
                  hideActions={true}
                />
              </TabsContent>
              
              <TabsContent value="delivery" className="pt-4">
                <Carousel className="mb-6">
                  <CarouselContent>
                    {productContract.contractProducts.map((product) => {
                      const unitAbbr = getUnitById(product.product.unitId);
                      return (
                        <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle>{product.product.name}</CardTitle>
                              <CardDescription>
                                {product.deliveredQuantity} of {product.quantity} {unitAbbr} delivered
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="mb-4">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Delivered</span>
                                  <span>{getDeliveryPercentage(product.quantity, product.deliveredQuantity)}%</span>
                                </div>
                                <Progress 
                                  value={getDeliveryPercentage(product.quantity, product.deliveredQuantity)} 
                                  className="h-2 mb-2" 
                                />
                                <div className="text-sm text-business-500">
                                  Remaining: {product.quantity - product.deliveredQuantity} {unitAbbr}
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="pt-0">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" className="w-full">Manage Deliveries</Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                  <DialogHeader>
                                    <DialogTitle>Manage Product Deliveries</DialogTitle>
                                    <DialogDescription>
                                      Record product issues or returns for {product.product.name}
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  <Tabs defaultValue="add" className="mt-4">
                                    <TabsList className="grid w-full grid-cols-2">
                                      <TabsTrigger value="add">Add New Transaction</TabsTrigger>
                                      <TabsTrigger value="history">Delivery History</TabsTrigger>
                                    </TabsList>
                                    
                                    <TabsContent value="add" className="pt-4">
                                      <ProductDeliveryForm
                                        contractProductId={product.id}
                                        productName={product.product.name}
                                        productUnit={unitAbbr}
                                        maxQuantity={product.quantity - product.deliveredQuantity}
                                        onDeliveryAdded={(delivery) => handleDeliveryAdded(product.id, delivery)}
                                      />
                                    </TabsContent>
                                    
                                    <TabsContent value="history" className="pt-4">
                                      <ProductDeliveryHistory
                                        deliveries={productDeliveries[product.id] || []}
                                        productName={product.product.name}
                                        productUnit={unitAbbr}
                                      />
                                    </TabsContent>
                                  </Tabs>
                                </DialogContent>
                              </Dialog>
                            </CardFooter>
                          </Card>
                        </CarouselItem>
                      );
                    })}
                  </CarouselContent>
                </Carousel>
                
                <div className="rounded-md border bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity (Total)</TableHead>
                        <TableHead>Delivered</TableHead>
                        <TableHead>Remaining</TableHead>
                        <TableHead>Delivery Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productContract.contractProducts.map((product) => {
                        const unitAbbr = getUnitById(product.product.unitId);
                        return (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.product.name}</TableCell>
                            <TableCell>{product.quantity} {unitAbbr}</TableCell>
                            <TableCell>{product.deliveredQuantity} {unitAbbr}</TableCell>
                            <TableCell>{product.quantity - product.deliveredQuantity} {unitAbbr}</TableCell>
                            <TableCell>
                              <div className="w-full">
                                <Progress 
                                  value={getDeliveryPercentage(product.quantity, product.deliveredQuantity)} 
                                  className="h-2" 
                                />
                                <div className="text-xs mt-1">
                                  {getDeliveryPercentage(product.quantity, product.deliveredQuantity)}% complete
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Package className="h-4 w-4 mr-2" />
                                    Manage
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                  <DialogHeader>
                                    <DialogTitle>Manage Product Deliveries</DialogTitle>
                                    <DialogDescription>
                                      Record product issues or returns for {product.product.name}
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  <Tabs defaultValue="add" className="mt-4">
                                    <TabsList className="grid w-full grid-cols-2">
                                      <TabsTrigger value="add">Add New Transaction</TabsTrigger>
                                      <TabsTrigger value="history">Delivery History</TabsTrigger>
                                    </TabsList>
                                    
                                    <TabsContent value="add" className="pt-4">
                                      <ProductDeliveryForm
                                        contractProductId={product.id}
                                        productName={product.product.name}
                                        productUnit={unitAbbr}
                                        maxQuantity={product.quantity - product.deliveredQuantity}
                                        onDeliveryAdded={(delivery) => handleDeliveryAdded(product.id, delivery)}
                                      />
                                    </TabsContent>
                                    
                                    <TabsContent value="history" className="pt-4">
                                      <ProductDeliveryHistory
                                        deliveries={productDeliveries[product.id] || []}
                                        productName={product.product.name}
                                        productUnit={unitAbbr}
                                      />
                                    </TabsContent>
                                  </Tabs>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
      
      {contract.type === 'service' && serviceContract && (
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-business-600">{serviceContract.description}</p>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ContractDetail;
