import { Navigate, Route } from "react-router-dom";
import NotFound from "@/pages/error/NotFound";
import Unauthorized from "@/pages/error/Unauthorized";

export function ErrorRoutes() {
  return (
    <>
      <Route path="/403" element={<Unauthorized />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </>
  );
}
