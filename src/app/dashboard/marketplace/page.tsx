"use client";

import * as React from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Product, ProductCategory } from "@/lib/product-types";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { BuyModal } from "@/components/marketplace/BuyModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const categories: (ProductCategory | "all")[] = ["all", "digital", "physical"];

export default function MarketplacePage() {
  const { firestore } = useFirebase();
  const [selectedCategory, setSelectedCategory] = React.useState<ProductCategory | "all">("all");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = React.useState(false);

  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    let baseQuery = collection(firestore, "products");
    const constraints: any[] = [where("status", "==", "active")];
    if (selectedCategory !== "all") {
      constraints.push(where("category", "==", selectedCategory));
    }
    return query(baseQuery, ...constraints);
  }, [firestore, selectedCategory]);

  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  const filteredProducts = React.useMemo(() => {
    if (!products) return [];
    if (!searchTerm) return products;
    return products.filter(p => 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const handleBuy = (product: Product) => {
    setSelectedProduct(product);
    setIsBuyModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <ScrollReveal>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
            <p className="text-muted-foreground mt-1">Discover study materials and educational tools.</p>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
              className="capitalize"
              size="sm"
            >
              {cat}
            </Button>
          ))}
        </div>
      </ScrollReveal>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-80 w-full rounded-lg" />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product, index) => (
            <ScrollReveal key={product.id} delay={index * 0.05}>
              <ProductCard product={product} onBuy={handleBuy} />
            </ScrollReveal>
          ))}
        </div>
      ) : (
        <ScrollReveal delay={0.2} className="text-center py-20 bg-secondary/20 rounded-xl border-2 border-dashed">
          <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold">No products found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search term.</p>
        </ScrollReveal>
      )}

      <BuyModal 
        product={selectedProduct} 
        isOpen={isBuyModalOpen} 
        onClose={() => setIsBuyModalOpen(false)} 
      />
    </div>
  );
}
