export default function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-xs uppercase tracking-widest text-brand font-sans font-medium mb-4">
      {children}
    </span>
  );
}
