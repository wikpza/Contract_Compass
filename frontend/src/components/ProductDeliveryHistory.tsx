
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProductDelivery } from '@/types';
import { formatDate } from '@/utils/helpers';
import { PackageCheck, PackageX, History } from 'lucide-react';

interface ProductDeliveryHistoryProps {
  deliveries: ProductDelivery[];
  productName: string;
  productUnit: string;
}

export const ProductDeliveryHistory = ({
  deliveries,
  productName,
  productUnit,
}: ProductDeliveryHistoryProps) => {
  // Sort deliveries by date (newest first)
  const sortedDeliveries = [...deliveries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (deliveries.length === 0) {
    return (
      <div className="text-center py-4 text-business-500">
        <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No delivery history found for this product</p>
      </div>
    );
  }

  return (
    <ScrollArea className="w-full overflow-auto">
      <div className="min-w-max">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDeliveries.map((delivery) => (
              <TableRow key={delivery.id}>
                <TableCell>{formatDate(delivery.date)}</TableCell>
                <TableCell>
                  {delivery.type === 'issue' ? (
                    <Badge className="bg-green-100 text-green-800 flex items-center gap-1" variant="outline">
                      <PackageCheck className="h-3 w-3" />
                      Issued
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1" variant="outline">
                      <PackageX className="h-3 w-3" />
                      Returned
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{delivery.quantity} {productUnit}</TableCell>
                <TableCell className="max-w-xs truncate">{delivery.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ScrollArea>
  );
};
