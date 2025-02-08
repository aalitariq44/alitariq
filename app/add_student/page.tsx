"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { addDoc, collection } from 'firebase/firestore';
import { useState } from 'react';
import { db } from '.././firebase';

interface StudentData {
  registrationNumber: string;
  name: string;
  fatherName: string;
  fatherAddress: string;
  fatherOccupation: string;
  guardian: string;
  motherName: string;
  idNumber: string;
  birthPlace: string;
  birthDate: string;
  nationality: string;
  schoolEntryDate: string;
  acceptedClass: string;
  previousSchool: string;
  leaveDate: string;
}

interface GradeColumn {
  id: string;
  grade: string;
  grades: { [subject: string]: string };
}

export default function StudentRecord() {
  const initialSubjects = [
    'القرآن الكريم وتلاوته',
    'التربية الإسلامية',
    'اللغة العربية والخط',
    'اللغة الإنجليزية',
    'الرياضيات',
    'التاريخ',
    'الجغرافية',
    'التربية الوطنية',
    'التربية الاجتماعية والاخلاقية',
    'العلوم',
    'التربية الفنية والاعمال اليدوية',
    'التربية الرياضية',
    'النشيد والموسيقى',
    'التربية الاسرية',
    'التربية الزراعية',
    'المجموع',
    'ملاحظات عن النتائج',
    'النتيجة النهائية'
  ];

  const grades = [
    'الأول الابتدائي',
    'الثاني الابتدائي',
    'الثالث الابتدائي',
    'الرابع الابتدائي',
    'الخامس الابتدائي',
    'السادس الابتدائي'
  ];

  const allGrades = [
    'الأول الابتدائي',
    'الثاني الابتدائي',
    'الثالث الابتدائي',
    'الرابع الابتدائي',
    'الخامس الابتدائي',
    'السادس الابتدائي',
    'الأول المتوسط',
    'الثاني المتوسط',
    'الثالث المتوسط',
    'الرابع العلمي',
    'الخامس العلمي',
    'السادس العلمي',
    'الرابع الأدبي',
    'الخامس الأدبي',
    'السادس الأدبي'
  ];

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(initialSubjects.slice(0, -3));
  const [showSettings, setShowSettings] = useState(false);
  const [gradeColumns, setGradeColumns] = useState<GradeColumn[]>([
    {
      id: '1',
      grade: grades[0],
      grades: Object.fromEntries(selectedSubjects.map(subject => [subject, '']))
    }
  ]);

  const [studentData, setStudentData] = useState<StudentData>({
    registrationNumber: '',
    name: '',
    fatherName: '',
    fatherAddress: '',
    fatherOccupation: '',
    guardian: '',
    motherName: '',
    idNumber: '',
    birthPlace: '',
    birthDate: '',
    nationality: '',
    schoolEntryDate: '',
    acceptedClass: '',
    previousSchool: '',
    leaveDate: ''
  });

  const addGradeColumn = () => {
    const newColumn: GradeColumn = {
      id: (gradeColumns.length + 1).toString(),
      grade: grades[0],
      grades: Object.fromEntries(selectedSubjects.map(subject => [subject, '']))
    };
    setGradeColumns([...gradeColumns, newColumn]);
  };

  const removeGradeColumn = (columnId: string) => {
    setGradeColumns(gradeColumns.filter(column => column.id !== columnId));
  };

  const handleGradeChange = (columnId: string, subject: string, value: string) => {
    setGradeColumns(prev => prev.map(column => {
      if (column.id === columnId) {
        return {
          ...column,
          grades: {
            ...column.grades,
            [subject]: value
          }
        };
      }
      return column;
    }));
  };

  const handleGradeSelection = (columnId: string, grade: string) => {
    setGradeColumns(prev => prev.map(column => {
      if (column.id === columnId) {
        return {
          ...column,
          grade
        };
      }
      return column;
    }));
  };

  const handleSubjectSelection = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleInputChange = (field: keyof StudentData, value: string) => {
    setStudentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      const studentDoc = {
        personalInfo: studentData,
        gradeColumns: gradeColumns,
        selectedSubjects: selectedSubjects
      };

      await addDoc(collection(db, 'students'), studentDoc);
      alert('تم حفظ بيانات الطالب بنجاح!');
      
      setStudentData({
        registrationNumber: '',
        name: '',
        fatherName: '',
        fatherAddress: '',
        fatherOccupation: '',
        guardian: '',
        motherName: '',
        idNumber: '',
        birthPlace: '',
        birthDate: '',
        nationality: '',
        schoolEntryDate: '',
        acceptedClass: '',
        previousSchool: '',
        leaveDate: ''
      });
      
      setGradeColumns([{
        id: '1',
        grade: grades[0],
        grades: Object.fromEntries(selectedSubjects.map(subject => [subject, '']))
      }]);

    } catch (error) {
      console.error('Error saving data:', error);
      alert('حدث خطأ أثناء حفظ البيانات');
    }
  };

  const renderInputField = (label: string, field: keyof StudentData, type: string = 'text') => (
    <div>
      <Label>{label}</Label>
      <Input
        type={type}
        value={studentData[field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
      />
    </div>
  );

  return (
    <div className="container mx-auto p-4 text-right" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">سجل القيد العام : ١</h1>
        <div className="space-x-4 space-x-reverse">
          <Button 
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            size="lg"
          >
            إعدادات المواد
          </Button>
          <Button 
            variant="outline"
            size="lg"
          >
            إضافة صورة الطالب
          </Button>
        </div>
      </div>

      {showSettings && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>إعدادات المواد</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {initialSubjects.slice(0, -3).map(subject => (
                <div key={subject} className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(subject)}
                    onChange={() => handleSubjectSelection(subject)}
                    className="w-4 h-4"
                  />
                  <label>{subject}</label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>المعلومات الشخصية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {renderInputField('رقم القيد', 'registrationNumber', 'number')}
            {renderInputField('اسم الطالب', 'name')}
            {renderInputField('اسم الأب وشهرته', 'fatherName')}
            {renderInputField('مسكن الأب', 'fatherAddress')}
            {renderInputField('صنعة الأب وعنوانه', 'fatherOccupation')}
            {renderInputField('اسم ولي أمر الطالب', 'guardian')}
            {renderInputField('اسم الأم', 'motherName')}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>المعلومات الاضافية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {renderInputField('رقم دفتر نفوس الطالب', 'idNumber', 'number')}
            {renderInputField('مسقط الرأس', 'birthPlace')}
            {renderInputField('تاريخ الولادة', 'birthDate', 'date')}
            {renderInputField('الجنسية', 'nationality')}
            {renderInputField('تاريخ دخول المدرسة', 'schoolEntryDate', 'date')}
            <div>
              <Label>الصف الذي قبل فيه</Label>
              <Select
                value={studentData.acceptedClass}
                onValueChange={(value) => handleInputChange('acceptedClass', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر الصف" />
                </SelectTrigger>
                <SelectContent>
                  {allGrades.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {renderInputField('آخر مدرسة كان فيها', 'previousSchool')}
            {renderInputField('تاريخ المغادرة', 'leaveDate', 'date')}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>درجات المواد</span>
            <Button
              onClick={addGradeColumn}
              variant="outline"
              size="sm"
            >
              إضافة صف دراسي
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">المواد</TableHead>
                {gradeColumns.map((column) => (
                  <TableHead key={column.id} className="text-center min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <Select
                        value={column.grade}
                        onValueChange={(grade) => handleGradeSelection(column.id, grade)}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="اختر الصف" />
                        </SelectTrigger>
                        <SelectContent>
                          {grades.map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {gradeColumns.length > 1 && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeGradeColumn(column.id)}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedSubjects.map((subject) => (
                <TableRow key={subject}>
                  <TableCell className="font-medium bg-muted">{subject}</TableCell>
                  {gradeColumns.map((column) => (
                    <TableCell key={column.id}>
                      <Input
                        value={column.grades[subject] || ''}
                        onChange={(e) => handleGradeChange(column.id, subject, e.target.value)}
                        className="text-center"
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Button 
        size="lg" 
        onClick={handleSave}
        className="w-full"
      >
        حفظ بيانات الطالب
      </Button>
    </div>
  );
}