
import React from 'react';
import { Payment } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { Badge } from '@/components/ui/badge';

interface ContractPaymentHistoryProps {
  payments: Payment[];
  contractCurrency: string;
}

export const ContractPaymentHistory = ({ payments, contractCurrency }: ContractPaymentHistoryProps) => {
  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No payment history available
      </div>
    );
  }

  // Sort payments by date (most recent first)
  const sortedPayments = [...payments].sort((a, b) => 
    new Date(b.giveDate).getTime() - new Date(a.giveDate).getTime()
  );

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Exchange Rate</TableHead>
            <TableHead>Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPayments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{formatDate(payment.giveDate)}</TableCell>
              <TableCell className="font-medium">
                {formatCurrency(payment.amount, payment.currency, payment.currency)}
              </TableCell>
              <TableCell>
                <Badge variant={payment.type === 'payment' ? 'default' : 'destructive'}>
                  {payment.type === 'payment' ? 'Payment' : 'Refund'}
                </Badge>
              </TableCell>
              <TableCell>{payment.currency}</TableCell>
              <TableCell>{payment.exchangeRate}</TableCell>
              <TableCell>{payment.note || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
