"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useDoc, useFirebase, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Product } from "@/lib/product-types";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ShoppingCart, Tag, Info } from "lucide-react";
import { BuyModal } from "@/components/marketplace/BuyModal";
import { ImageSlideshow } from "@/components/marketplace/ImageSlideshow";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const router = useRouter();
  const { firestore } = useFirebase();
  const [isBuyModalOpen, setIsBuyModalOpen] = React.useState(false);

  const productRef = useMemoFirebase(() => 
    firestore ? doc(firestore, "products", productId as string) : null,
    [firestore, productId]
  );

  const { data: product, isLoading } = useDoc<any>(productRef);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <Skeleton className="h-10 w-32" />
        <div className="grid md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Button onClick={() => router.push("/dashboard/marketplace")} className="mt-4">
          Back to Marketplace
        </Button>
      </div>
    );
  }

  const productImages = product.images?.length ? product.images : product.imageUrl ? [product.imageUrl] : [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <ScrollReveal>
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </ScrollReveal>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        <ScrollReveal delay={0.1} className="md:sticky md:top-24">
          <ImageSlideshow images={productImages} className="shadow-lg border" />
        </ScrollReveal>

        <ScrollReveal delay={0.2} className="space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="px-3 py-1 text-sm capitalize">
              {product.category}
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight">{product.title}</h1>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-primary">₹{product.price}</span>
              {product.stock !== null && (
                <Badge variant={product.stock > 0 ? "outline" : "destructive"}>
                  {product.stock > 0 ? `${product.stock} units available` : "Sold Out"}
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-4 border-t pt-6">
            <h3 className="font-bold flex items-center gap-2">
              <Info className="w-4 h-4" /> Description
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <Tag className="w-4 h-4" /> Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag: string) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          </div>

          <Button 
            size="lg" 
            className="w-full md:w-auto px-12" 
            onClick={() => setIsBuyModalOpen(true)}
            disabled={product.stock !== null && product.stock <= 0}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Buy Now
          </Button>
        </ScrollReveal>
      </div>

      <BuyModal 
        product={product} 
        isOpen={isBuyModalOpen} 
        onClose={() => setIsBuyModalOpen(false)} 
      />
    </div>
  );
}
