import React from 'react';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {formatCurrency} from "@/utils/helpers.ts";
export type Props = {
    contractAmount:number,
    paidAmount:number,
    contractCurrency:{id:number, name:string, symbol:string, code:string},
    projectCurrency:{id:number, name:string, symbol:string, code:string},
    exchangeRate:number
}
const FinancialDetail = ({contractAmount, paidAmount, contractCurrency, projectCurrency, exchangeRate}:Props) => {


    return (
        <div>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {/*<Card>*/}
              {/*  <CardHeader>*/}
              {/*    <CardTitle>Contract Documents</CardTitle>*/}
              {/*    <CardDescription>Upload or link to contract documents</CardDescription>*/}
              {/*  </CardHeader>*/}
              {/*  <CardContent className="space-y-4">*/}
              {/*    <div className="border rounded-md p-4 flex justify-between items-center">*/}
              {/*      <div className="flex items-center">*/}
              {/*        <FileText className="h-5 w-5 text-business-600 mr-2" />*/}
              {/*        <div>*/}
              {/*          <h4 className="text-sm font-medium">Contract Document</h4>*/}
              {/*          <p className="text-xs text-business-500">*/}
              {/*            {documentUrl ? 'Document uploaded' : 'No document uploaded yet'}*/}
              {/*          </p>*/}
              {/*        </div>*/}
              {/*      </div>*/}
              {/*      <div>*/}
              {/*        <Input*/}
              {/*          id="document-upload"*/}
              {/*          type="file"*/}
              {/*          className="hidden"*/}
              {/*          accept=".pdf,.doc,.docx"*/}
              {/*          onChange={handleFileUpload}*/}
              {/*        />*/}
              {/*        <Button variant="outline" asChild>*/}
              {/*          <label htmlFor="document-upload" className="cursor-pointer">*/}
              {/*            <Upload className="h-4 w-4 mr-2" />*/}
              {/*            Upload*/}
              {/*          </label>*/}
              {/*        </Button>*/}
              {/*      </div>*/}
              {/*    </div>*/}

              {/*    <div className="border rounded-md p-4 flex justify-between items-center">*/}
              {/*      <div className="flex items-center">*/}
              {/*        <LinkIcon className="h-5 w-5 text-business-600 mr-2" />*/}
              {/*        <div>*/}
              {/*          <h4 className="text-sm font-medium">External Document Link</h4>*/}
              {/*          <p className="text-xs text-business-500 max-w-[250px] truncate">*/}
              {/*            {documentLink || contract.documentLink || 'No link provided'}*/}
              {/*          </p>*/}
              {/*        </div>*/}
              {/*      </div>*/}
              {/*      <Dialog>*/}
              {/*        <DialogTrigger asChild>*/}
              {/*          <Button variant="outline">*/}
              {/*            <LinkIcon className="h-4 w-4 mr-2" />*/}
              {/*            Add Link*/}
              {/*          </Button>*/}
              {/*        </DialogTrigger>*/}
              {/*        <DialogContent>*/}
              {/*          <DialogHeader>*/}
              {/*            <DialogTitle>Add Document Link</DialogTitle>*/}
              {/*            <DialogDescription>*/}
              {/*              Enter a URL to link to an external document.*/}
              {/*            </DialogDescription>*/}
              {/*          </DialogHeader>*/}
              {/*          <div className="space-y-4 py-4">*/}
              {/*            <div className="space-y-2">*/}
              {/*              <Label htmlFor="link">Document Link</Label>*/}
              {/*              <Input*/}
              {/*                id="link"*/}
              {/*                placeholder="https://example.com/document.pdf"*/}
              {/*                defaultValue={documentLink || contract.documentLink || ''}*/}
              {/*              />*/}
              {/*            </div>*/}
              {/*          </div>*/}
              {/*          <div className="flex justify-end">*/}
              {/*            <Button*/}
              {/*              onClick={() => {*/}
              {/*                const linkInput = document.getElementById('link') as HTMLInputElement;*/}
              {/*                handleUpdateLink(linkInput.value);*/}
              {/*              }}*/}
              {/*            >*/}
              {/*              Save Link*/}
              {/*            </Button>*/}
              {/*          </div>*/}
              {/*        </DialogContent>*/}
              {/*      </Dialog>*/}
              {/*    </div>*/}
              {/*  </CardContent>*/}
              {/*</Card>*/}

              <Card>
                <CardHeader>
                  <CardTitle>Финансы</CardTitle>
                  <CardDescription>Информация о валюте и статусе контракта</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Валюта</TableCell>
                        <TableCell>{contractCurrency.name}</TableCell>
                      </TableRow>

                        {contractCurrency.id !== projectCurrency.id && (
                            <TableRow>
                                <TableCell className="font-medium">{`Курс Валюты ${projectCurrency.code} - ${contractCurrency.code}`}</TableCell>
                                <TableCell>{exchangeRate}</TableCell>
                            </TableRow>
                        )}


                      <TableRow>
                        <TableCell className="font-medium">Общая сумма</TableCell>
                        <TableCell>{formatCurrency(contractAmount, contractCurrency.code, contractCurrency.symbol)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Оплачено</TableCell>
                        <TableCell>{formatCurrency(paidAmount, contractCurrency.code, contractCurrency.symbol)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Осталось заплатить</TableCell>
                        <TableCell>{formatCurrency(contractAmount - paidAmount, contractCurrency.code, contractCurrency.symbol)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
        </div>
    );
};
export default FinancialDetail;