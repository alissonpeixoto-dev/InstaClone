import { Heart, Bell, MessageCircle, UserPlus } from "lucide-react";
import { useActivities } from "@/hooks/useActivities";
import { Avatar } from "@/components/ui/Avatar";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export default function ActivityPage() {
  const { activities, loading } = useActivities();
  const navigate = useNavigate();

  const getActivityText = (activity: ReturnType<typeof useActivities>["activities"][0]) => {
    switch (activity.type) {
      case "like":
        return "curtiu sua publicação";
      case "follow":
        return "começou a seguir você";
      case "comment":
        return "comentou em sua publicação";
      default:
        return "interagiu com você";
    }
  };

  const getActivityIcon = (activity: ReturnType<typeof useActivities>["activities"][0]) => {
    switch (activity.type) {
      case "like":
        return <Heart className="w-5 h-5 text-red-500 fill-red-500" />;
      case "follow":
        return <UserPlus className="w-5 h-5 text-blue-500" />;
      case "comment":
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-[470px] mx-auto px-4 py-4">
        <h1 className="text-base font-semibold text-[#262626] mb-4">Atividade</h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[470px] mx-auto px-4 py-4">
      <h1 className="text-base font-semibold text-[#262626] mb-4">Atividade</h1>

      {activities.length === 0 ? (
        <>
          <div className="bg-white border border-[#dbdbdb] rounded-xl p-12 text-center mb-6">
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

          <div className="bg-white border border-[#dbdbdb] rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <Bell className="w-5 h-5 text-[#8e8e8e]" />
              <p className="text-sm font-semibold text-[#262626]">Dicas</p>
            </div>
            <p className="text-sm text-[#8e8e8e]">
              Quando usuários seguirem, curtirem ou comentarem em suas publicações, você receberá notificações aqui.
            </p>
          </div>
        </>
      ) : (
        <div className="space-y-1">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-3 hover:bg-[#f5f5f5] rounded-lg cursor-pointer transition"
              onClick={() => navigate(`/profile/${activity.user.username}`)}
            >
              {/* Avatar */}
              <Avatar src={activity.user.avatar_url} alt={activity.user.username} />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm text-[#262626]">
                      <span className="font-semibold">{activity.user.username}</span>
                      {" "}
                      <span className="text-[#8e8e8e]">{getActivityText(activity)}</span>
                    </p>
                    {activity.comment && (
                      <p className="text-sm text-[#8e8e8e] mt-1">
                        "{activity.comment}"
                      </p>
                    )}
                    {activity.postCaption && (
                      <p className="text-sm text-[#8e8e8e] mt-1 truncate">
                        {activity.postCaption}
                      </p>
                    )}
                    <p className="text-xs text-[#8e8e8e] mt-1">
                      {formatDistanceToNow(new Date(activity.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>

                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
