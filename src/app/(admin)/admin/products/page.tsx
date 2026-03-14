"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { PlusCircle, Edit, Trash2, Power, PowerOff } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function AdminProductsPage() {
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const productsQuery = useMemoFirebase(() => 
    firestore ? collection(firestore, "products") : null, 
    [firestore]
  );

  const { data: products, isLoading } = useCollection(productsQuery);

  const handleToggleStatus = async (productId: string, currentStatus: string) => {
    if (!firestore) return;
    const newStatus = currentStatus === "active" ? "draft" : "active";
    try {
      await updateDoc(doc(firestore, "products", productId), { status: newStatus });
      toast({ title: "Status Updated", description: `Product is now ${newStatus}.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update status." });
    }
  };

  const handleDelete = async (productId: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, "products", productId));
      toast({ title: "Product Deleted" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete product." });
    }
  };

  return (
    <div className="space-y-8">
      <ScrollReveal className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
          <p className="text-muted-foreground mt-1">Add and manage marketplace products.</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <PlusCircle className="w-4 h-4 mr-2" /> Add Product
          </Link>
        </Button>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle>All Products</CardTitle>
            <CardDescription>Catalog of all physical and digital items.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-secondary/50">
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={7}><Skeleton className="h-12 w-full" /></TableCell>
                      </TableRow>
                    ))
                  ) : products && products.length > 0 ? (
                    products.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <img src={p.imageUrl} alt={p.title} className="w-10 h-10 object-cover rounded" />
                        </TableCell>
                        <TableCell className="font-medium">{p.title}</TableCell>
                        <TableCell className="capitalize">{p.category}</TableCell>
                        <TableCell className="text-right">₹{p.price}</TableCell>
                        <TableCell className="text-center">{p.stock ?? "∞"}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={p.status === "active" ? "default" : "secondary"}>
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(p.id, p.status)}>
                            {p.status === "active" ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/products/${p.id}/edit`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                                <AlertDialogDescription>This will permanently remove "{p.title}".</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(p.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No products found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  );
}
