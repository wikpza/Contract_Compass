import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeftCircle, Trash, AlertTriangle } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { 
  projects, 
  applicants, 
  purchasers, 
  companies, 
  products,
  productContracts,
  serviceContracts
} from '@/data/mockData';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';

const formSchema = z.object({
  type: z.enum(['product', 'service']),
  applicantId: z.string().min(1, "Applicant is required"),
  purchaserId: z.string().min(1, "Purchaser is required"),
  companyId: z.string().min(1, "Company is required"),
  totalAmount: z.coerce.number().positive("Total amount must be positive"),
  currency: z.string().min(1, "Currency is required"),
  secondCurrency: z.string().min(1, "Second currency is required"),
  exchangeRate: z.coerce.number().positive("Exchange rate must be positive"),
  paidAmount: z.coerce.number().min(0, "Paid amount cannot be negative"),
  signingDate: z.string().min(1, "Signing date is required"),
  expirationDate: z.string().min(1, "Expiration date is required"),
  description: z.string().optional(),
  realFinishedDate: z.string().optional().nullable(),
  overdueDays: z.coerce.number().min(0).optional(),
  status: z.enum(['draft', 'active', 'completed', 'overdue', 'cancelled']).optional()
});

const EditContract = () => {
  const { projectId, contractId } = useParams<{ projectId: string, contractId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  // Find project
  const project = projects.find(p => p.id === projectId);
  
  // Find contract
  const productContract = productContracts.find(c => c.id === contractId && c.projectId === projectId);
  const serviceContract = serviceContracts.find(c => c.id === contractId && c.projectId === projectId);
  
  const contract = productContract || serviceContract;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: contract?.type || 'product',
      applicantId: contract?.applicantId || '',
      purchaserId: contract?.purchaserId || '',
      companyId: contract?.companyId || '',
      totalAmount: contract?.totalAmount || 0,
      currency: contract?.currency || 'USD',
      secondCurrency: contract?.secondCurrency || 'EUR',
      exchangeRate: contract?.exchangeRate || 1.0,
      paidAmount: contract?.paidAmount || 0,
      signingDate: contract?.signingDate ? new Date(contract.signingDate).toISOString().split('T')[0] : '',
      expirationDate: contract?.expirationDate ? new Date(contract.expirationDate).toISOString().split('T')[0] : '',
      description: contract?.type === 'service' ? (serviceContract?.description || '') : '',
      realFinishedDate: contract?.realFinishedDate ? new Date(contract.realFinishedDate).toISOString().split('T')[0] : null,
      overdueDays: contract?.overdueDays || 0,
      status: contract?.status || 'active',
    },
  });
  
  useEffect(() => {
    // Update form when contract is loaded
    if (contract) {
      form.reset({
        type: contract.type,
        applicantId: contract.applicantId,
        purchaserId: contract.purchaserId,
        companyId: contract.companyId,
        totalAmount: contract.totalAmount,
        currency: contract.currency,
        secondCurrency: contract.secondCurrency,
        exchangeRate: contract.exchangeRate,
        paidAmount: contract.paidAmount,
        signingDate: new Date(contract.signingDate).toISOString().split('T')[0],
        expirationDate: new Date(contract.expirationDate).toISOString().split('T')[0],
        description: contract.type === 'service' ? (serviceContract?.description || '') : '',
        realFinishedDate: contract.realFinishedDate ? new Date(contract.realFinishedDate).toISOString().split('T')[0] : null,
        overdueDays: contract.overdueDays || 0,
        status: contract.status || 'active',
      });
    }
  }, [contract, form, serviceContract]);
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // In a real application, this would update data in a backend
    // For demo purposes, we'll just show a success message and navigate
    
    toast({
      title: "Contract Updated",
      description: `The ${values.type} contract has been updated successfully.`,
    });
    
    // Navigate back to project page
    navigate(`/projects/${projectId}`);
  };
  
  const handleCancel = () => {
    // In a real app, this would update the status in the backend
    toast({
      title: "Contract Canceled",
      description: "The contract has been canceled successfully.",
      variant: "destructive",
    });
    
    // Navigate back to project page
    navigate(`/projects/${projectId}`);
  };
  
  if (!project || !contract) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <AlertTriangle className="h-16 w-16 text-business-300 mb-4" />
        <h2 className="text-2xl font-bold">Contract Not Found</h2>
        <p className="text-muted-foreground mt-2 mb-6">The contract you're trying to edit doesn't exist.</p>
        <Button asChild>
          <Link to={`/projects/${projectId}`}>Back to Project</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <div className="flex items-center mb-6">
        <Button variant="ghost" asChild className="mr-4">
          <Link to={`/projects/${projectId}/contracts/${contractId}`}>
            <ArrowLeftCircle className="h-4 w-4 mr-2" />
            Back to Contract Details
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-business-800">
          Edit Contract
        </h1>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Contract Details</CardTitle>
            <CardDescription>
              Edit contract for project: {project.name}
            </CardDescription>
          </div>
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
                <Button variant="destructive" onClick={handleCancel}>
                  Yes, Cancel Contract
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={true} // Cannot change contract type after creation
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select contract type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="product">Product Contract</SelectItem>
                          <SelectItem value="service">Service Contract</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="applicantId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Applicant</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select applicant" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {applicants.map(applicant => (
                            <SelectItem key={applicant.id} value={applicant.id}>{applicant.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="purchaserId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchaser</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select purchaser" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {purchasers.map(purchaser => (
                            <SelectItem key={purchaser.id} value={purchaser.id}>{purchaser.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company/Firm</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies.map(company => (
                            <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              
                <FormField
                  control={form.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Currency</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="RUB">RUB - Russian Ruble</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="secondCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary Currency</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select secondary currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="RUB">RUB - Russian Ruble</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="exchangeRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exchange Rate</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="paidAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paid Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="signingDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Signing Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="expirationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiration Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="realFinishedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Actual Finish Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          value={field.value || ''} 
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="overdueDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Overdue Days</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter contract description and additional details"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate(`/projects/${projectId}/contracts/${contractId}`)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Contract</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {contract.type === 'product' && productContract && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>Products included in this contract</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
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
                    render: (price, item) => (
                      <div>
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: contract.currency
                        }).format(price)}
                      </div>
                    ),
                  },
                  {
                    header: 'Quantity',
                    accessor: 'quantity',
                    render: (quantity, item) => (
                      <div>{quantity} {item.product.unit}</div>
                    ),
                  },
                  {
                    header: 'Total',
                    accessor: 'total',
                    render: (_, item) => (
                      <div>
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: contract.currency
                        }).format(item.price * item.quantity)}
                      </div>
                    ),
                  },
                  {
                    header: 'Delivered',
                    accessor: 'deliveredQuantity',
                    render: (delivered, item) => (
                      <div>{delivered} {item.product.unit}</div>
                    ),
                  },
                ]}
                data={productContract.contractProducts}
                hideActions={true}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default EditContract;
