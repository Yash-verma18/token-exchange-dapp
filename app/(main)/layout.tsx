import Navbar from "@/components/Navbar";
import MainMenu from "@/components/main-menu";

type Props = {
  children?: React.ReactNode;
};

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="grid grid-cols-[350px_1fr] h-screen">
      <MainMenu />
      <div className="overflow-auto py-2 px-4">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
