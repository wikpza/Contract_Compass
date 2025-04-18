
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { CalendarIcon, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Payment } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface ContractPaymentFormProps {
  contractId: string;
  contractCurrency: string;
  remainingAmount: number;
  onPaymentAdded: (payment: Payment) => void;
}

export const ContractPaymentForm = ({
  contractId,
  contractCurrency,
  remainingAmount,
  onPaymentAdded
}: ContractPaymentFormProps) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [note, setNote] = useState<string>('');
  const [paymentType, setPaymentType] = useState<'payment' | 'refund'>('payment');
  const [exchangeRate, setExchangeRate] = useState<string>('1.0');
  const [currency, setCurrency] = useState<string>(contractCurrency);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountValue = parseFloat(amount);
    
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      });
      return;
    }

    if (paymentType === 'payment' && amountValue > remainingAmount) {
      toast({
        title: "Payment exceeds remaining amount",
        description: `Maximum payment amount is ${remainingAmount}`,
        variant: "destructive",
      });
      return;
    }

    const newPayment: Payment = {
      id: uuidv4(),
      contractId,
      amount: amountValue,
      currency,
      exchangeRate: parseFloat(exchangeRate),
      giveDate: paymentDate,
      note: note || undefined,
      type: paymentType,
      createdAt: new Date(),
    };

    onPaymentAdded(newPayment);
    
    // Reset form
    setAmount('');
    setNote('');
    
    toast({
      title: `${paymentType === 'payment' ? 'Payment' : 'Refund'} recorded`,
      description: `Successfully recorded ${paymentType} of ${amountValue} ${currency}`,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              className="pl-9"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="paymentType">Payment Type</Label>
          <Select value={paymentType} onValueChange={(value: 'payment' | 'refund') => setPaymentType(value)}>
            <SelectTrigger id="paymentType">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="payment">Payment</SelectItem>
              <SelectItem value="refund">Refund</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger id="currency">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="CAD">CAD</SelectItem>
              <SelectItem value="AUD">AUD</SelectItem>
              <SelectItem value="JPY">JPY</SelectItem>
              <SelectItem value="CNY">CNY</SelectItem>
              <SelectItem value="RUB">RUB</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="exchangeRate">Exchange Rate</Label>
          <Input
            id="exchangeRate"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="1.0"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(e.target.value)}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="paymentDate">Payment Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !paymentDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {paymentDate ? format(paymentDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={paymentDate}
              onSelect={(date) => date && setPaymentDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="note">Note (Optional)</Label>
        <Textarea
          id="note"
          placeholder="Add any additional details about this payment"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      
      <Button type="submit" className="w-full">
        Record {paymentType === 'payment' ? 'Payment' : 'Refund'}
      </Button>
    </form>
  );
};
