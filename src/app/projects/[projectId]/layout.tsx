export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <aside>
        <nav>
          <li>
            <a href="#">Home</a>
          </li>
        </nav>
      </aside>
      <section>{children}</section>
    </>
  );
}
