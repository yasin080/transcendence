type UserCardProps = {
  name: string;
  avatarUrl: string;
};

export default function UserCard({ name, avatarUrl }: UserCardProps) {
  return (
    <div className="flex flex-col items-center gap-3 p-6">
      <img
        src={avatarUrl}
        alt={`Avatar de ${name}`}
        className="w-20 h-20 rounded-full object-cover"
      />
      <span className="text-lg font-semibold">{name}</span>
    </div>
  );
}