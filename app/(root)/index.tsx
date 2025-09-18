import { ReactNode } from "react";
import Home from "./home";

export default function Page({ children }: { children?: ReactNode }) {
  const toggleSidebar = () => {
    // Implement sidebar toggle logic here or leave empty if not needed
  };

  return <>{children ? children : <Home toggleSidebar={toggleSidebar} />}</>;
}
