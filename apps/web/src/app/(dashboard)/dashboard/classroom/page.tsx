import { Header } from '@/components/layout/header';
import { ClassroomView } from '@/components/classroom/classroom-view';

export default function ClassroomPage() {
  return (
    <div className="animate-in">
      <Header title="Classroom" subtitle="Cybersecurity training courses, live simulations, and XP-based progression" />
      <div style={{ padding: 24 }}>
        <ClassroomView />
      </div>
    </div>
  );
}
