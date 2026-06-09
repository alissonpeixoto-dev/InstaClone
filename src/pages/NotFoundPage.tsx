import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { AlertCircle } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4 py-8">
      <div className="max-w-md w-full bg-white border border-[#dbdbdb] rounded-3xl p-8 text-center shadow-sm">
        <AlertCircle className="w-12 h-12 text-[#fd1d1d] mx-auto mb-4" />
        <h1 className="text-3xl font-semibold text-[#262626] mb-3">Página não encontrada</h1>
        <p className="text-sm text-[#8e8e8e] mb-6">
          A página que você procura não existe ou foi removida.
        </p>
        <Button onClick={() => navigate("/")}>Voltar ao feed</Button>
      </div>
    </div>
  );
}
