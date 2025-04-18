import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
import { ArrowLeftCircle } from 'lucide-react';
import { 
  projects, 
  applicants, 
  purchasers, 
  companies, 
  products,
  productContracts,
  serviceContracts
} from '@/data/mockData';

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

const NewContract = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const project = projects.find(p => p.id === projectId);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'product',
      applicantId: '',
      purchaserId: '',
      companyId: '',
      totalAmount: 0,
      currency: 'USD',
      secondCurrency: 'EUR',
      exchangeRate: 1.0,
      paidAmount: 0,
      signingDate: new Date().toISOString().split('T')[0],
      expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
      description: '',
      status: 'draft',
      overdueDays: 0,
      realFinishedDate: null
    },
  });
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const newId = (Math.max(
      ...productContracts.map(c => parseInt(c.id)), 
      ...serviceContracts.map(c => parseInt(c.id))
    ) + 1).toString();
    
    toast({
      title: "Contract Created",
      description: `New ${values.type} contract has been created successfully.`,
    });
    
    navigate(`/projects/${projectId}`);
  };
  
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <h2 className="text-2xl font-bold">Project Not Found</h2>
        <p className="text-muted-foreground mt-2 mb-6">The project you're trying to add a contract to doesn't exist.</p>
        <Button asChild>
          <Link to="/projects">Back to Projects</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <div className="flex items-center mb-6">
        <Button variant="ghost" asChild className="mr-4">
          <Link to={`/projects/${projectId}`}>
            <ArrowLeftCircle className="h-4 w-4 mr-2" />
            Back to Project
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-business-800">
          Add New Contract
        </h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Contract Details</CardTitle>
          <CardDescription>
            Create a new contract for project: {project.name}
          </CardDescription>
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
                  onClick={() => navigate(`/projects/${projectId}`)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Contract</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};

export default NewContract;
