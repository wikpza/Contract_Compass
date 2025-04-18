
import React, { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Currency } from '@/types';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useToast } from '@/hooks/use-toast';

// Mock data for currencies
const mockCurrencies: Currency[] = [
  {
    id: '1',
    name: 'US Dollar',
    code: 'USD',
    symbol: '$',
    createdAt: new Date('2023-01-01'),
  },
  {
    id: '2',
    name: 'Euro',
    code: 'EUR',
    symbol: '€',
    createdAt: new Date('2023-01-02'),
  },
  {
    id: '3',
    name: 'British Pound',
    code: 'GBP',
    symbol: '£',
    createdAt: new Date('2023-01-03'),
  },
  {
    id: '4',
    name: 'Japanese Yen',
    code: 'JPY',
    symbol: '¥',
    createdAt: new Date('2023-01-04'),
  },
];

const Currencies = () => {
  const [currencies, setCurrencies] = useState<Currency[]>(mockCurrencies);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState<Currency | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    symbol: '',
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ name: '', code: '', symbol: '' });
    setCurrentCurrency(null);
  };

  const handleSubmit = () => {
    // Validate form
    if (!formData.name || !formData.code || !formData.symbol) {
      toast("Please fill all fields", {
        description: "All fields are required"
      });
      return;
    }

    // If editing existing currency
    if (currentCurrency) {
      const updatedCurrencies = currencies.map(c => 
        c.id === currentCurrency.id ? { 
          ...c, 
          name: formData.name, 
          code: formData.code, 
          symbol: formData.symbol 
        } : c
      );
      setCurrencies(updatedCurrencies);
      toast.success("Currency updated successfully");
    } else {
      // If adding new currency
      const newCurrency: Currency = {
        id: `${currencies.length + 1}`,
        name: formData.name,
        code: formData.code,
        symbol: formData.symbol,
        createdAt: new Date(),
      };
      setCurrencies([...currencies, newCurrency]);
      toast.success("Currency added successfully");
    }
    
    setIsOpen(false);
    resetForm();
  };

  const handleEdit = (currency: Currency) => {
    setCurrentCurrency(currency);
    setFormData({
      name: currency.name,
      code: currency.code,
      symbol: currency.symbol,
    });
    setIsOpen(true);
  };

  const handleDelete = (currency: Currency) => {
    setCurrentCurrency(currency);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (currentCurrency) {
      const filteredCurrencies = currencies.filter(c => c.id !== currentCurrency.id);
      setCurrencies(filteredCurrencies);
      toast.success("Currency deleted successfully");
      setIsDeleteDialogOpen(false);
      setCurrentCurrency(null);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Code', accessor: 'code' },
    { 
      header: 'Symbol', 
      accessor: 'symbol',
      render: (value: string) => <span className="text-lg">{value}</span>
    },
    { 
      header: 'Created', 
      accessor: 'createdAt',
      render: (value: Date) => value.toLocaleDateString()
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Currency Management"
        description="Manage currencies used throughout the application"
        action={{
          label: "Add Currency",
          href: "#",
          icon: <PlusCircle className="h-4 w-4" />,
        }}
      />

      <div className="bg-white rounded-lg shadow-sm p-6 mt-4">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsOpen(true); }}>
              <PlusCircle className="h-4 w-4 mr-2" /> Add Currency
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{currentCurrency ? 'Edit Currency' : 'Add New Currency'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="US Dollar"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">
                  Code
                </Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="USD"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="symbol" className="text-right">
                  Symbol
                </Label>
                <Input
                  id="symbol"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleInputChange}
                  placeholder="$"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSubmit}>
                {currentCurrency ? 'Update' : 'Add'} Currency
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the currency{" "}
                <span className="font-semibold">{currentCurrency?.name}</span>.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="mt-6">
          <DataTable
            columns={columns}
            data={currencies}
            onEdit={handleEdit}
            onDelete={handleDelete}
            hideActions={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Currencies;
