"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, getDocs, doc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { ReactNode, useEffect, useState } from 'react';
import { db } from './firebase';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface StudentData {
  id: string;
  personalInfo: {
    [x: string]: ReactNode;
    registrationNumber: string;
    name: string;
    acceptedClass: string;
    birthDate: string;
    idNumber: string;
  };
}

export default function StudentRecord() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, 'students'), orderBy('personalInfo.registrationNumber'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const studentsData: StudentData[] = [];
      querySnapshot.forEach((doc) => {
        studentsData.push({
          id: doc.id,
          ...doc.data()
        } as StudentData);
      });
      setStudents(studentsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (studentId: string) => {
    try {
      await deleteDoc(doc(db, 'students', studentId));
      alert('تم حذف الطالب بنجاح');
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('حدث خطأ أثناء حذف الطالب');
    }
    setDeleteDialogOpen(false);
    setSelectedStudentId(null);
  };

  const openDeleteDialog = (studentId: string) => {
    setSelectedStudentId(studentId);
    setDeleteDialogOpen(true);
  };

  const filteredStudents = students.filter(student => {
    const searchLower = searchQuery.toLowerCase();
    return (
      student.personalInfo.name?.toLowerCase().includes(searchLower) ||
      student.personalInfo.registrationNumber?.includes(searchQuery) ||
      student.personalInfo.idNumber?.includes(searchQuery)
    );
  });

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center" dir="rtl">
        <div className="flex items-center justify-center min-h-[200px]">
          جاري تحميل البيانات...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 text-right" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">سجل القيد العام</h1>
        <Button 
          onClick={() => router.push('/add_student')}
          size="lg"
        >
          إضافة طالب جديد
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="البحث عن طالب..."
            className="pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex justify-between items-center text-lg">
                <span>{student.personalInfo.name}{student.personalInfo.fatherName}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => openDeleteDialog(student.id)}
                >
                  حذف
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">رقم القيد:</span>
                  <span>{student.personalInfo.registrationNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">رقم الهوية:</span>
                  <span>{student.personalInfo.idNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الصف:</span>
                  <span>{student.personalInfo.acceptedClass}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">تاريخ الميلاد:</span>
                  <span>{new Date(student.personalInfo.birthDate).toLocaleDateString('ar-SA')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {students.length === 0 && (
        <div className="text-center p-8 text-muted-foreground">
          لا يوجد طلاب مسجلين
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الطالب؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedStudentId && handleDelete(selectedStudentId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}