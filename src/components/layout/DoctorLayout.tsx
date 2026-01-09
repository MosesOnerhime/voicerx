import { ReactNode } from 'react';
import { DoctorSidebar } from './DoctorSidebar'; // Correct: same folder
import { TopHeader } from './TopHeader';       // Correct: same folder

interface DoctorLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function DoctorLayout({ children, title, subtitle }: DoctorLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <DoctorSidebar />
      <div className="pl-64">
        <TopHeader title={title} subtitle={subtitle} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
