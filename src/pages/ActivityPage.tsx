import { Heart, Bell } from "lucide-react";

export default function ActivityPage() {
  return (
    <div className="max-w-[470px] mx-auto px-4 py-4">
      <h1 className="text-base font-semibold text-[#262626] mb-4">Atividade</h1>

      <div className="bg-white border border-[#dbdbdb] rounded-xl p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#efefef] flex items-center justify-center">
          <Heart className="w-8 h-8 text-[#8e8e8e]" />
        </div>
        <p className="text-lg font-semibold text-[#262626] mb-1">
          Atividade das suas publicações
        </p>
        <p className="text-sm text-[#8e8e8e]">
          Quando alguém curtir suas fotos, você verá aqui.
        </p>
      </div>

      <div className="mt-6 bg-white border border-[#dbdbdb] rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <Bell className="w-5 h-5 text-[#8e8e8e]" />
          <p className="text-sm font-semibold text-[#262626]">Notificações</p>
        </div>
        <p className="text-sm text-[#8e8e8e]">
          Em breve: notificações em tempo real de curtidas e seguidores.
        </p>
      </div>
    </div>
  );
}
