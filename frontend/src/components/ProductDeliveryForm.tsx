
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PackageCheck, PackageX } from 'lucide-react';
import { ProductDelivery } from '@/types';

interface ProductDeliveryFormProps {
  contractProductId: string;
  productName: string;
  productUnit: string;
  maxQuantity: number;
  onDeliveryAdded: (delivery: ProductDelivery) => void;
}

export const ProductDeliveryForm = ({
  contractProductId,
  productName,
  productUnit,
  maxQuantity,
  onDeliveryAdded,
}: ProductDeliveryFormProps) => {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState<number>(1);
  const [type, setType] = useState<'issue' | 'return'>('issue');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (quantity <= 0) {
      toast({
        title: "Invalid quantity",
        description: "Quantity must be greater than zero",
        variant: "destructive",
      });
      return;
    }

    if (quantity > maxQuantity && type === 'issue') {
      toast({
        title: "Quantity exceeds limit",
        description: `You cannot issue more than ${maxQuantity} remaining units`,
        variant: "destructive",
      });
      return;
    }
    
    // Create a new delivery record
    const newDelivery: ProductDelivery = {
      id: `del-${Date.now()}`, // Generate a temporary ID
      contractProductId,
      quantity,
      date: new Date(),
      type,
      notes,
      createdAt: new Date(),
    };
    
    // Call the callback function to update the parent component
    onDeliveryAdded(newDelivery);
    
    // Reset form
    setQuantity(1);
    setNotes('');
    
    // Show success message
    toast({
      title: `Product ${type === 'issue' ? 'Issued' : 'Returned'} Successfully`,
      description: `${quantity} ${productUnit} of ${productName} has been ${type === 'issue' ? 'issued' : 'returned'}`,
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Transaction Type</Label>
          <Select value={type} onValueChange={(value) => setType(value as 'issue' | 'return')}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="issue">
                <div className="flex items-center">
                  <PackageCheck className="mr-2 h-4 w-4" />
                  <span>Issue Products</span>
                </div>
              </SelectItem>
              <SelectItem value="return">
                <div className="flex items-center">
                  <PackageX className="mr-2 h-4 w-4" />
                  <span>Return Products</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="quantity">{`Quantity (${productUnit})`}</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            max={type === 'issue' ? maxQuantity : undefined}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Add any additional information about this transaction"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      
      <Button type="submit">
        {type === 'issue' ? (
          <>
            <PackageCheck className="mr-2 h-4 w-4" />
            Issue Products
          </>
        ) : (
          <>
            <PackageX className="mr-2 h-4 w-4" />
            Return Products
          </>
        )}
      </Button>
    </form>
  );
};
