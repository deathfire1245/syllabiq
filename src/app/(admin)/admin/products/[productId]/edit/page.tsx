"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useFirebase, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { UploadButton } from "@/lib/uploadthing";
import { Check, Upload, ArrowLeft, Plus, Trash2, Info } from "lucide-react";
import Link from "next/link";
import { Product } from "@/lib/product-types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function EditProductPage() {
  const { productId } = useParams();
  const router = useRouter();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [newImageUrl, setNewImageUrl] = React.useState("");

  const productRef = useMemoFirebase(() => 
    firestore ? doc(firestore, "products", productId as string) : null,
    [firestore, productId]
  );

  const { data: product, isLoading } = useDoc<any>(productRef);

  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    price: "",
    category: "digital",
    images: [] as string[],
    fileUrl: "",
    stock: "",
    tags: "",
    status: "active",
  });

  React.useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        description: product.description,
        price: String(product.price),
        category: product.category,
        // Backward compatibility check
        images: product.images?.length ? product.images : product.imageUrl ? [product.imageUrl] : [],
        fileUrl: product.fileUrl,
        stock: product.stock !== null ? String(product.stock) : "",
        tags: product.tags?.join(", ") || "",
        status: product.status,
      });
    }
  }, [product]);

  const addImage = () => {
    if (!newImageUrl.trim()) return;
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, newImageUrl.trim()]
    }));
    setNewImageUrl("");
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !product) return;
    if (formData.images.length === 0) {
      toast({ variant: "destructive", title: "Error", description: "Please add at least one image." });
      return;
    }
    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        images: formData.images,
        fileUrl: formData.fileUrl,
        stock: formData.category === "physical" ? Number(formData.stock) : null,
        tags: formData.tags.split(",").map(t => t.trim()).filter(t => t),
        status: formData.status,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(firestore, "products", product.id), payload);
      toast({ title: "Product Updated" });
      router.push("/admin/products");
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update product." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="max-w-3xl mx-auto space-y-8"><Skeleton className="h-12 w-48" /><Skeleton className="h-[600px] w-full" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/products"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input id="price" type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="digital">Digital</SelectItem>
                    <SelectItem value="physical">Physical</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Media & Assets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Product Images</Label>
              <div className="flex flex-col gap-3">
                {formData.images.map((url, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 border rounded-lg bg-secondary/20 group">
                    <img 
                      src={url} 
                      alt="Preview" 
                      className="w-12 h-12 object-cover rounded border bg-white" 
                      onError={(e) => (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=Error"}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate text-muted-foreground">{url}</p>
                      {idx === 0 && <Badge variant="secondary" className="mt-1 text-[10px] h-4">Cover Image</Badge>}
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeImage(idx)}
                      className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                
                <div className="flex gap-2">
                  <Input 
                    placeholder="Paste image URL (e.g. https://i.postimg.cc/...)" 
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
                  />
                  <Button type="button" onClick={addImage} variant="secondary">
                    <Plus className="w-4 h-4 mr-2" /> Add
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Info className="w-3 h-3" /> First image will be used as the cover.
                </p>
              </div>
            </div>

            {formData.category !== "physical" && (
              <div className="space-y-2 pt-4 border-t">
                <Label>Product File</Label>
                {formData.fileUrl ? (
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <Check className="w-4 h-4" /> File Attached
                    <Button variant="link" size="sm" onClick={() => setFormData({...formData, fileUrl: ""})}>Replace</Button>
                  </div>
                ) : (
                  <UploadButton
                    endpoint="coursePdfUploader"
                    onClientUploadComplete={(res) => {
                      if (res?.[0]) setFormData({...formData, fileUrl: res[0].url});
                    }}
                    onUploadError={(e) => toast({ variant: "destructive", title: "Upload Failed", description: e.message })}
                    content={{ button: <div className="flex items-center gap-2"><Upload className="w-4 h-4" /> Update Product File</div> }}
                    className="ut-button:bg-primary ut-button:w-full"
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory & Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Level</Label>
                <Input 
                  id="stock" 
                  type="number" 
                  value={formData.stock} 
                  onChange={e => setFormData({...formData, stock: e.target.value})} 
                  disabled={formData.category !== "physical"}
                />
              </div>
              <div className="flex items-center space-x-2 h-10">
                <Switch checked={formData.status === "active"} onCheckedChange={v => setFormData({...formData, status: v ? "active" : "draft"})} />
                <Label>Product is {formData.status}</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (Comma separated)</Label>
              <Input id="tags" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Update Product"}
        </Button>
      </form>
    </div>
  );
}
