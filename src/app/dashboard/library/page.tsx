"use client";

import * as React from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCollection, useFirebase, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, doc, query, where } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { BookCopy, ShoppingBag, Download, Package } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductOrder } from "@/lib/product-types";

interface Course {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  imageHint: string;
  price: string;
  category: string;
  difficulty: string;
  lessons: number;
}

export default function LibraryPage() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();

  const coursesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'courses');
  }, [firestore]);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const ordersQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, "productOrders"), where("buyerId", "==", user.uid));
  }, [user, firestore]);

  const { data: allCourses, isLoading: areCoursesLoading } = useCollection<Course>(coursesQuery);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);
  const { data: productOrders, isLoading: areOrdersLoading } = useCollection<ProductOrder>(ordersQuery);

  const enrolledCourses = React.useMemo(() => {
    if (!allCourses || !userProfile?.studentProfile?.enrolledCourses) {
        return [];
    }
    const enrolledIds = userProfile.studentProfile.enrolledCourses;
    return allCourses.filter(course => enrolledIds.includes(course.id));
  }, [allCourses, userProfile]);

  const isLoading = areCoursesLoading || isProfileLoading || isUserLoading || areOrdersLoading;

  if (isLoading) {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-6 w-2/3" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
    )
  }

  return (
    <div className="space-y-8">
      <ScrollReveal>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">My Library</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Access your courses and marketplace purchases.
        </p>
      </ScrollReveal>
      
      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="courses">Courses ({enrolledCourses.length})</TabsTrigger>
          <TabsTrigger value="purchases">My Purchases ({productOrders?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          {enrolledCourses.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {enrolledCourses.map((course, index) => (
                  <ScrollReveal key={course.id} delay={index * 0.1}>
                    <Card className="group relative overflow-hidden transform transition-all duration-300 hover:shadow-xl h-full flex flex-col">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                               <Badge variant="outline">{course.category}</Badge>
                               <Badge variant="secondary">{course.difficulty}</Badge>
                            </div>
                            <CardTitle className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
                              {course.title}
                            </CardTitle>
                            <CardDescription className="text-sm mt-1">by {course.author}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {course.description}
                        </p>
                      </CardContent>
                      <CardFooter className="flex justify-end bg-secondary/50 p-4">
                         <Button asChild>
                            <Link href={`/dashboard/courses/${course.id}`}>View Course</Link>
                         </Button>
                      </CardFooter>
                    </Card>
                  </ScrollReveal>
                ))}
              </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[40vh] text-center bg-secondary/10 rounded-xl border-2 border-dashed">
                <BookCopy className="w-12 h-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-bold">Your Library is Empty</h2>
                <p className="text-muted-foreground mt-2 max-w-xs">
                  You haven't purchased any courses yet.
                </p>
                <Button asChild className="mt-6">
                  <Link href="/dashboard/courses">Explore Courses</Link>
                </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="purchases">
          {productOrders && productOrders.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {productOrders.map((order, index) => (
                <ScrollReveal key={order.id} delay={index * 0.1}>
                  <Card className="flex flex-col h-full border-primary/10">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <Badge variant="secondary" className="capitalize">{order.productCategory}</Badge>
                        <Badge className={order.status === 'PAID' ? "bg-green-100 text-green-800" : ""}>
                          {order.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mt-4">{order.productTitle || "Product Item"}</CardTitle>
                      <CardDescription>Paid: ₹{order.amount}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      {order.productCategory === 'physical' && order.deliveryInfo && (
                        <div className="text-sm space-y-2 bg-secondary/30 p-3 rounded-lg">
                          <p className="font-semibold flex items-center gap-2"><Package className="w-4 h-4" /> Shipping Info:</p>
                          <p>{order.deliveryInfo.name}</p>
                          <p className="text-muted-foreground text-xs">{order.deliveryInfo.address}</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="p-4 border-t bg-secondary/20">
                      {order.status === 'PAID' && order.productCategory !== 'physical' && order.fileUrl && (
                        <Button asChild className="w-full">
                          <a href={order.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-2" /> Download
                          </a>
                        </Button>
                      )}
                      {order.productCategory === 'physical' && (
                        <p className="text-xs text-muted-foreground w-full text-center">Tracking info will be updated soon.</p>
                      )}
                    </CardFooter>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[40vh] text-center bg-secondary/10 rounded-xl border-2 border-dashed">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-bold">No Purchases Yet</h2>
                <p className="text-muted-foreground mt-2 max-w-xs">
                  Check out our marketplace for books and tools.
                </p>
                <Button asChild className="mt-6">
                  <Link href="/dashboard/marketplace">Browse Marketplace</Link>
                </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
