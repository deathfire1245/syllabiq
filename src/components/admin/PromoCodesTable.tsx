"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Skeleton } from "../ui/skeleton";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PromoCode {
    id: string;
    code: string;
    percentage: number;
    isActive: boolean;
    usedBy: string[];
}

export function PromoCodesTable() {
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const codesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'promoCodes') : null, [firestore]);
  const { data: codes, isLoading, mutate } = useCollection<PromoCode>(codesQuery);

  const handleToggleActive = async (code: PromoCode) => {
    if (!firestore) return;
    const codeRef = doc(firestore, "promoCodes", code.id);
    try {
        await updateDoc(codeRef, { isActive: !code.isActive });
        toast({ title: "Success", description: `Code "${code.code}" has been ${!code.isActive ? 'activated' : 'deactivated'}.` });
    } catch(error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not update the code status.' });
    }
  };

  const handleDeleteCode = async (codeId: string) => {
     if (!firestore) return;
     const codeRef = doc(firestore, "promoCodes", codeId);
     try {
        await deleteDoc(codeRef);
        toast({ title: "Code Deleted", description: `The promo code has been permanently removed.` });
     } catch(error) {
         toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the code.' });
     }
  };

  return (
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/80">
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead className="text-center">Discount</TableHead>
              <TableHead className="text-center">Times Used</TableHead>
              <TableHead className="text-center">Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center"><Skeleton className="h-24 w-full" /></TableCell></TableRow>
            ) : codes && codes.length > 0 ? (
               codes.map((code) => (
                <TableRow key={code.id} className="hover:bg-accent transition-colors">
                  <TableCell className="font-mono font-medium">{code.code}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{code.percentage}%</Badge>
                  </TableCell>
                  <TableCell className="text-center">{code.usedBy?.length || 0}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                        checked={code.isActive}
                        onCheckedChange={() => handleToggleActive(code)}
                    />
                  </TableCell>
                   <TableCell className="text-right">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                                <Trash2 className="w-4 h-4"/>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the
                                <strong> {code.code}</strong> promo code.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteCode(code.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No promo codes found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
  );
}
