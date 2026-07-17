export function SectionHeading({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h2 id={id} className="scroll-mt-24 text-xl font-semibold tracking-tight">
      {children}
    </h2>
  );
}
