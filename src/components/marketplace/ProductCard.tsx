"use client";

import * as React from "react";
import { Product } from "@/lib/product-types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { ImageSlideshow } from "./ImageSlideshow";

interface ProductCardProps {
  product: Product;
  onBuy: (product: Product) => void;
}

export function ProductCard({ product, onBuy }: ProductCardProps) {
  // Handle backward compatibility for images
  const productImages = product.images?.length 
    ? product.images 
    : (product as any).imageUrl 
      ? [(product as any).imageUrl] 
      : [];

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg group">
      <div className="relative aspect-square overflow-hidden bg-secondary/20">
        <Link href={`/dashboard/marketplace/${product.id}`} className="block w-full h-full">
          <ImageSlideshow images={productImages} className="rounded-none border-none shadow-none h-full w-full" />
        </Link>
        <div className="absolute top-2 left-2 z-10">
          <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm">
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </Badge>
        </div>
      </div>
      <CardHeader className="p-4 pb-2">
        <Link href={`/dashboard/marketplace/${product.id}`}>
          <CardTitle className="text-lg line-clamp-1 hover:text-primary transition-colors">
            {product.title}
          </CardTitle>
        </Link>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {product.description}
        </p>
        <p className="text-2xl font-bold text-primary">₹{product.price}</p>
        {product.stock !== null && (
          <p className="text-xs text-muted-foreground mt-1">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full" 
          onClick={() => onBuy(product)}
          disabled={product.stock !== null && product.stock <= 0}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Buy Now
        </Button>
      </CardFooter>
    </Card>
  );
}
