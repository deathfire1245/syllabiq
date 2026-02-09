"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Skeleton } from "../ui/skeleton";
import { getSubjects } from "@/lib/data";

interface Course {
    id: string;
    title: string;
    author: string;
    price: string;
    category: string;
    difficulty: string;
    lessons: number;
}

export function AdminCoursesTable() {
  const { firestore } = useFirebase();
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [difficultyFilter, setDifficultyFilter] = React.useState('all');
  const [searchTerm, setSearchTerm] = React.useState('');
  const allSubjects = getSubjects();

  const coursesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'courses') : null, [firestore]);
  const { data: courses, isLoading } = useCollection<Course>(coursesQuery);
  
  const filteredCourses = React.useMemo(() => {
    if (!courses) return [];
    
    let filtered = courses;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(c => c.category === categoryFilter);
    }
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(c => c.difficulty === difficultyFilter);
    }
    
    if (searchTerm) {
        const lowercasedFilter = searchTerm.toLowerCase();
        filtered = filtered.filter(c => 
            c.title?.toLowerCase().includes(lowercasedFilter) || 
            c.author?.toLowerCase().includes(lowercasedFilter)
        );
    }
    
    return filtered;
  }, [courses, categoryFilter, difficultyFilter, searchTerm]);


  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input 
          placeholder="Filter by Title or Author..." 
          className="max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {allSubjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.name}>{subject.name}</SelectItem>
                ))}
            </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Difficulty" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/80">
            <TableRow>
              <TableHead>Course Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-center">Lessons</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center"><Skeleton className="h-24 w-full" /></TableCell></TableRow>
            ) : filteredCourses && filteredCourses.length > 0 ? (
               filteredCourses.map((course) => (
                <TableRow key={course.id} className="hover:bg-accent transition-colors">
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>{course.author}</TableCell>
                  <TableCell><Badge variant="outline">{course.category}</Badge></TableCell>
                  <TableCell><Badge variant="secondary">{course.difficulty}</Badge></TableCell>
                  <TableCell className="text-right font-mono">₹{course.price}</TableCell>
                  <TableCell className="text-center">{course.lessons}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={6} className="text-center">No courses found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
