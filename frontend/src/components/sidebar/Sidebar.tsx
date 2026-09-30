
type SidebarProps = {
  width?: number;
  children?: React.ReactNode;
};

export default function LeftSidebar({ width = 268, children }: SidebarProps) {
  return (
    <aside style={{ width, flexShrink: 0, height: "100%", color: "red" }}>
      {children}
    </aside>
  );
}